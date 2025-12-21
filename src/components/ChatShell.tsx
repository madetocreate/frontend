"use client";

import { useState, FormEvent, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import clsx from "clsx";
import { 
  ClipboardDocumentIcon, 
  BookmarkIcon, 
  ArrowPathIcon, 
  SpeakerWaveIcon, 
  PencilSquareIcon, 
  SparklesIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  EllipsisHorizontalIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  DocumentIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { WidgetRenderer } from "./chat/WidgetRenderer";
import { sendChatMessageStream, ChatResponse } from "../lib/chatClient";
import { fetchFastActions, type FastActionSuggestion } from "../lib/fastActionsClient";
import { filterDuplicateTextUiMessages } from "../lib/uiMessageText";
import { useDictation } from "../hooks/useDictation";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { ThinkingStepsDrawer } from "./chat/ThinkingStepsDrawer";
import { ChatMarkdown } from "./chat/markdown/ChatMarkdown";
import { normalizeChatMarkdown } from "./chat/markdown/normalizeChatMarkdown";
import { FastActionsChips } from "./chat/FastActionsChips";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useChatThreads, setActiveThreadId, updateChatThread, writeChatThreads } from "../lib/chatThreadsStore";
import { useSearchParams } from "next/navigation";
// import { currentIndustry } from "../lib/featureFlags"; // Not used
import { useTranslation } from "../i18n";
import { ContextCardRenderer } from "./chat/cards";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  uiMessages?: ChatResponse["uiMessages"];
};

type ThinkingStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
  details?: string;
};

