"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { RectangleStackIcon, ClipboardDocumentIcon, BookmarkIcon, ArrowPathIcon, SpeakerWaveIcon, PencilSquareIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { WidgetRenderer } from "./chat/WidgetRenderer";
import { sendChatMessageStream, ChatResponse } from "../lib/chatClient";
import { filterDuplicateTextUiMessages } from "../lib/uiMessageText";
import { useDictation } from "../hooks/useDictation";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { ThinkingStepsDrawer } from "./chat/ThinkingStepsDrawer";
import { ChatMarkdown } from "./chat/markdown/ChatMarkdown";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

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
};

export function ChatShell() {
  const [tenantId] = useState<string>("demo-tenant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [quickHint, setQuickHint] = useState<string>("");
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [thinkingNote, setThinkingNote] = useState<string | null>(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ messageId: string; icon: string } | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const hoverMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredUserMessageId, setHoveredUserMessageId] = useState<string | null>(null);
  const hoverUserMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const currentThreadRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { supported: ttsSupported, speakingId, toggle: toggleTts, stop: stopTts } =
    useSpeechSynthesis("de-DE");

  const { status: dictationStatus, startRecording, stopRecording } = useDictation({
    onTranscriptionReady: (text) => {
      setInput((prev) => prev + (prev ? " " : "") + text);
    },
  });

  const [realtimeTextBuffer, setRealtimeTextBuffer] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioBands, setAudioBands] = useState<number[]>(Array(20).fill(0));
  const audioLevelIntervalRef = useRef<number | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [fakeWaveLevels, setFakeWaveLevels] = useState<number[]>(Array(20).fill(0.3));
  const fakeWaveIntervalRef = useRef<number | null>(null);

  const { status: realtimeStatus, toggle: toggleRealtime } = useRealtimeVoice({
    onStart: () => {
      console.log("Real-time Audio gestartet");
      setRealtimeTextBuffer("");
      // Starte echte Audio-Level-Messung
      startAudioLevelMeasurement();
    },
    onStop: () => {
      console.log("Real-time Audio gestoppt");
      stopAudioLevelMeasurement();
      setAudioLevel(0);
      setRealtimeTextBuffer("");
    },
    onTextDelta: (text: string) => {
      setRealtimeTextBuffer((prev) => prev + text);
    },
  });

  // Funktion zum Starten der Audio-Level-Messung
  const startAudioLevelMeasurement = useCallback(async () => {
    try {
      // Verwende bereits vorhandenen Stream, falls verfügbar
      let stream = audioStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
      }
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      audioAnalyserRef.current = analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
      audioDataArrayRef.current = dataArray;
      
      const measureAudio = () => {
        if (audioAnalyserRef.current && audioDataArrayRef.current) {
          // @ts-expect-error - TypeScript strict mode issue with Web Audio API types
          audioAnalyserRef.current.getByteFrequencyData(audioDataArrayRef.current);
          
          // Berechne durchschnittliche Amplitude
          let sum = 0;
          for (let i = 0; i < audioDataArrayRef.current.length; i++) {
            sum += audioDataArrayRef.current[i];
          }
          const average = sum / audioDataArrayRef.current.length;
          const normalizedLevel = average / 255; // Normalisiere auf 0-1
          
          setAudioLevel(normalizedLevel);

          // Berechne 20 Bänder für die Visualisierung und speichere sie im State
          const bands: number[] = [];
          for (let i = 0; i < 20; i++) {
            const idx = Math.floor((i / 20) * audioDataArrayRef.current.length);
            bands.push(audioDataArrayRef.current[idx] / 255);
          }
          setAudioBands(bands);
          
          // Prüfe ob Mikrofon noch aktiv ist
          const stillActive = dictationStatus === "recording" || 
                              dictationStatus === "transcribing" || 
                              realtimeStatus === "live" || 
                              realtimeStatus === "connecting";
          
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
                        realtimeStatus === "live" || 
                        realtimeStatus === "connecting";
    if (audioStreamRef.current && !stillActive) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  }, [dictationStatus, realtimeStatus]);

  const isMicrophoneActive =
    dictationStatus === "recording" ||
    dictationStatus === "transcribing" ||
    realtimeStatus === "live" ||
    realtimeStatus === "connecting";
  
  const isRealtimeActive = realtimeStatus === "live" || realtimeStatus === "connecting";
  const shouldHideInput = isMicrophoneActive || isRealtimeActive;
  
  // Audio-Level für Diktat-Mode
  useEffect(() => {
    if (dictationStatus === "recording" && !isRealtimeActive) {
      startAudioLevelMeasurement();
    } else if (dictationStatus !== "recording" && !isRealtimeActive) {
      stopAudioLevelMeasurement();
      setAudioLevel(0);
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
      setFakeWaveLevels(Array(20).fill(0.2));
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

  const threadStorageKey = (threadId: string) => `aklow_thread_${threadId}`;

  const loadMessages = useCallback((threadId: string) => {
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
  }, []);

  const saveMessages = useCallback((threadId: string, list: ChatMessage[]) => {
    try {
      localStorage.setItem(threadStorageKey(threadId), JSON.stringify(list));
    } catch (e) {
      console.warn("Konnte Messages nicht speichern", e);
    }
  }, []);

  const makeTitle = (text: string) => {
    const clean = text.replace(/\s+/g, " ").trim();
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    const firstTwo = sentences.slice(0, 2).join(" ");
    const base = firstTwo || clean;
    return base.length > 80 ? base.slice(0, 77) + "…" : base || "Neuer Chat";
  };

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string } | undefined;
      if (!detail?.threadId) return;
      currentThreadRef.current = detail.threadId;
      const loaded = loadMessages(detail.threadId);
      setMessages(loaded);
      setInput("");
      setFollowUpSuggestions([]);
      setThinkingSteps([]);
      setThinkingNote(null);
      setIsStepsOpen(false);
      stopTts();
      inputRef.current?.focus();
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
      currentThreadRef.current = newId;
      const loaded = loadMessages(newId);
      setMessages(loaded);
      setInput("");
      setFollowUpSuggestions([]);
      setThinkingSteps([]);
      setThinkingNote(null);
      setIsStepsOpen(false);
      stopTts();
      inputRef.current?.focus();
    };

    window.addEventListener("aklow-select-thread", handleSelect as EventListener);
    window.addEventListener("aklow-new-chat", handleNew as EventListener);

    // Command Palette Event Handlers
    const handleToggleDictation = () => {
      if (dictationStatus === "recording") {
        stopRecording();
      } else if (dictationStatus === "idle" || dictationStatus === "error") {
        startRecording();
      }
    };

    const handleToggleRealtime = () => {
      toggleRealtime();
    };

    const handleStopTts = () => {
      stopTts();
    };

    const handleCopyMessage = () => {
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMessage?.text) {
        navigator.clipboard.writeText(lastAssistantMessage.text);
      }
    };

    const handleEditMessage = () => {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMessage) {
        setEditingMessageId(lastUserMessage.id);
        setEditingText(lastUserMessage.text);
      }
    };

    const handleSaveMessage = async () => {
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
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
      const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMessage?.text) {
        setInput(lastUserMessage.text);
        inputRef.current?.focus();
      }
    };

    const handleReadMessage = () => {
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMessage?.text) {
        toggleTts({ id: lastAssistantMessage.id, text: lastAssistantMessage.text, lang: "de-DE" });
      }
    };

    const handleOpenQuickActions = () => {
      // Trigger quick actions menu - find last assistant message and trigger quick actions
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMessage) {
        // Simulate click on quick actions button for last message
        const quickActionsButton = document.querySelector(`[data-message-id="${lastAssistantMessage.id}"] [aria-label="Schnellaktionen"]`) as HTMLButtonElement;
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

    return () => {
      window.removeEventListener("aklow-select-thread", handleSelect as EventListener);
      window.removeEventListener("aklow-new-chat", handleNew as EventListener);
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
    };
  }, [loadMessages, stopTts, dictationStatus, startRecording, stopRecording, toggleRealtime, toggleTts, messages, setInput, tenantId]);

  // Initial load messages on mount if thread is already selected
  useEffect(() => {
    if (!currentThreadRef.current && messages.length === 0) {
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
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      stopTts();
    };
  }, [stopTts]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0];
  const isLastAssistantMessage = (msg: ChatMessage) => msg.id === lastAssistantMessage?.id;

  const showThinking = isSending && (thinkingSteps.length > 0 || !!thinkingNote);

  const renderMessage = (message: ChatMessage) => {
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
        
        const threadId = currentThreadRef.current || "thread-default";
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
          className="group flex justify-end"
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
          style={{ marginLeft: "auto", maxWidth: "60%", marginRight: "3%" }}
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
                  className="ak-body whitespace-pre-wrap leading-relaxed rounded-xl px-2.5 py-1.5 shadow-sm text-right bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: "var(--ak-color-text-primary)", fontSize: "16px", minHeight: "60px" }}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleEditSave}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Senden
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="ak-body whitespace-pre-wrap leading-relaxed rounded-xl px-2.5 py-1.5 shadow-sm text-right bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)]"
                style={{ color: "var(--ak-color-text-primary)", fontSize: "16px" }}
              >
                {message.text}
              </div>
            )}
            
            {/* Hover Menu für Benutzernachrichten */}
            <div 
              className={`${hoveredUserMessageId === message.id ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ease-in-out flex items-center gap-1 -mt-3`}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={handleUserEdit}
                  onMouseEnter={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredTooltip({ messageId: message.id, icon: 'edit' });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setHoveredTooltip(null);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-black transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                  aria-label="Nachricht bearbeiten"
                >
                  <PencilSquareIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'edit' && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    Bearbeiten
                  </span>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleUserCopy}
                  onMouseEnter={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredTooltip({ messageId: message.id, icon: 'copy' });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setHoveredTooltip(null);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-black transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                  aria-label="Nachricht kopieren"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'copy' && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    Kopieren
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
        const threadId = currentThreadRef.current || "thread-default";
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
      const threadId = currentThreadRef.current || "thread-default";
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

    const handleQuickActions = () => {
      // TODO: Implement quick actions functionality
      console.log("Quick actions for message:", message.id);
    };

    return (
      <div
        key={message.id}
        className="group flex justify-start"
        onMouseEnter={() => {
          if (hoverMenuTimeoutRef.current) {
            clearTimeout(hoverMenuTimeoutRef.current);
          }
          hoverMenuTimeoutRef.current = setTimeout(() => {
            setHoveredMessageId(message.id);
          }, 500);
        }}
        onMouseLeave={() => {
          if (hoverMenuTimeoutRef.current) {
            clearTimeout(hoverMenuTimeoutRef.current);
            hoverMenuTimeoutRef.current = null;
          }
          setHoveredMessageId(null);
        }}
        style={{
          marginLeft: "3%",
          maxWidth: "85%",
          opacity: 1,
        }}
      >
        <div className="flex w-full items-start">
          <div className="flex w-full flex-col gap-3" style={{ alignItems: "flex-start" }}>
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <ChatMarkdown content={message.text} />
              </div>
                {thinkingSteps.length > 0 && isLastAssistantMessage(message) ? (
                  <button
                    type="button"
                    onClick={() => setIsStepsOpen(true)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[var(--ak-color-text-secondary)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
                    aria-label="Orchestrator anzeigen"
                  >
                    <RectangleStackIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : null}
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
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-blue-600 hover:bg-blue-50 transition-colors"
                  aria-label="Vorlesen stoppen"
                >
                  <SpeakerWaveIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
              </div>
            )}

            {/* Hover Menu - nur bei Hover sichtbar */}
            <div 
              className={`${hoveredMessageId === message.id ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ease-in-out flex items-center gap-1 -mt-0.5`}
              onMouseLeave={() => {
                if (tooltipTimeoutRef.current) {
                  clearTimeout(tooltipTimeoutRef.current);
                  tooltipTimeoutRef.current = null;
                }
                setHoveredTooltip(null);
              }}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={handleCopy}
                  onMouseEnter={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredTooltip({ messageId: message.id, icon: 'copy' });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setHoveredTooltip(null);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-black transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                  aria-label="Nachricht kopieren"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'copy' && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    Kopieren
                  </span>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleSave}
                  onMouseEnter={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredTooltip({ messageId: message.id, icon: 'save' });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setHoveredTooltip(null);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-black transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                  aria-label="Nachricht speichern"
                >
                  <BookmarkIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
                {savedMessageId === message.id ? (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-green-600 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    Gespeichert
                  </span>
                ) : hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'save' ? (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    Speichern
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleUpdate}
                  onMouseEnter={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredTooltip({ messageId: message.id, icon: 'update' });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setHoveredTooltip(null);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-black transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                  aria-label="Nachricht aktualisieren"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'update' && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    Aktualisieren
                  </span>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleReadAloud}
                  disabled={!ttsSupported || !message.text || message.text.trim().length === 0}
                  onMouseEnter={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredTooltip({ messageId: message.id, icon: 'read' });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setHoveredTooltip(null);
                  }}
                  className={clsx(
                    "inline-flex h-6 w-6 items-center justify-center rounded text-black transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] disabled:opacity-50",
                    ttsActive && "text-[var(--ak-color-accent)]"
                  )}
                  aria-label={ttsActive ? "Vorlesen stoppen" : "Vorlesen"}
                >
                  <SpeakerWaveIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'read' && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    {ttsActive ? "Stoppen" : "Vorlesen"}
                  </span>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleQuickActions}
                  onMouseEnter={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setHoveredTooltip({ messageId: message.id, icon: 'quick-actions' });
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setHoveredTooltip(null);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-black transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                  aria-label="Schnellaktionen"
                >
                  <SparklesIcon className="h-4 w-4" aria-hidden="true" strokeWidth={1} />
                </button>
                {hoveredTooltip?.messageId === message.id && hoveredTooltip?.icon === 'quick-actions' && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    Schnellaktionen
                  </span>
                )}
              </div>
            </div>

            {Array.isArray(message.uiMessages) && message.uiMessages.length > 0 ? (
              <div className="mt-3 w-full space-y-3">
                {message.uiMessages.map((uiMessage, index) => (
                  <WidgetRenderer key={index} message={uiMessage} />
                ))}
              </div>
            ) : null}

            {isLastAssistantMessage(message) && followUpSuggestions.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 items-start animate-[fadeInUp_0.3s_var(--ak-motion-ease)]">
                {followUpSuggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    type="button"
                    onClick={() => handleQuickCardClick(suggestion)}
                    className="ak-body text-left text-[var(--ak-color-accent)] hover:text-[var(--ak-color-accent-strong)] hover:underline transition-colors cursor-pointer"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.3s var(--ak-motion-ease) forwards",
                      opacity: 0,
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  async function sendMessage(trimmed: string) {
    if (!trimmed || isSending) return;
    const threadId = currentThreadRef.current || "thread-default";
    stopTts();

    const generateId = () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return `${performance.now()}-${Math.random().toString(36).slice(2)}`;
    };

    const userMessageId = `user-${generateId()}`;

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      saveMessages(threadId, next);
      return next;
    });
    setInput("");
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
      // Check if assistant message with this ID already exists to prevent duplicates
      const exists = prev.some(msg => msg.id === assistantMessageId);
      if (exists) {
        return prev;
      }
      const next = [...prev, assistantMessage];
      saveMessages(threadId, next);
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
              saveMessages(threadId, updated);
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
              
              saveMessages(threadId, finalMessages);
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

            if (typeof window !== "undefined") {
              const title = makeTitle(trimmed);
              window.dispatchEvent(
                new CustomEvent("aklow-thread-preview", {
                  detail: {
                    threadId,
                    title,
                    preview: finalContent.slice(0, 120) || trimmed,
                    lastMessageAt: performance.now(),
                  },
                })
              );
            }

            setThinkingNote(null);
            setIsSending(false);
          },
          onError: (error) => {
            const errorText = error.message || "Unbekannter Fehler im Chat";
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, text: "Fehler beim Senden: " + errorText } : msg
              );
              saveMessages(threadId, updated);
              return updated;
            });
            setThinkingNote("Fehler beim Streamen");
            setIsSending(false);
          },
        },
        {
          tenantId,
          sessionId: threadId,
          channel: "web_chat",
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
  }

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    await sendMessage(trimmed);
  }

  async function handleQuickCardClick(text: string) {
    setFollowUpSuggestions([]);
    await sendMessage(text);
  }

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
      className="flex h-full flex-col gap-4 rounded-2xl px-4 pt-4 pb-2 relative"
      style={{
        background: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "var(--ak-shadow-glass)",
      }}
    >
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
      `}</style>

      <ThinkingStepsDrawer
        open={isStepsOpen}
        onClose={() => setIsStepsOpen(false)}
        steps={thinkingSteps}
        note={thinkingNote}
      />

      <div className="flex-1 overflow-y-auto space-y-6 px-[5%] py-2 pb-20 mx-auto max-w-3xl">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="ak-heading font-medium text-[var(--ak-color-text-primary)]" style={{ fontSize: "2rem" }}>
              Was kann ich für dich tun?
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {showThinking && (
              <div className="flex justify-start relative px-[5%]">
                <div className="flex items-center gap-1 relative">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"
                    style={{ 
                      animation: "thinking-dot-blink 1.2s ease-in-out infinite", 
                      animationDelay: "0ms"
                    }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"
                    style={{ 
                      animation: "thinking-dot-blink 1.2s ease-in-out infinite", 
                      animationDelay: "400ms"
                    }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"
                    style={{ 
                      animation: "thinking-dot-blink 1.2s ease-in-out infinite", 
                      animationDelay: "800ms"
                    }}
                  />
                  <span 
                    className="ml-3 text-gray-400 text-sm font-light"
                    style={{ 
                      animation: "flicker 2s ease-in-out infinite"
                    }}
                  >
                    Denke nach...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSend} className="px-[5%]">
        <div className={clsx(
          "relative flex items-center gap-2 rounded-xl px-4 py-3 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] shadow-[var(--ak-shadow-glass)] focus-within:scale-[1.01] border backdrop-blur-2xl outline-none ring-0 focus-within:outline-none focus-within:ring-0",
          isRealtimeActive 
            ? "bg-red-500/20 border-red-400/50 focus-within:border-red-400/70" 
            : "border-gray-300 bg-gradient-to-b from-gray-100/80 via-gray-100/70 to-gray-100/60 focus-within:border-gray-300"
        )}>
          {/* Audio-Wellen-Visualisierung - zentriert, schwarz, doppelt so breit, mit echten Audio-Daten oder zufälliger Animation */}
          {isMicrophoneActive && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-[32%] min-w-[180px] max-w-[360px] items-end justify-center gap-[2px]"
            >
              {/* Punkte links */}
              <div className="flex flex-col justify-between h-6 mr-1 opacity-60">
                <div className="h-[3px] w-[3px] rounded-full bg-black" />
                <div className="h-[3px] w-[3px] rounded-full bg-black" />
              </div>

              {/* Balken */}
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

              {/* Punkte rechts */}
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
                aria-label="Hinweis schließen"
              >
                ×
              </button>
            </div>
          ) : null}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
              aria-label="Menü öffnen"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {isPlusMenuOpen && (
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setIsPlusMenuOpen(false)} />
                <div className="ak-glass absolute bottom-full left-0 z-[9999] mb-2 w-64 origin-bottom-left rounded-xl border shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="ak-body w-full px-4 py-3 text-left text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      Datei oder Foto hochladen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        setQuickHint("Intensive Internetsuche aktiviert");
                      }}
                      className="ak-body w-full px-4 py-3 text-left text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      Intensive Internetsuche
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <input
            type="text"
            value={shouldHideInput ? "" : input}
            onChange={(e) => {
              if (shouldHideInput) return;
              setInput(e.target.value);
            }}
            placeholder={shouldHideInput ? "" : "Schreibe mit Aklow"}
            ref={inputRef}
            readOnly={shouldHideInput}
            aria-disabled={shouldHideInput}
            className={clsx(
              "ak-body flex-1 border-none bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-secondary)] focus-visible:outline-none outline-none ring-0",
              shouldHideInput && "text-transparent placeholder-transparent caret-transparent cursor-not-allowed select-none opacity-80"
            )}
          />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              isLongPressRef.current = false;
              longPressTimerRef.current = setTimeout(() => {
                isLongPressRef.current = true;
                if (realtimeStatus === "idle" || realtimeStatus === "error") {
                  toggleRealtime();
                }
              }, 3000);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }

              if (!isLongPressRef.current) {
                if (realtimeStatus === "live") {
                  toggleRealtime();
                } else if (dictationStatus === "recording") {
                  stopRecording();
                } else if (dictationStatus === "idle" || dictationStatus === "error") {
                  startRecording();
                }
              }
              isLongPressRef.current = false;
            }}
            onMouseLeave={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
              }
              setHoveredTooltip(null);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              isLongPressRef.current = false;
              longPressTimerRef.current = setTimeout(() => {
                isLongPressRef.current = true;
                if (realtimeStatus === "idle" || realtimeStatus === "error") {
                  toggleRealtime();
                }
              }, 3000);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }

              if (!isLongPressRef.current) {
                if (realtimeStatus === "live") {
                  toggleRealtime();
                } else if (dictationStatus === "recording") {
                  stopRecording();
                } else if (dictationStatus === "idle" || dictationStatus === "error") {
                  startRecording();
                }
              }
              isLongPressRef.current = false;
            }}
            className={clsx(
              "relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px]",
              isMicrophoneActive && "ring-2 ring-[var(--ak-color-bg-danger-soft)] ring-offset-2",
              isRealtimeActive && "bg-red-500/20 text-red-600"
            )}
            aria-label="Mikrofon"
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
            type="submit"
            disabled={isSending || !input.trim()}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-full shadow-[var(--ak-shadow-soft)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-95 border",
              input.trim()
                ? "bg-green-500 text-white hover:opacity-90 border-gray-300/40"
                : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-muted)] border-gray-300/40",
              "disabled:opacity-60"
            )}
            aria-label="Senden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={clsx("h-4 w-4", input.trim() ? "text-white" : "text-[var(--ak-color-text-primary)]")}>
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,application/pdf,audio/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setInput((prev) => (prev ? `${prev} [Upload: ${file.name}]` : `[Upload: ${file.name}]`));
            }
            e.target.value = "";
          }}
        />
      </form>
    </div>
  );
}