export function ChatShell() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [tenantId] = useState<string>("aklow-main");
  // const [hostname, setHostname] = useState<string | null>(null); // Not used
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [quickHint, setQuickHint] = useState<string>("");
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [thinkingNote, setThinkingNote] = useState<string | null>(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  
  // Hostname check removed - profession-specific features archived
  // useEffect(() => {
  //   setHostname(typeof window !== "undefined" ? window.location.hostname : null);
  // }, []);


  const [hoveredTooltip, setHoveredTooltip] = useState<{ messageId: string; icon: string } | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredUserMessageId, setHoveredUserMessageId] = useState<string | null>(null);
  const hoverUserMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const [fastActionsOpenMessageId, setFastActionsOpenMessageId] = useState<string | null>(null);
  const [fastActionsByMessageId, setFastActionsByMessageId] = useState<Record<string, FastActionSuggestion[]>>({});
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, "thumbs_up" | "thumbs_down">>({});
  const [expandedActions, setExpandedActions] = useState<Record<string, boolean>>({});
  const [showThinkingInline, setShowThinkingInline] = useState<Record<string, boolean>>({});
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const [attachments, setAttachments] = useState<{ id: string; name: string; type: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type
      };
      setAttachments(prev => [...prev, newAttachment]);
    }
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => id !== a.id));
  };

  const isDebug = typeof window !== "undefined" && (window.location.search.includes("debug=1") || localStorage.getItem("aklow-debug") === "1");

  const { threads, activeThreadId: storeActiveThreadId } = useChatThreads();
  const [activeThreadId, setActiveThreadIdLocal] = useState<string>(storeActiveThreadId || "thread-default");
  
  // Ambient Mode based on content
  const ambientColor = useMemo(() => {
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    if (!lastMsg) return "bg-white"; // Default neutral
    
    const text = lastMsg.text.toLowerCase();
    if (text.includes("code") || text.includes("function") || text.includes("api")) return "bg-indigo-50/30";
    if (text.includes("marketing") || text.includes("text") || text.includes("email")) return "bg-purple-50/30";
    if (text.includes("error") || text.includes("bug") || text.includes("fix")) return "bg-red-50/30";
    if (text.includes("data") || text.includes("chart") || text.includes("analysis")) return "bg-emerald-50/30";
    
    return "bg-white";
  }, [messages]);

  // Latest refs for stable event listeners
  const messagesRef = useRef<ChatMessage[]>([]);
  const isSendingRef = useRef(false);
  const activeThreadIdRef = useRef(activeThreadId);
  const viewTransitionRef = useRef<{ transition: ReturnType<typeof document.startViewTransition> | null }>({ transition: null });
  const inputLatestRef = useRef("");

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isSendingRef.current = isSending; }, [isSending]);
  useEffect(() => { activeThreadIdRef.current = activeThreadId; }, [activeThreadId]);
  useEffect(() => { inputLatestRef.current = input; }, [input]);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const isNearBottomRef = useRef(true);

  const currentThreadRef = useRef<string | null>(storeActiveThreadId || "thread-default");
  
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { supported: ttsSupported, speakingId, toggle: toggleTts, stop: stopTts } =
    useSpeechSynthesis("de-DE");

  const { status: dictationStatus, startRecording, stopRecording } = useDictation({
    onTranscriptionReady: (text) => {
      setInput((prev) => prev + (prev ? " " : "") + text);
    },
  });

  const [audioLevel, setAudioLevel] = useState(0);
  const [audioBands, setAudioBands] = useState<number[]>(Array(20).fill(0));
  const audioLevelIntervalRef = useRef<number | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [fakeWaveLevels, setFakeWaveLevels] = useState<number[]>(Array(20).fill(0.3));
  const fakeWaveIntervalRef = useRef<number | null>(null);

  const {
    status: realtimeStatus,
    press: pressRealtime,
    release: releaseRealtime,
    stopAll: stopRealtimeAll,
  } = useRealtimeVoice({
    onStart: () => {
      console.log("Real-time Audio gestartet");
      startAudioLevelMeasurement();
    },
    onStop: () => {
      console.log("Real-time Audio gestoppt");
      stopAudioLevelMeasurement();
      setAudioLevel(0);
    },
    onTextDelta: (text: string) => {
      console.log("Realtime delta:", text);
      // Optional: könnte in QuickHint landen, aktuell nur Log
    },
  });

  // Funktion zum Starten der Audio-Level-Messung
  const startAudioLevelMeasurement = useCallback(async () => {
    try {
      let stream = audioStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
      }
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; // Smaller for more responsive visuals
      analyser.smoothingTimeConstant = 0.4; // Less smoothing for sharper movement
      
      source.connect(analyser);
      audioAnalyserRef.current = analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      audioDataArrayRef.current = dataArray;
      
      const measureAudio = () => {
        if (audioAnalyserRef.current && audioDataArrayRef.current) {
          audioAnalyserRef.current.getByteFrequencyData(
            audioDataArrayRef.current as unknown as Uint8Array<ArrayBuffer>
          );
          
          let sum = 0;
          for (let i = 0; i < audioDataArrayRef.current.length; i++) {
            sum += audioDataArrayRef.current[i];
          }
          const average = sum / audioDataArrayRef.current.length;
          const normalizedLevel = average / 255;
          
          setAudioLevel(normalizedLevel);

          const bands: number[] = [];
          const data = audioDataArrayRef.current;
          for (let i = 0; i < 20; i++) {
            // Focus on lower frequencies for speech (indices 0-30 usually)
            const freqIndex = Math.floor((i / 20) * (data.length * 0.6));
            bands.push(data[freqIndex] / 255);
          }
          setAudioBands(bands);
          
          const stillActive = dictationStatus === "recording" || 
                              dictationStatus === "transcribing" || 
                              realtimeStatus === "holding" || realtimeStatus === "assistant" || realtimeStatus === "connecting";
          
          if (stillActive) {
            audioLevelIntervalRef.current = requestAnimationFrame(measureAudio);
          }
        }
      };
      
      measureAudio();
    } catch (error) {
      console.error("Fehler beim Starten der Audio-Level-Messung:", error);
    }
  }, [dictationStatus, realtimeStatus]);

  // Funktion zum Stoppen der Audio-Level-Messung
  const stopAudioLevelMeasurement = useCallback(() => {
    if (audioLevelIntervalRef.current !== null) {
      cancelAnimationFrame(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    audioAnalyserRef.current = null;
    audioDataArrayRef.current = null;
    // Stoppe Stream nur wenn nicht mehr benötigt
    const stillActive = dictationStatus === "recording" || 
                        dictationStatus === "transcribing" || 
                        realtimeStatus === "holding" || realtimeStatus === "assistant" || realtimeStatus === "connecting";
    if (audioStreamRef.current && !stillActive) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  }, [dictationStatus, realtimeStatus]);

  const isMicrophoneActive =
    dictationStatus === "recording" ||
    dictationStatus === "transcribing" ||
    realtimeStatus === "holding" ||
    realtimeStatus === "assistant" ||
    realtimeStatus === "connecting";
  
  const isRealtimeActive =
    realtimeStatus === "holding" ||
    realtimeStatus === "assistant" ||
    realtimeStatus === "connecting";
  // Do not lock the text input while the realtime client is merely "connecting" (otherwise the chat becomes unusable if backend/permissions fail).
  const shouldHideInput =
    dictationStatus === "recording" ||
    dictationStatus === "transcribing" ||
    realtimeStatus === "holding" ||
    realtimeStatus === "assistant";
  
  // Audio-Level für Diktat-Mode
  useEffect(() => {
    if (dictationStatus === "recording" && !isRealtimeActive) {
      startAudioLevelMeasurement();
    } else if (dictationStatus !== "recording" && !isRealtimeActive) {
      stopAudioLevelMeasurement();
      window.setTimeout(() => setAudioLevel(0), 0);
    }
    return () => {
      stopAudioLevelMeasurement();
    };
  }, [dictationStatus, isRealtimeActive, startAudioLevelMeasurement, stopAudioLevelMeasurement]);

  // Zufällige Wellen-Animation für visuelles Feedback
  useEffect(() => {
    if (isMicrophoneActive) {
      const updateFakeWaves = () => {
        // Immer bewegen, keine Aussetzer
        setFakeWaveLevels(() =>
          Array.from({ length: 20 }, () => 0.2 + Math.random() * 0.6)
        );
        // Konstante, schnelle Aktualisierung für flüssige Bewegung
        const nextDelay = 160 + Math.random() * 90; // 160–250ms
        fakeWaveIntervalRef.current = window.setTimeout(updateFakeWaves, nextDelay);
      };
      
      // Starte die Animation nach einer kurzen Verzögerung
      fakeWaveIntervalRef.current = window.setTimeout(updateFakeWaves, 300);
    } else {
      // Setze Wellen auf niedrige Werte, wenn nicht aktiv
      window.setTimeout(() => setFakeWaveLevels(Array(20).fill(0.2)), 0);
      if (fakeWaveIntervalRef.current !== null) {
        clearTimeout(fakeWaveIntervalRef.current);
        fakeWaveIntervalRef.current = null;
      }
    }
    
    return () => {
      if (fakeWaveIntervalRef.current !== null) {
        clearTimeout(fakeWaveIntervalRef.current);
        fakeWaveIntervalRef.current = null;
      }
    };
  }, [isMicrophoneActive]);

  const threadStorageKey = useCallback((threadId: string) => `aklow_thread_${threadId}`, []);

  const loadMessages = useCallback(
    (threadId: string): ChatMessage[] => {
      if (typeof window === "undefined") return [];
      try {
        const raw = localStorage.getItem(threadStorageKey(threadId));
        if (!raw) return [];
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (!Array.isArray(parsed)) return [];
        return parsed;
      } catch {
        return [];
      }
    },
    [threadStorageKey]
  );

  // Entfernt leere Threads (keine Nachrichten mit Inhalt) und deren Speicher
  const removeThreadIfEmpty = useCallback((threadId: string | null) => {
    if (typeof window === "undefined" || !threadId) return;

    // Hole gespeicherte Nachrichten; wenn der Thread aktiv ist, nutze aktuelle Messages
    const stored = loadMessages(threadId);
    const candidate = activeThreadIdRef.current === threadId ? messagesRef.current : stored;
    const hasContent = candidate.some((m) => (m.text || "").trim().length > 0);

    if (!hasContent) {
      try {
        localStorage.removeItem(threadStorageKey(threadId));
      } catch {
        // ignore
      }
      const next = threads.filter((t) => t.id !== threadId);
      writeChatThreads(next);

      // Falls gerade aktiv, auf einen vorhandenen Thread umschalten
      if (activeThreadIdRef.current === threadId) {
        const fallback = next[0]?.id || null;
        setActiveThreadId(fallback);
        setActiveThreadIdLocal(fallback || "thread-default");
        currentThreadRef.current = fallback;
        if (fallback) {
          const loaded = loadMessages(fallback);
          setMessages(loaded);
        } else {
          setMessages([]);
        }
      }
    }
  }, [loadMessages, threadStorageKey, threads]);

  // Sync local activeThreadId with store and URL
  useEffect(() => {
    // Skip if a view transition is already in progress
    if (viewTransitionRef.current.transition) {
      return;
    }

    const urlThreadId = searchParams.get("thread");
    if (urlThreadId && urlThreadId !== activeThreadId) {
      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          setActiveThreadId(urlThreadId);
        });
        viewTransitionRef.current.transition = transition;
        transition.finished.finally(() => {
          viewTransitionRef.current.transition = null;
        });
      } else {
        setActiveThreadId(urlThreadId);
      }
      return;
    }

    if (storeActiveThreadId && storeActiveThreadId !== activeThreadId) {
      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          setActiveThreadIdLocal(storeActiveThreadId);
          currentThreadRef.current = storeActiveThreadId;
          const loaded = loadMessages(storeActiveThreadId);
          setMessages(loaded);
        });
        viewTransitionRef.current.transition = transition;
        transition.finished.finally(() => {
          viewTransitionRef.current.transition = null;
        });
      } else {
        setActiveThreadIdLocal(storeActiveThreadId);
        currentThreadRef.current = storeActiveThreadId;
        const loaded = loadMessages(storeActiveThreadId);
        setMessages(loaded);
      }
      
      // Update URL without full reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("thread", storeActiveThreadId);
      window.history.replaceState(null, "", newUrl.toString());
    }
  }, [storeActiveThreadId, activeThreadId, loadMessages, searchParams]);

  // Scroll handling with Virtuoso
  const scrollToBottom = useCallback((smooth = true) => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: messages.length,
        behavior: smooth ? "smooth" : "auto",
        align: "end",
      });
      isNearBottomRef.current = true;
      setShowJumpToBottom(false);
    }
  }, [messages.length]);

  const atBottomStateChange = useCallback((atBottom: boolean) => {
    isNearBottomRef.current = atBottom;
    setShowJumpToBottom(!atBottom);
  }, []);

  // Autoscroll on messages change
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(messages.length > 0);
    }
  }, [messages, scrollToBottom]);

  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const saveMessages = useCallback((threadId: string, list: ChatMessage[], debounce = false) => {
    if (debounce) {
      if (saveTimeoutRef.current[threadId]) {
        clearTimeout(saveTimeoutRef.current[threadId]);
      }
      saveTimeoutRef.current[threadId] = setTimeout(() => {
        try {
          localStorage.setItem(threadStorageKey(threadId), JSON.stringify(list));
        } catch (e) {
          console.warn("Konnte Messages nicht speichern", e);
        }
      }, 500);
    } else {
      try {
        localStorage.setItem(threadStorageKey(threadId), JSON.stringify(list));
      } catch (e) {
        console.warn("Konnte Messages nicht speichern", e);
      }
    }
  }, [threadStorageKey]);

  const makeTitle = useCallback((text: string) => {
    const clean = text.replace(/\s+/g, " ").trim();
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    const firstTwo = sentences.slice(0, 2).join(" ");
    const base = firstTwo || clean;
    return base.length > 80 ? base.slice(0, 77) + "…" : base || "Neuer Chat";
  }, []);

  // Speichern/Ablegen eines Threads inkl. Zusammenfassung an Memory-Agent
  const saveThreadToMemory = useCallback(async (threadId: string) => {
    const tenant = tenantId || "aklow-main";
    const messagesToUse = threadId === currentThreadRef.current ? messagesRef.current : loadMessages(threadId);
    const textParts = messagesToUse
      .filter(m => (m.text || "").trim().length > 0)
      .slice(-10) // letzte 10 Nachrichten
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text?.trim() || ""}`);
    const summarySource = textParts.join("\n").slice(0, 4000);

    const summary = summarySource
      ? `Zusammenfassung des Chats:\n${summarySource}`
      : "Leerer Chat ohne Inhalt.";

    try {
      await fetch("/api/memory/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          role: "assistant",
          content: summary,
          timestamp: new Date().toISOString(),
          tenantId: tenant,
        }),
      });
    } catch (err) {
      console.error("Speichern fehlgeschlagen:", err);
    }
  }, [loadMessages, tenantId]);

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string } | undefined;
      if (!detail?.threadId) return;
      removeThreadIfEmpty(activeThreadIdRef.current);
      setActiveThreadId(detail.threadId);
    };

    const handleNew = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string } | undefined;
      const generateThreadId = () => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
          return `thread-${crypto.randomUUID()}`;
        }
        return `thread-${performance.now()}-${Math.random().toString(36).slice(2)}`;
      };
      const newId = detail?.threadId || generateThreadId();
      removeThreadIfEmpty(activeThreadIdRef.current);
      setActiveThreadId(newId);
    };

    const handleThinkingSteps = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.open !== undefined) {
        setIsStepsOpen(detail.open);
      } else {
        setIsStepsOpen(prev => !prev);
      }
    };

    window.addEventListener("aklow-select-thread", handleSelect as EventListener);
    window.addEventListener("aklow-new-chat", handleNew as EventListener);
    window.addEventListener("aklow-toggle-thinking-steps", handleThinkingSteps as EventListener);

    // Command Palette Event Handlers
    const handleToggleDictation = () => {
      if (dictationStatus === "recording") {
        stopRecording();
      } else if (dictationStatus === "idle" || dictationStatus === "error") {
        startRecording();
      }
    };

    const handleToggleRealtime = () => {
      if (realtimeStatus === "idle" || realtimeStatus === "error") {
        void pressRealtime();
      } else {
        void stopRealtimeAll();
      }
    };

    const handleStopTts = () => {
      stopTts();
    };

    const handleCopyMessage = () => {
      const lastAssistantMessage = [...messagesRef.current].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMessage?.text) {
        navigator.clipboard.writeText(lastAssistantMessage.text);
      }
    };

    const handleEditMessage = () => {
      const lastUserMessage = [...messagesRef.current].reverse().find((m) => m.role === "user");
      if (lastUserMessage) {
        setEditingMessageId(lastUserMessage.id);
        setEditingText(lastUserMessage.text);
      }
    };

    const handleSaveMessage = async () => {
      const lastAssistantMessage = [...messagesRef.current].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMessage?.text) {
        try {
          const response = await fetch("/api/memory/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              content: lastAssistantMessage.text,
              type: "custom",
            }),
          });
          if (response.ok) {
            setSavedMessageId(lastAssistantMessage.id);
            setTimeout(() => setSavedMessageId(null), 2000);
          }
        } catch (error) {
          console.error("Failed to save message:", error);
        }
      }
    };

    const handleUpdateMessage = () => {
      const lastUserMessage = [...messagesRef.current].reverse().find((m) => m.role === "user");
      if (lastUserMessage?.text) {
        setInput(lastUserMessage.text);
        inputRef.current?.focus();
      }
    };

    const handleReadMessage = () => {
      const lastAssistantMessage = [...messagesRef.current].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMessage?.text) {
        toggleTts({ id: lastAssistantMessage.id, text: lastAssistantMessage.text, lang: "de-DE" });
      }
    };

    const handleOpenQuickActions = () => {
      // Trigger quick actions menu - find last assistant message and trigger quick actions
      const lastAssistantMessage = [...messagesRef.current].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMessage) {
        // Simulate click on quick actions button for last message
        const quickActionsButton = document.querySelector(`[data-message-id="${lastAssistantMessage.id}"] [aria-label="${t('chat.quickActions')}"]`) as HTMLButtonElement;
        if (quickActionsButton) {
          quickActionsButton.click();
        }
      }
    };

    const handleQuickAction = (e: CustomEvent<{ actionId: string }>) => {
      // Send quick action message to chat
      const actionId = e.detail?.actionId;
      if (actionId) {
        const actionMessages: Record<string, string> = {
          inbox_summary: "Fasse meinen Posteingang zusammen",
          reply_suggestion: "Schlage mir eine Antwort auf die letzte Kundenfrage vor",
          deep_research: "Starte eine Deep Research zu folgendem Thema:",
          document_analysis: "Analysiere das folgende Dokument:",
          call_summary: "Fasse das folgende Gespräch zusammen:",
          crm_preparation: "Bereite einen CRM-Eintrag aus diesem Chat vor",
          task_extraction: "Extrahiere To-dos aus diesem Text:",
          automation_suggestion: "Schlage mir Automatisierungen basierend auf meinen Workflows vor",
        };
        const message = actionMessages[actionId] || `Führe die Aktion "${actionId}" aus`;
        setInput(message);
        inputRef.current?.focus();
      }
    };

    const handleSaveThread = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string } | undefined;
      const threadId = detail?.threadId || activeThreadIdRef.current || currentThreadRef.current;
      if (threadId) {
        void saveThreadToMemory(threadId);
      }
    };

    // Chat First: Handle prefill-chat events from FAB and other sources
    const handlePrefillChat = (e: Event) => {
      const detail = (e as CustomEvent).detail as { prompt?: string; context?: string; id?: string } | undefined;
      if (detail?.prompt) {
        setInput(detail.prompt);
        inputRef.current?.focus();
        // Auto-resize textarea
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
        }
      }
    };

    window.addEventListener("aklow-toggle-dictation", handleToggleDictation as EventListener);
    window.addEventListener("aklow-toggle-realtime", handleToggleRealtime as EventListener);
    window.addEventListener("aklow-stop-tts", handleStopTts as EventListener);
    window.addEventListener("aklow-copy-message", handleCopyMessage as EventListener);
    window.addEventListener("aklow-edit-message", handleEditMessage as EventListener);
    window.addEventListener("aklow-save-message", handleSaveMessage as EventListener);
    window.addEventListener("aklow-update-message", handleUpdateMessage as EventListener);
    window.addEventListener("aklow-read-message", handleReadMessage as EventListener);
    window.addEventListener("aklow-open-quick-actions", handleOpenQuickActions as EventListener);
    window.addEventListener("aklow-send-quick-action", handleQuickAction as EventListener);
    window.addEventListener("aklow-save-thread", handleSaveThread as EventListener);
    window.addEventListener("aklow-prefill-chat", handlePrefillChat as EventListener);

    return () => {
      window.removeEventListener("aklow-select-thread", handleSelect as EventListener);
      window.removeEventListener("aklow-new-chat", handleNew as EventListener);
      window.removeEventListener("aklow-toggle-thinking-steps", handleThinkingSteps as EventListener);
      window.removeEventListener("aklow-toggle-dictation", handleToggleDictation as EventListener);
      window.removeEventListener("aklow-toggle-realtime", handleToggleRealtime as EventListener);
      window.removeEventListener("aklow-stop-tts", handleStopTts as EventListener);
      window.removeEventListener("aklow-copy-message", handleCopyMessage as EventListener);
      window.removeEventListener("aklow-edit-message", handleEditMessage as EventListener);
      window.removeEventListener("aklow-save-message", handleSaveMessage as EventListener);
      window.removeEventListener("aklow-update-message", handleUpdateMessage as EventListener);
      window.removeEventListener("aklow-read-message", handleReadMessage as EventListener);
      window.removeEventListener("aklow-open-quick-actions", handleOpenQuickActions as EventListener);
      window.removeEventListener("aklow-send-quick-action", handleQuickAction as EventListener);
      window.removeEventListener("aklow-save-thread", handleSaveThread as EventListener);
      window.removeEventListener("aklow-prefill-chat", handlePrefillChat as EventListener);
    };
  }, [stopTts, dictationStatus, startRecording, stopRecording, toggleTts, tenantId, pressRealtime, stopRealtimeAll, realtimeStatus, t, removeThreadIfEmpty, saveThreadToMemory]);

  // Initial load messages on mount if thread is already selected
  useEffect(() => {
    if (currentThreadRef.current) return;
    const defaultThreadId = "thread-default";
    currentThreadRef.current = defaultThreadId;
    const loaded = loadMessages(defaultThreadId);
      // Remove duplicates based on message id and role
      const uniqueMessages = loaded.filter((msg, index, self) => {
        const firstIndex = self.findIndex((m) => m.id === msg.id);
        // Also check for duplicate assistant messages with same text
        if (msg.role === "assistant" && index !== firstIndex) {
          const sameText = self[firstIndex]?.text === msg.text;
          return !sameText;
        }
        return index === firstIndex;
      });
    setMessages(uniqueMessages);
  }, [loadMessages]);

  useEffect(() => {
    return () => {
      stopTts();
    };
  }, [stopTts]);

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0];
  const isLastAssistantMessage = (msg: ChatMessage) => msg.id === lastAssistantMessage?.id;

  const pinnedToBottom = isNearBottomRef.current;
  const showThinking = isSending && (thinkingSteps.length > 0 || !!thinkingNote);

  const sendMessage = useCallback(async (trimmed: string) => {
    if (!trimmed || isSending) return;
    
    abortControllerRef.current = new AbortController();

    const threadId = currentThreadRef.current || "thread-default";
    setActiveThreadId(threadId);
    stopTts();

    const generateId = () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return `${performance.now()}-${Math.random().toString(36).slice(2)}`;
    };

    const userMessageId = `user-${generateId()}`;

    // Add attachments to text if any
    const attachmentText = attachments.map(a => `[Anhang: ${a.name}]`).join(" ");
    const fullText = trimmed + (attachmentText ? "\n\n" + attachmentText : "");

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      text: fullText,
    };

    // Optimistic UI Update
    setMessages((prev) => {
      const next = [...prev, userMessage];
      saveMessages(threadId, next, false);
      return next;
    });

    // Automatische Titel-/Preview-Generierung beim ersten Inhalt
    const currentThread = threads.find(t => t.id === threadId);
    const needsAutoNaming = currentThread && (currentThread.title === "Neuer Chat" || currentThread.title === "Willkommen!");
    if (needsAutoNaming) {
      const autoTitle = makeTitle(trimmed);
      updateChatThread(threadId, {
        title: autoTitle,
        preview: trimmed.slice(0, 120),
        lastMessageAt: Date.now(),
      });
    }
    
    setInput("");
    setAttachments([]); // Clear attachments after sending
    setIsSending(true);
    setQuickHint("");
    setFollowUpSuggestions([]);
    setThinkingSteps([]);
    setThinkingNote(null);
    setIsStepsOpen(false);

    const assistantMessageId = `assistant-${generateId()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      text: "",
      uiMessages: [],
    };

    setMessages((prev) => {
      // Check if assistant message with this ID already exists
      if (prev.some(msg => msg.id === assistantMessageId)) return prev;
      const next = [...prev, assistantMessage];
      saveMessages(threadId, next, false);
      return next;
    });

    try {
      let fullContent = "";

      await sendChatMessageStream(
        trimmed,
        {
          onStart: (data) => {
            const steps = (data.steps ?? []) as ThinkingStep[];
            setThinkingSteps(steps);
            setThinkingNote("Denke nach …");
          },
          onStepUpdate: (data) => {
            setThinkingSteps((prev) =>
              prev.map((s) =>
                s.id === data.stepId ? { ...s, status: data.status as ThinkingStep["status"] } : s
              )
            );
          },
          onChunk: (data) => {
            const chunk = data.content || "";
            if (chunk) {
              if (chunk.startsWith(fullContent)) {
                fullContent = chunk;
              } else if (!fullContent.endsWith(chunk)) {
                fullContent += chunk;
              }
            }
            setThinkingNote("Antwort wird erstellt …");

            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, text: fullContent } : msg
              );
              saveMessages(threadId, updated, true); // Use debounce for chunks
              return updated;
            });
          },
          onEnd: (data) => {
            // Use fullContent if it exists (from chunks), otherwise use data.content
            // This prevents duplication if data.content contains the full message
            const finalContent = fullContent || data.content || "";
            const cleanedUiMessages = filterDuplicateTextUiMessages(data.uiMessages, finalContent);
            setMessages((prev) => {
              // Remove any duplicate assistant messages - keep only the one with matching ID
              const withoutDuplicates = prev.filter((msg) => {
                // Keep all user messages
                if (msg.role === "user") return true;
                // For assistant messages, only keep if it's our target message or if it's different
                if (msg.role === "assistant") {
                  // Keep our target message
                  if (msg.id === assistantMessageId) return true;
                  // Remove any other assistant messages that are empty or duplicates
                  if (!msg.text || msg.text.trim() === "") return false;
                  // Keep other assistant messages that have content
                  return true;
                }
                return true;
              });
              
              // Update the target message
              const updated = withoutDuplicates.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, text: finalContent, uiMessages: cleanedUiMessages }
                  : msg
              );
              
              // Final check: remove any duplicate assistant messages with same text
              const finalMessages = updated.filter((msg, index, self) => {
                if (msg.role === "assistant" && msg.text) {
                  const firstIndex = self.findIndex(m => m.role === "assistant" && m.text === msg.text);
                  return index === firstIndex || index === self.findIndex(m => m.id === assistantMessageId);
                }
                return true;
              });
              
              saveMessages(threadId, finalMessages, false); // Save immediately on end
              return finalMessages;
            });

            interface ResponseData {
              followUpSuggestions?: string[];
              follow_up_suggestions?: string[];
            }
            const responseData = data as ResponseData;
            const suggestions = responseData.followUpSuggestions || responseData.follow_up_suggestions || [];
            if (Array.isArray(suggestions) && suggestions.length > 0) {
              setFollowUpSuggestions(
                suggestions.filter((s: string) => typeof s === "string" && s.trim().length > 0)
              );
            } else {
              setFollowUpSuggestions([]);
            }

            const title = makeTitle(trimmed);
            const currentThread = threads.find(t => t.id === threadId);
            const needsAutoNaming = currentThread && (currentThread.title === "Neuer Chat" || currentThread.title === "Willkommen!");
            
            updateChatThread(threadId, {
              title: needsAutoNaming ? title : currentThread?.title,
              preview: finalContent.slice(0, 120) || trimmed,
              lastMessageAt: Date.now(),
            });

            // Detect Artifacts (e.g. large code blocks)
            if (finalContent.includes("```") && finalContent.length > 500) {
              window.dispatchEvent(new CustomEvent('aklow-open-artifact', { 
                detail: { 
                  content: finalContent,
                  threadId 
                } 
              }));
            }

            setThinkingNote(null);
            setIsSending(false);
            abortControllerRef.current = null;
          },
          onError: (error) => {
            const errorText = error.message || "Unbekannter Fehler im Chat";
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, text: t('chat.errorSending') + ": " + errorText } : msg
              );
              saveMessages(threadId, updated);
              return updated;
            });
            setThinkingNote("Fehler beim Streamen");
            setIsSending(false);
            abortControllerRef.current = null;
          },
          onAbort: () => {
            setThinkingNote("Antwort gestoppt.");
            setIsSending(false);
            abortControllerRef.current = null;
          }
        },
        {
          tenantId,
          sessionId: threadId,
          channel: "web_chat",
          signal: abortControllerRef.current.signal
        }
      );
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Unbekannter Fehler im Chat";
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, text: "Fehler beim Senden: " + errorText } : msg
        );
        saveMessages(threadId, updated);
        return updated;
      });
      setThinkingNote("Fehler beim Streamen");
      setIsSending(false);
    }
  }, [isSending, tenantId, stopTts, saveMessages, attachments, threads, makeTitle, t]);

  const handleQuickCardClick = useCallback(async (text: string) => {
    setFollowUpSuggestions([]);
    await sendMessage(text);
  }, [sendMessage, setFollowUpSuggestions]);

  function renderMessage(message: ChatMessage) {
    const isUser = message.role === "user";

    if (isUser) {
      const handleUserCopy = async () => {
        try {
          await navigator.clipboard.writeText(message.text);
        } catch (err) {
          console.error("Failed to copy text:", err);
        }
      };

      const handleUserEdit = () => {
        setEditingMessageId(message.id);
        setEditingText(message.text);
      };

      const handleEditSave = () => {
        if (!editingText.trim()) return;
        
        const threadId = activeThreadId || "thread-default";
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === message.id ? { ...msg, text: editingText.trim() } : msg
          );
          saveMessages(threadId, updated);
          return updated;
        });
        
        setEditingMessageId(null);
        setEditingText("");
        
        // Send edited message to bot
        sendMessage(editingText.trim());
      };

      const handleEditCancel = () => {
        setEditingMessageId(null);
        setEditingText("");
      };

      return (
        <div
          key={message.id}
          className="group flex justify-end animate-[fadeInUp_0.4s_ease-out]"
          onMouseEnter={() => {
            if (hoverUserMenuTimeoutRef.current) {
              clearTimeout(hoverUserMenuTimeoutRef.current);
            }
            hoverUserMenuTimeoutRef.current = setTimeout(() => {
              setHoveredUserMessageId(message.id);
            }, 500);
          }}
          onMouseLeave={() => {
            if (hoverUserMenuTimeoutRef.current) {
              clearTimeout(hoverUserMenuTimeoutRef.current);
              hoverUserMenuTimeoutRef.current = null;
            }
            setHoveredUserMessageId(null);
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
              tooltipTimeoutRef.current = null;
            }
            setHoveredTooltip(null);
          }}
          style={{ marginLeft: "auto", maxWidth: "70%", marginRight: "4%" }}
        >
          <div className="flex flex-col gap-2" style={{ alignItems: "flex-end", width: "100%" }}>
            {editingMessageId === message.id ? (
              <div className="flex flex-col gap-2 w-full">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleEditSave();
                    } else if (e.key === "Escape") {
                      handleEditCancel();
                    }
                  }}
                  className="ak-body whitespace-pre-wrap leading-relaxed rounded-xl px-2.5 py-1.5 shadow-sm text-right bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] resize-none focus:outline-none focus:ring-0"
                  style={{ color: "var(--ak-color-text-primary)", fontSize: "16px", minHeight: "60px" }}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 active:scale-95 transition-transform"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleEditSave}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-95 transition-transform"
                  >
                    Senden
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="ak-body whitespace-pre-wrap leading-[1.7] rounded-2xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-right bg-gradient-to-br from-[var(--ak-color-bg-surface-muted)] to-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]"
                style={{ color: "var(--ak-color-text-primary)", fontSize: "15px" }}
              >
                {message.text}
              </div>
            )}
            
            {/* Action Row (User) */}
            <div 
              className={`${hoveredUserMessageId === message.id ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ease-in-out flex items-center gap-0 mt-1`}
            >
              {/* Edit */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleUserEdit}
                  onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'edit' })}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className="p-1.5 text-gray-800 hover:text-black transition-colors rounded-md hover:bg-black/5 active:scale-95"
                  aria-label={t('chat.edit')}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'edit' && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                    {t('chat.edit')}
                  </span>
                )}
              </div>

              {/* Copy */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleUserCopy}
                  onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'copy' })}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className="p-1.5 text-gray-800 hover:text-black transition-colors rounded-md hover:bg-black/5 active:scale-95"
                  aria-label="Kopieren"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'copy' && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                    Kopieren
                  </span>
                )}
              </div>

              {/* Retry (Resend) */}
              <div className="relative">
                  <button
                  type="button"
                  onClick={() => sendMessage(message.text)}
                  onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'retry' })}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className="p-1.5 text-gray-800 hover:text-black transition-colors rounded-md hover:bg-black/5 active:scale-95"
                  aria-label={t('chat.retry')}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'retry' && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                    {t('chat.retry')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const ttsActive = speakingId === message.id;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(message.text);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    };

    const handleSave = async () => {
      try {
        const threadId = activeThreadId || "thread-default";
        const timestamp = new Date().toISOString();
        
        const response = await fetch("/api/memory/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threadId,
            role: "assistant",
            content: message.text,
            timestamp,
            tenantId,
          }),
        });

        if (response.ok) {
          setSavedMessageId(message.id);
          setTimeout(() => {
            setSavedMessageId(null);
          }, 2000);
        } else {
          console.error("Failed to save message:", await response.text());
        }
      } catch (err) {
        console.error("Error saving message:", err);
      }
    };

    const handleUpdate = async () => {
      // Find the user message that came before this assistant message
      const messageIndex = messages.findIndex((m) => m.id === message.id);
      if (messageIndex === -1) return;
      
      // Find the last user message before this assistant message
      let lastUserMessage: ChatMessage | null = null;
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          lastUserMessage = messages[i];
          break;
        }
      }
      
      if (!lastUserMessage) return;
      
      // Remove this assistant message and regenerate
      const threadId = activeThreadId || "thread-default";
      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== message.id);
        saveMessages(threadId, updated);
        return updated;
      });
      
      // Regenerate the response
      await sendMessage(lastUserMessage.text);
    };

    const handleReadAloud = () => {
      if (ttsActive) {
        stopTts();
      } else {
        toggleTts({ id: message.id, text: message.text, lang: "de-DE" });
      }
    };

    const handleFeedback = async (messageId: string, type: "thumbs_up" | "thumbs_down") => {
      setFeedbackStatus((prev) => ({ ...prev, [messageId]: type }));
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenant_id: tenantId,
            session_id: activeThreadId,
            message_id: messageId,
            feedback_type: type,
          }),
        });
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    };

    const handleQuickActions = async () => {
      if (fastActionsOpenMessageId === message.id) {
        setFastActionsOpenMessageId(null);
        return;
      }

      const messageIndex = messages.findIndex((m) => m.id === message.id);
      let lastUserMessage = "";
      if (messageIndex > 0) {
        for (let i = messageIndex - 1; i >= 0; i -= 1) {
          if (messages[i]?.role === "user") {
            lastUserMessage = messages[i]?.text ?? "";
            break;
          }
        }
      }

      try {
        const res = await fetchFastActions({
          surface: "inline",
          channel: "web_chat",
          thread_id: activeThreadId ?? undefined,
          message_id: message.id,
          language: "de",
          last_user_message: lastUserMessage,
          last_assistant_message: message.text ?? "",
          conversation_summary: "",
        });

        setFastActionsByMessageId((prev) => ({
          ...prev,
          [message.id]: Array.isArray(res.suggestions) ? res.suggestions : [],
        }));
        setFastActionsOpenMessageId(message.id);
      } catch (err) {
        console.error(err);
        setFastActionsByMessageId((prev) => ({ ...prev, [message.id]: [] }));
        setFastActionsOpenMessageId(message.id);
      }
    };

    const isLast = isLastAssistantMessage(message);
    const hasThinking = thinkingSteps.length > 0 && isLast;

    return (
      <div
        key={message.id}
        className="group flex justify-start animate-[fadeInUp_0.4s_ease-out]"
        onMouseEnter={() => {
          if (hoverMenuTimeoutRef.current) {
            clearTimeout(hoverMenuTimeoutRef.current);
          }
          hoverMenuTimeoutRef.current = setTimeout(() => {
          }, 500);
        }}
        onMouseLeave={() => {
          if (hoverMenuTimeoutRef.current) {
            clearTimeout(hoverMenuTimeoutRef.current);
            hoverMenuTimeoutRef.current = null;
          }
        }}
        style={{
          marginLeft: "4%",
          maxWidth: "80%",
          opacity: 1,
        }}
      >
        <div className="flex w-full items-start">
          <div className="flex w-full flex-col gap-3" style={{ alignItems: "flex-start" }}>
            
            {/* Inline Thinking UI (ChatGPT style) */}
            {hasThinking && (
              <div className="mb-2 w-full max-w-2xl">
                <button 
                  onClick={() => setShowThinkingInline(prev => ({ ...prev, [message.id]: !prev[message.id] }))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors group/think"
                >
                  <SparklesIcon className={clsx("h-3.5 w-3.5 transition-transform duration-500", isSending && "animate-spin text-indigo-500")} />
                  <span>{isSending ? t('chat.thinking') : t('chat.showThinking')}</span>
                  <ChevronRightIcon className={clsx("h-3 w-3 ml-1 transition-transform", showThinkingInline[message.id] && "rotate-90")} />
                </button>
                
                <AnimatePresence>
                  {showThinkingInline[message.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 ml-4 pl-4 border-l-2 border-gray-100"
                    >
                      <div className="space-y-3 py-2">
                        {thinkingSteps.map((step) => (
                          <div key={step.id} className="flex items-start gap-3">
                            <div className={clsx(
                              "mt-1.5 h-1.5 w-1.5 rounded-full flex-none",
                              step.status === "done" ? "bg-green-500" : step.status === "active" ? "bg-indigo-500 animate-pulse" : "bg-gray-300"
                            )} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700">{step.label}</p>
                              {step.details && <p className="text-[10px] text-gray-400 mt-0.5">{step.details}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex-1 min-w-0 text-[var(--ak-color-text-primary)] font-normal antialiased leading-[1.7]">
                <ChatMarkdown content={normalizeChatMarkdown(message.text)} />
              </div>
            </div>

            {/* Audio Player für Vorlesen-Modus */}
            {ttsActive && (
              <div className="mt-2 mb-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-blue-500 rounded" style={{ animation: "audio-wave 0.6s ease-in-out infinite", animationDelay: "0ms" }} />
                      <div className="w-1 h-4 bg-blue-500 rounded" style={{ animation: "audio-wave 0.6s ease-in-out infinite", animationDelay: "0.15s" }} />
                      <div className="w-1 h-4 bg-blue-500 rounded" style={{ animation: "audio-wave 0.6s ease-in-out infinite", animationDelay: "0.3s" }} />
                    </div>
                    <span className="text-xs text-gray-600 ml-2">Wird vorgelesen...</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-blue-600 hover:bg-blue-50 transition-colors"
                  aria-label={t('chat.stopReadAloud')}
                >
                  <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" strokeWidth={1} />
                </button>
              </div>
            )}

            {/* Action Row (Inline Expansion) */}
            <div className="flex items-center gap-0 mt-1.5 opacity-100 transition-opacity duration-200 relative">
{/* 1. Copy */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={handleCopy}
                                  onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'copy' })}
                                  onMouseLeave={() => setHoveredTooltip(null)}
                                  className="p-1.5 text-gray-500 hover:text-gray-900 transition-all duration-150 rounded-lg hover:bg-gray-100 hover:scale-110 active:scale-95"
                                  aria-label={t('chat.copy')}
                                >
                                  <ClipboardDocumentIcon className="h-5 w-5" />
                                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'copy' && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                    {t('chat.copy')}
                  </span>
                )}
              </div>

{/* 2. Thumb Up */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(message.id, 'thumbs_up')}
                                  onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'thumbs_up' })}
                                  onMouseLeave={() => setHoveredTooltip(null)}
                                  className={clsx(
                                    "p-1.5 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95",
                                    feedbackStatus[message.id] === 'thumbs_up' 
                                      ? "text-green-600 bg-green-50 scale-110" 
                                      : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                                  )}
                                  aria-label={t('chat.feedback.good')}
                                >
                                  <HandThumbUpIcon className="h-5 w-5" />
                                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'thumbs_up' && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                    {t('chat.feedback.good')}
                  </span>
                )}
              </div>

{/* 3. Thumb Down */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(message.id, 'thumbs_down')}
                                  onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'thumbs_down' })}
                                  onMouseLeave={() => setHoveredTooltip(null)}
                                  className={clsx(
                                    "p-1.5 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95",
                                    feedbackStatus[message.id] === 'thumbs_down' 
                                      ? "text-red-600 bg-red-50 scale-110" 
                                      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                                  )}
                                  aria-label={t('chat.feedback.bad')}
                                >
                                  <HandThumbDownIcon className="h-5 w-5" />
                                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'thumbs_down' && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                    {t('chat.feedback.bad')}
                  </span>
                )}
              </div>

{/* 4. Quick Actions */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={handleQuickActions}
                                  onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'quick' })}
                                  onMouseLeave={() => setHoveredTooltip(null)}
                                  className={clsx(
                                    "p-1.5 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95",
                                    fastActionsOpenMessageId === message.id 
                                      ? "text-indigo-600 bg-indigo-50 scale-110" 
                                      : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                  )}
                                  aria-label={t('chat.quickActions')}
                                >
                                  <SparklesIcon className="h-5 w-5" />
                                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'quick' && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                    {t('chat.quickActions')}
                  </span>
                )}
              </div>

              {/* 5. More / Expanded */}
              {expandedActions[message.id] ? (
                <>
                  {/* Regenerate */}
                  <div className="relative">
                      <button
                      type="button"
                      onClick={handleUpdate}
                      onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'update' })}
                      onMouseLeave={() => setHoveredTooltip(null)}
                      className="p-1.5 text-gray-800 hover:text-black transition-colors rounded-md hover:bg-black/5 active:scale-95"
                      aria-label={t('chat.regenerate')}
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'update' && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                        {t('chat.regenerate')}
                      </span>
                    )}
                  </div>

                  {/* Read Aloud */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleReadAloud}
                      disabled={!ttsSupported || !message.text || message.text.trim().length === 0}
                      onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'read' })}
                      onMouseLeave={() => setHoveredTooltip(null)}
                      className={clsx(
                        "p-1.5 transition-colors rounded-md hover:bg-black/5 disabled:opacity-50 active:scale-95",
                        ttsActive ? "text-gray-900 bg-black/5" : "text-gray-800 hover:text-black"
                      )}
                      aria-label="Vorlesen"
                    >
                      <SpeakerWaveIcon className="h-5 w-5" />
                    </button>
                    {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'read' && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                        {ttsActive ? "Stoppen" : "Vorlesen"}
                      </span>
                    )}
                  </div>

                  {/* Save */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleSave}
                      onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'save' })}
                      onMouseLeave={() => setHoveredTooltip(null)}
                      className={clsx(
                        "p-1.5 transition-colors rounded-md hover:bg-black/5 active:scale-95",
                        savedMessageId === message.id ? "text-green-600" : "text-gray-800 hover:text-black"
                      )}
                      aria-label={t('chat.save')}
                    >
                      <BookmarkIcon className="h-5 w-5" />
                    </button>
                    {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'save' && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                        {savedMessageId === message.id ? t('chat.saved') : t('chat.save')}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExpandedActions(prev => ({ ...prev, [message.id]: true }))}
                    onMouseEnter={() => setHoveredTooltip({ messageId: message.id, icon: 'more' })}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="p-1.5 text-gray-800 hover:text-black transition-colors rounded-md hover:bg-black/5 active:scale-95"
                    aria-label="Mehr"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                  {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'more' && (
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap z-50 pointer-events-none">
                      Mehr
                    </span>
                  )}
                </div>
              )}
            </div>

            {fastActionsOpenMessageId === message.id &&
            Array.isArray(fastActionsByMessageId[message.id]) &&
            fastActionsByMessageId[message.id].length > 0 ? (
              <div className="mt-2 w-full">
                <FastActionsChips
                  suggestions={fastActionsByMessageId[message.id]}
                  onSelect={(s) => {
                    const text = s.payload?.text;
                    if (s.handler === "prefill_prompt" && typeof text === "string" && text.trim().length > 0) {
                      setInput(text);
                      setFastActionsOpenMessageId(null);
                      if (inputRef.current) inputRef.current.focus();
                    }
                  }}
                />
              </div>
            ) : null}

            {Array.isArray(message.uiMessages) && message.uiMessages.length > 0 ? (
              <div className="mt-3 w-full space-y-3">
                {message.uiMessages.map((uiMessage, index) => (
                  <WidgetRenderer key={index} message={uiMessage} />
                ))}
              </div>
            ) : null}


{isLastAssistantMessage(message) && followUpSuggestions.length > 0 && (
                              <div className="mt-6 flex flex-wrap gap-2.5">
                                {followUpSuggestions.slice(0, 3).map((suggestion, index) => (
                                  <button
                                    key={`suggestion-${index}`}
                                    type="button"
                                    onClick={() => handleQuickCardClick(suggestion)}
                                    className="px-4 py-2 rounded-full bg-gradient-to-b from-white to-gray-50/80 border border-gray-200/80 text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm backdrop-blur-sm group"
                                    style={{
                                      animationDelay: `${index * 80}ms`,
                                      animation: "fadeInUp 0.4s var(--ak-motion-ease) forwards",
                                      opacity: 0,
                                    }}
                                  >
                                    {suggestion} 
                                    <span className="text-gray-400 ml-1.5 group-hover:text-indigo-500 group-hover:translate-x-0.5 inline-block transition-all">→</span>
                                  </button>
                                ))}
                              </div>
                            )}
          </div>
        </div>
      </div>
    );
  }

  // Memoized message renderer to prevent unnecessary re-renders during streaming
  const renderMessageMemo = useCallback(
    (message: ChatMessage) => {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="w-full"
        >
          {renderMessage(message)}
        </motion.div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      feedbackStatus,
      editingMessageId,
      editingText,
      savedMessageId,
      hoveredUserMessageId,
      hoveredTooltip,
      fastActionsOpenMessageId,
      fastActionsByMessageId,
      expandedActions,
      speakingId,
      ttsSupported,
      thinkingSteps,
      messages.length,
    ]
  );

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  async function handleSend(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;
    
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    
    await sendMessage(trimmed);
  }

  const handleEditMessage = () => {
    const lastUserMessage = [...messagesRef.current].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) return;
    setEditingMessageId(lastUserMessage.id);
    setEditingText(lastUserMessage.text);
  };

  // Keyboard Shortcuts für Chat
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'Escape',
        description: 'Schließe offene Menüs',
        action: () => {
          // Schließe Plus-Menü
          if (isPlusMenuOpen) {
            setIsPlusMenuOpen(false);
          }
          // Schließe Edit-Modus
          if (editingMessageId) {
            setEditingMessageId(null);
            setEditingText("");
          }
          // Stoppe TTS
          stopTts();
        },
        enabled: true,
      },
    ],
    enabled: true,
  });

  return (
    <div
      suppressHydrationWarning
      className={clsx(
        "flex h-screen min-h-screen w-full max-w-full flex-col gap-0 relative transition-colors duration-1000 ease-in-out overflow-hidden",
        ambientColor === "bg-white" ? "bg-slate-50/50" : ambientColor
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Ambient Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={clsx(
          "absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-40 transition-colors duration-1000",
          ambientColor === "bg-white" ? "bg-blue-100/20" : ambientColor.replace("/30", "")
        )} />
        <div className={clsx(
          "absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-40 transition-colors duration-1000",
          ambientColor === "bg-white" ? "bg-purple-100/20" : ambientColor.replace("/30", "")
        )} />
      </div>

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-indigo-600/10 backdrop-blur-sm border-2 border-indigo-600 border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
              <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <CloudArrowUpIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Dateien hier ablegen</h3>
              <p className="text-sm text-gray-500">Zum Chat hinzufügen</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes thinking-dot-blink {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @keyframes flicker {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes audio-wave {
          0%, 100% {
            height: 0.5rem;
            opacity: 0.5;
          }
          50% {
            height: 1.5rem;
            opacity: 1;
          }
        }
        .ak-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .ak-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .ak-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .ak-scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        }
      `}</style>

      <ThinkingStepsDrawer
        open={isStepsOpen}
        onClose={() => setIsStepsOpen(false)}
        steps={thinkingSteps}
        note={thinkingNote}
      />

      {/* Top Spacer to keep content below header/toolbars */}
      <div className="h-14 shrink-0" />

      {/* Scrollable Content Area - single scroll parent */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div
          ref={scrollParentRef}
          className="h-full overflow-y-auto ak-scrollbar pt-16 pb-48"
        >
          {/* Context cards */}
          <div className="px-4 pt-2 pb-4">
            <ContextCardRenderer className="mx-auto max-w-3xl w-full" />
          </div>

          {/* Messages */}
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            atBottomStateChange={atBottomStateChange}
            followOutput="auto"
            initialTopMostItemIndex={messages.length - 1}
            customScrollParent={scrollParentRef.current || undefined}
            style={{ height: "auto", minHeight: 400 }}
            itemContent={(index, msg) => (
              <div className="mx-auto max-w-3xl w-full px-4 py-2">
                {renderMessageMemo(msg)}
              </div>
            )}
            components={{
              Header: () => (
                <div className="mx-auto max-w-3xl w-full px-4 py-8 pt-4">
                  {messages.length === 0 && (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                          Guten Tag!
                        </h2>
                        <p className="text-gray-600">
                          Wie kann ich dir heute helfen?
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ),
              Footer: () => (
                <div className="mx-auto max-w-3xl w-full px-4">
                  {showThinking && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start relative px-[5%] mt-4 mb-8"
                    >
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/60 border border-indigo-100/50 shadow-sm">
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" style={{ animation: "thinking-dot-blink 1.2s ease-in-out infinite", animationDelay: "0ms" }} />
                          <span className="inline-block w-2 h-2 rounded-full bg-purple-400" style={{ animation: "thinking-dot-blink 1.2s ease-in-out infinite", animationDelay: "300ms" }} />
                          <span className="inline-block w-2 h-2 rounded-full bg-pink-400" style={{ animation: "thinking-dot-blink 1.2s ease-in-out infinite", animationDelay: "600ms" }} />
                        </div>
                        <span className="ml-1 text-indigo-600/80 text-sm font-medium">
                          Denke nach...
                        </span>
                      </div>
                    </motion.div>
                  )}
                  <div className="h-20 w-full flex-none" />
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Jump to bottom Button (relative to chat container) */}
      {showJumpToBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-32 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-xl ring-1 ring-black/5 backdrop-blur-md hover:bg-white hover:text-indigo-600 active:scale-90 transition-all pointer-events-auto"
          aria-label={t('chat.jumpToBottom')}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-5 w-5"
          >
            <path d="m7 10 5 5 5-5" />
            <path d="m7 15 5 5 5-5" className="opacity-50" />
          </svg>
        </button>
      )}

      {/* Composer unterhalb des Scrollbereichs, passt sich der Chatbreite an */}
      <div className="absolute inset-x-0 bottom-0 z-30 w-full px-4 pb-6 pt-6 pointer-events-none flex justify-center bg-transparent">
        {/* Subtitle Gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 via-slate-50/50/90 via-60% to-transparent pointer-events-none -z-10" />
        
        <div className="mx-auto max-w-3xl w-full pointer-events-auto">
          {/* Attachment Previews */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-wrap gap-2 mb-3 px-2"
              >
                {attachments.map((file) => (
                  <div key={file.id} className="group relative flex items-center gap-2 p-2 bg-white/80 border border-gray-200 rounded-xl shadow-sm backdrop-blur-sm pr-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <DocumentIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">{file.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{file.type.split('/')[1] || 'FILE'}</span>
                    </div>
                    <button 
                      onClick={() => removeAttachment(file.id)}
                      className="absolute right-1 top-1 h-5 w-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className={clsx(
            "relative flex items-center gap-2 rounded-[28px] px-4 py-2.5 transition-all duration-300 ease-[var(--ak-motion-ease)]",
            "bg-gradient-to-b from-white/98 to-white/92 backdrop-blur-[40px] backdrop-saturate-[180%]",
            "border border-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.04),0_16px_48px_rgba(0,0,0,0.08)]",
            isRealtimeActive 
              ? "!bg-gradient-to-b !from-red-50/90 !to-red-100/80 !border-red-200/60 ring-2 ring-red-500/20"
              : "hover:border-white/80 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.06),0_24px_64px_rgba(0,0,0,0.1)] focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08),0_32px_80px_rgba(0,0,0,0.12)] focus-within:border-white/90"
          )}>
            {/* Audio-Wellen-Visualisierung */}
            {isMicrophoneActive && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-[32%] min-w-[180px] max-w-[360px] items-end justify-center gap-[2px]"
              >
                {/* Points Left */}
                <div className="flex flex-col justify-between h-6 mr-1 opacity-60">
                  <div className="h-[3px] w-[3px] rounded-full bg-black" />
                  <div className="h-[3px] w-[3px] rounded-full bg-black" />
                </div>

                {/* Waves */}
                {Array.from({ length: 20 }).map((_, i) => {
                  let waveHeight: number;
                  let opacity: number;
                  
                  if (audioLevel > 0 && audioBands.length >= 20) {
                    const frequencyBand = audioBands[i] || 0;
                    const combinedLevel = (audioLevel * 0.55 + frequencyBand * 0.45);
                    waveHeight = Math.max(3, combinedLevel * 22);
                    opacity = 0.5 + combinedLevel * 0.5;
                  } else {
                    const fakeLevel = fakeWaveLevels[i] || 0.2;
                    waveHeight = Math.max(3, fakeLevel * 16);
                    opacity = 0.4 + fakeLevel * 0.4;
                  }
                  
                  return (
                    <div
                      key={i}
                      className="w-[2px] bg-black rounded-full transition-all duration-140 ease-linear"
                      style={{
                        height: `${waveHeight}px`,
                        opacity: opacity,
                      }}
                    />
                  );
                })}

                {/* Points Right */}
                <div className="flex flex-col justify-between h-6 ml-1 opacity-60">
                  <div className="h-[3px] w-[3px] rounded-full bg-black" />
                  <div className="h-[3px] w-[3px] rounded-full bg-black" />
                </div>
              </div>
            )}
            {quickHint ? (
              <div className="absolute left-2 -top-1 translate-y-[-70%] ak-caption font-semibold text-[var(--ak-color-success)] flex items-center gap-1">
                <span>{quickHint}</span>
                <button
                  type="button"
                  onClick={() => setQuickHint("")}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--ak-color-success)] hover:bg-[var(--ak-color-bg-hover)]"
                  aria-label={t('chat.closeHint')}
                >
                  ×
                </button>
              </div>
            ) : null}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                aria-label={t('chat.openMenu')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

            {isPlusMenuOpen && (
              <>
                <div className="fixed inset-0 z-[9998] cursor-default pointer-events-auto" onClick={() => setIsPlusMenuOpen(false)} />
                <div className="ak-glass absolute bottom-full left-0 z-[9999] mb-4 w-72 origin-bottom-left rounded-2xl border border-white/40 shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left text-sm font-medium text-gray-700 hover:bg-black/5 transition-colors"
                    >
                      <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
                      Datei oder Foto hochladen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        setInput("Führe eine intensive Internetsuche durch zu: ");
                        inputRef.current?.focus();
                        if (inputRef.current) {
                          inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
                        }
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left text-sm font-medium text-gray-700 hover:bg-black/5 transition-colors"
                    >
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      Intensive Internetsuche
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>

          <textarea
            value={shouldHideInput ? "" : input}
            onChange={(e) => {
              if (shouldHideInput) return;
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              } else if (e.key === "ArrowUp" && input.trim() === "" && !attachments.length) {
                e.preventDefault();
                handleEditMessage();
              }
            }}
            placeholder={shouldHideInput ? "" : "Schreibe mit Aklow"}
            ref={(el) => {
              inputRef.current = el;
            }}
            rows={1}
            readOnly={shouldHideInput}
            aria-disabled={shouldHideInput}
          style={{ WebkitAppearance: 'none' }}
            className={clsx(
              "ak-body flex-1 border-none bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-secondary)] focus:ring-0 focus:outline-none outline-none ring-0 border-0 shadow-none resize-none py-1 max-h-[200px] overflow-y-auto focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!border-none focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!shadow-none focus-visible:!border-none",
              shouldHideInput && "text-transparent placeholder-transparent caret-transparent cursor-not-allowed select-none opacity-80"
            )}
          />

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                void pressRealtime();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                void releaseRealtime();
              }}
              onMouseLeave={() => {
                if (tooltipTimeoutRef.current) {
                  clearTimeout(tooltipTimeoutRef.current);
                  tooltipTimeoutRef.current = null;
                }
                setHoveredTooltip(null);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                void pressRealtime();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                void releaseRealtime();
              }}
              className={clsx(
                "relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px]",
                isMicrophoneActive && "ring-2 ring-[var(--ak-color-bg-danger-soft)] ring-offset-2",
                isRealtimeActive && "bg-red-500/20 text-red-600"
              )}
              aria-label={t('chat.microphone')}
              onMouseEnter={() => {
                if (isRealtimeActive) {
                  if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                  }
                  tooltipTimeoutRef.current = setTimeout(() => {
                    setHoveredTooltip({ messageId: "realtime-tooltip", icon: "realtime" });
                  }, 500);
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              {hoveredTooltip?.messageId === "realtime-tooltip" && hoveredTooltip?.icon === "realtime" && (
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                  Real time on
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={isSending ? handleStopGeneration : () => handleSend()}
              disabled={!isSending && !input.trim()}
              className={clsx(
                "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full shadow-[var(--ak-shadow-soft)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-95 border",
                isSending 
                  ? "bg-black text-white hover:bg-gray-800 border-transparent"
                  : input.trim()
                    ? "bg-green-500 text-white hover:opacity-90 border-gray-300/40"
                    : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-muted)] border-gray-300/40",
                "disabled:opacity-60"
              )}
              aria-label={isSending ? t('chat.stopGenerating') : t('chat.send')}
            >
              {isSending ? (
                <div className="h-3 w-3 bg-white rounded-sm" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={clsx("h-4 w-4", input.trim() ? "text-white" : "text-[var(--ak-color-text-primary)]")}>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf,audio/*,video/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Debug HUD */}
      {isDebug && (
        <div className="fixed top-4 right-4 z-[10000] p-3 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 text-[10px] font-mono text-green-400 shadow-2xl pointer-events-none select-none max-w-xs space-y-1">
          <div className="flex justify-between border-b border-white/10 pb-1 mb-1">
            <span className="text-white font-bold uppercase">Debug HUD</span>
            <span className="text-gray-400">v1.0</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">activeThreadId:</span>
            <span className="truncate ml-2">{activeThreadId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">pinnedToBottom:</span>
            <span>{pinnedToBottom ? "TRUE" : "FALSE"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">messages:</span>
            <span>{messages.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">isSending:</span>
            <span className={isSending ? "text-orange-400" : ""}>{isSending ? "STREAMING" : "IDLE"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">tenantId:</span>
            <span>{tenantId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">industry:</span>
            <span>GENERAL</span>
          </div>
        </div>
      )}
    </div>
  );
}
