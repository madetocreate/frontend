"use client";

import { useState, FormEvent, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
// Virtuoso removed - using simple scroll container for ChatGPT-style layout
import clsx from "clsx";
import { 
  ClipboardDocumentIcon, 
  BookmarkIcon, 
  ArrowPathIcon, 
  SpeakerWaveIcon, 
  PencilSquareIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  EllipsisHorizontalIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  DocumentIcon,
  XMarkIcon,
  ShareIcon,
  InformationCircleIcon,
  SparklesIcon,
  InboxIcon,
  CheckCircleIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import { WidgetRenderer } from "./chat/WidgetRenderer";
import { sendChatMessageStream, ChatResponse } from "../lib/chatClient";
import { filterDuplicateTextUiMessages } from "../lib/uiMessageText";
import { useDictation } from "../hooks/useDictation";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
// Lazy load ThinkingStepsDrawer
const ThinkingStepsDrawer = dynamic(() => import("./chat/ThinkingStepsDrawer").then(mod => ({ default: mod.ThinkingStepsDrawer })), {
  ssr: false,
});
import { ChatMarkdown } from "./chat/markdown/ChatMarkdown";
import { normalizeChatMarkdown } from "./chat/markdown/normalizeChatMarkdown";
import { ChatExportDialog } from "./chat/ChatExportDialog";
import type { ExportMessage } from "@/lib/chatExport";
import { useAklowEscape } from "../hooks/useAklowEscape";
import { useChatThreads, setActiveThreadId, updateChatThread, writeChatThreads, createChatThread, removeTemporaryThreadTracking } from "../lib/chatThreadsStore";
import { useProjects, addProjectFiles, type ProjectFileRef } from "../lib/projectsStore";
import { createGatewayClient } from "../sdk/gateway";
import { Pills, type Pill } from "./chat/Pills";
import { startRun, sendInput, type ActionRunEvent } from "../lib/actionRuns/client";
import { useSearchParams, useRouter } from "next/navigation";
import type { ComposerMode } from "../types/chat";
import { ComposerMenu } from "./ComposerMenu";
import { useComposerState } from "../hooks/chat/useComposerState";
import { useThreadState } from "../hooks/chat/useThreadState";
import { useStreamingAndVoice } from "../hooks/chat/useStreamingAndVoice";
import { useMemoryIntegration } from "../hooks/chat/useMemoryIntegration";
import { readMemoryEnabled, subscribeMemoryEnabled } from "../lib/preferences/memoryPreferences";
import { stripInlineMemoryMarkers } from "../lib/memoryMarkers";
import { saveMemory, searchMemory as searchMemoryAPI } from "../lib/memoryClient";
// import { currentIndustry } from "../lib/featureFlags"; // Not used
import { useTranslation } from "../i18n";
import { formatTime } from "../lib/formatTime";
import { getCustomInstructionsPrompt } from "../lib/customInstructionsStore";
import { 
  ChatCard, 
  CardRenderer, 
  ListCardPayload, 
  EntityCardPayload, 
  ContextCardRenderer 
} from "./chat/cards";
import { getActionDefinition } from "../lib/actions/registry";
import { ComposeCard } from "./inbox/ComposeCard";
import { sendInboxMessage } from "@/features/inbox/api";
import { toast } from "sonner";
import { OutputCardFrame } from "@/components/ui/OutputCardFrame";
import { AkIconButton } from "@/components/ui/AkIconButton";
import { AkChip } from "@/components/ui/AkChip";
import { MessageFrame } from "./chat/MessageFrame";
import { ChatGreetingCard } from "@/components/chat/ChatGreetingCard";
import { ChatActionBar, type ChatAction, type ChatActionType } from "./chat/ChatActionBar";
import { AkPopoverMenu, type PopoverMenuItem } from "./ui/AkPopoverMenu";
import { appendWorkLog } from "../lib/worklog/storage";
import { dispatchActionStart } from "@/lib/actions/dispatch";
import { subscribeQuickAction } from "@/lib/quickActionsBus";
import { buildQuickActionPrompt } from "@/lib/quickActionPrompts";
import { dispatchPrefillChat, dispatchFocusChat } from "@/lib/events/dispatch";
import { DeepResearchModal } from "./chat/DeepResearchModal";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { getTenantId } from "@/lib/tenant";

import { ChatJob } from "../types/chatJobs";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp?: number; // Unix timestamp in milliseconds
  uiMessages?: ChatResponse["uiMessages"];
  card?: ChatCard;
  pills?: Pill[];
  runId?: string;
  runState?: "WAITING_INPUT" | "RUNNING" | "DONE";
  step?: string;
  pendingStepKey?: string;
  pendingInputKey?: string;
  job?: ChatJob;
  usedMemories?: Array<{
    id: string;
    content: string;
    type?: string;
  }>;
  // Regenerate candidates
  candidateGroupId?: string;
  candidateIndex?: number;
  isCurrent?: boolean;
  // Status info for chips
  statusInfo?: {
    stage?: string;
    toolName?: string;
    details?: string;
  };
};

type ThinkingStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
  details?: string;
};

/**
 * Helper function to extract output text from action run result.
 * Tries multiple possible locations in the result object.
 */
function extractOutputTextFromResult(result: Record<string, unknown>): string | null {
  // Try results.execute_action.output first (most specific)
  if (result.results && typeof result.results === "object") {
    const results = result.results as Record<string, unknown>;
    if (results.execute_action && typeof results.execute_action === "object") {
      const executeAction = results.execute_action as Record<string, unknown>;
      if (executeAction.output && typeof executeAction.output === "string" && executeAction.output.trim()) {
        return executeAction.output;
      }
    }
    
    // Try first non-empty output string in results
    for (const key in results) {
      const value = results[key];
      if (typeof value === "object" && value !== null) {
        const obj = value as Record<string, unknown>;
        if (obj.output && typeof obj.output === "string" && obj.output.trim()) {
          return obj.output;
        }
      } else if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }
  
  // ActionOutputV1: Unterstütze notification, plan, reply
  if (result.type === "notification" && typeof result.notification === "string" && result.notification.trim()) {
    return result.notification;
  }
  if (result.type === "plan") {
    const title = (result.title as string) || "";
    const steps = (result.steps as string[] | undefined) || [];
    if (title || steps.length > 0) {
      return [title, ...steps].filter(Boolean).join("\n");
    }
  }
  if (result.type === "reply" && typeof result.reply === "string" && result.reply.trim()) {
    return result.reply;
  }
  
  // Fallback to summary_text
  if (result.summary_text && typeof result.summary_text === "string" && result.summary_text.trim()) {
    return result.summary_text;
  }
  
  return null;
}

/**
 * Konvertiert ActionOutputV1 zu ChatCard.
 * 
 * Nutzt die gemeinsame Utility aus lib/actions/outputToCard.ts.
 */
function convertActionOutputV1ToCard(
  result: Record<string, unknown>,
  actionId?: string
): ChatCard | null {
  // Importiere die gemeinsame Utility
  const { actionOutputV1ToCard } = require('@/lib/actions/outputToCard');
  return actionOutputV1ToCard(result, actionId);
}

export function ChatShell() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  // Get tenantId from AuthContext (primary source) with fallback to getTenantId()
  // Reaktiv halten: tenantId kann sich nach Login ändern
  const auth = useAuth();
  const tenantIdFromAuth = auth?.tenantId || null;
  // Reaktiver Fallback: wird neu berechnet wenn auth sich ändert
  const tenantIdFallback = useMemo(() => getTenantId(), [auth?.user, auth?.tenantId]);
  const tenantId = tenantIdFromAuth || tenantIdFallback;
  
  // Debug logging (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!tenantId) {
        console.warn('[ChatShell] tenantId missing:', {
          fromAuth: tenantIdFromAuth,
          fromFallback: tenantIdFallback,
          hasUser: !!auth?.user,
        });
      } else {
        console.debug('[ChatShell] tenantId resolved:', {
          source: tenantIdFromAuth ? 'AuthContext' : 'getTenantId()',
          tenantId,
        });
      }
    }
  }, [tenantId, tenantIdFromAuth, tenantIdFallback, auth?.user]);
  
  // Compose Card State
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [composeChannel, setComposeChannel] = useState<'email' | 'messenger'>('email')
  
  // Deep Research State
  const [isDeepResearchModalOpen, setIsDeepResearchModalOpen] = useState(false)
  const { isEntitled } = useEntitlements()

  // Export Dialog State
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  
  // Gateway Client for v2 APIs
  const gatewayClient = useMemo(() => {
    const { getApiBaseUrl } = require('@/lib/env')
    const raw = (process.env.NEXT_PUBLIC_CHAT_TRANSPORT || '').toLowerCase()
    const transport =
      raw === 'next_proxy' || raw === 'proxy'
        ? 'next_proxy'
        : raw === 'direct'
          ? 'direct'
          : !process.env.NEXT_PUBLIC_CHAT_TRANSPORT
            ? 'next_proxy'
            : 'direct'
    const baseUrl = transport === 'direct' 
      ? getApiBaseUrl()
      : ''
    return createGatewayClient({
      transport,
      baseUrl,
      getAuthToken: () => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('auth_token') || process.env.NEXT_PUBLIC_AUTH_TOKEN || null
      },
    })
  }, [])
  
  // Composer State Hook
  const composerState = useComposerState();
  const {
    input,
    setInput,
    attachments,
    setAttachments,
    isDragging,
    isPlusMenuOpen,
    setIsPlusMenuOpen,
    composerMode,
    setComposerMode,
    memoryEnabled,
    setMemoryEnabled,
    temporaryChat,
    setTemporaryChat,
    inputRef,
    fileInputRef,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    removeAttachment,
    clearAttachments,
  } = composerState;

  const { projects } = useProjects();
  const { userSettings } = useAppSettings();

  // Sync memory preference (global settings) into composer state
  useEffect(() => {
    setMemoryEnabled(readMemoryEnabled());
    const unsub = subscribeMemoryEnabled(() => setMemoryEnabled(readMemoryEnabled()));
    return () => unsub();
  }, [setMemoryEnabled])

  // Listen for compose card events
  useEffect(() => {
    const handleOpenCompose = (event: CustomEvent<{ channel?: 'email' | 'messenger' }>) => {
      const { channel = 'email' } = event.detail
      setComposeChannel(channel)
      setIsComposeOpen(true)
    }

    window.addEventListener('aklow-open-compose', handleOpenCompose as EventListener)
    return () => window.removeEventListener('aklow-open-compose', handleOpenCompose as EventListener)
  }, [])
  
  // Thread State Hook
  const threadState = useThreadState();
  const {
    threads,
    activeThreadId,
    storeActiveThreadId,
    setActiveThreadId,
    setActiveThreadIdLocal,
    messages,
    setMessages,
    showJumpToBottom,
    setShowJumpToBottom,
    ambientColor,
    messagesRef,
    activeThreadIdRef,
    currentThreadRef,
    isNearBottomRef,
  } = threadState;

  const handleStartDeepResearch = async (query: string) => {
    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: query,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    
    // 2. Add System/Loading Message
    const loadingMsgId = crypto.randomUUID();
    const loadingMsg: ChatMessage = {
      id: loadingMsgId,
      role: "assistant",
      text: "Intensive Internetsuche wird durchgeführt...",
      uiMessages: [{
        type: 'text',
        markdown: 'Intensive Internetsuche läuft...',
      }]
    };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      // 3. Call Backend
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/actions/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!res.ok) throw new Error("Research failed");
      
      const card = await res.json();
      
      // 4. Update Assistant Message with Card
      setMessages(prev => prev.map(m => {
        if (m.id === loadingMsgId) {
          return {
            ...m,
            text: "Recherche abgeschlossen.",
            uiMessages: undefined,
            card: card
          };
        }
        return m;
      }));
    } catch (err) {
      setMessages(prev => prev.map(m => {
        if (m.id === loadingMsgId) {
          return {
            ...m,
            text: "Fehler bei der Recherche.",
            uiMessages: undefined,
            card: {
              type: 'launch_gate_error',
              id: crypto.randomUUID(),
              title: 'Recherche fehlgeschlagen',
              content: 'Der Research Agent konnte nicht erreicht werden.',
              metadata: { errorCode: 'quota_exceeded' } // Fallback error type
            }
          };
        }
        return m;
      }));
    }
  }

  // Handle Chat Jobs
  useEffect(() => {
    const handleJobAdded = (e: any) => {
      const { job } = e.detail;
      const jobMessage: ChatMessage = {
        id: job.id,
        role: 'assistant',
        text: '',
        timestamp: Date.now(),
        job: job
      };
      setMessages(prev => [...prev, jobMessage]);
    };

    const handleJobCompleted = (e: any) => {
      const { jobId, resultText, error, status } = e.detail;
      setMessages(prev => {
        const next = [...prev];
        const jobIdx = next.findIndex(m => m.id === jobId);
        if (jobIdx !== -1) {
          next[jobIdx] = {
            ...next[jobIdx],
            job: { ...next[jobIdx].job!, status, error }
          };
        }
        
        if (status === 'done' && resultText) {
          next.push({
            id: `res-${jobId}`,
            role: 'assistant',
            text: resultText
          });
        }
        return next;
      });
    };

    window.addEventListener('aklow-chat-job-added', handleJobAdded);
    window.addEventListener('aklow-chat-job-completed', handleJobCompleted);
    return () => {
      window.removeEventListener('aklow-chat-job-added', handleJobAdded);
      window.removeEventListener('aklow-chat-job-completed', handleJobCompleted);
    };
  }, [setMessages]);
  
  // Streaming & Voice Hook
  const streamingAndVoice = useStreamingAndVoice(setInput);
  const {
    isSending,
    setIsSending,
    thinkingSteps,
    setThinkingSteps,
    thinkingNote,
    setThinkingNote,
    quickHint,
    setQuickHint,
    followUpSuggestions,
    setFollowUpSuggestions,
    isStepsOpen,
    setIsStepsOpen,
    abortControllerRef,
    ttsSupported,
    speakingId,
    toggleTts,
    stopTts,
    dictationStatus,
    startRecording,
    stopRecording,
    cancelRecording,
    realtimeStatus,
    pressRealtime,
    releaseRealtime,
    stopRealtimeAll,
    audioLevel,
    audioBands,
    isMicrophoneActive,
    isRealtimeActive,
    shouldHideInput,
  } = streamingAndVoice;
  
  // Dev-Token in localStorage sichern, falls vorhanden (für lokale Admin-/Action-API)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isProd = process.env.NODE_ENV === "production";
    const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    const hasToken = localStorage.getItem("auth_token");
    if (!isProd && envToken && !hasToken) {
      localStorage.setItem("auth_token", envToken);
    }
  }, []);

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
  const [shouldFollowOutput, setShouldFollowOutput] = useState(true);
  const pendingCardScrollRef = useRef<{ index: number; id: string } | null>(null);
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, "thumbs_up" | "thumbs_down">>({});
  const [expandedActions, setExpandedActions] = useState<Record<string, boolean>>({});
  // Candidates state: messageId -> { candidates: ChatMessage[], currentIndex: number }
  const [messageCandidates, setMessageCandidates] = useState<Record<string, { candidates: ChatMessage[]; currentIndex: number; candidateGroupId: string }>>({});
  // Web Search Toggle
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  const router = useRouter();
  // Fast Actions removed - handleSuggestionClick removed
  
  // Removed duplicate declarations - these come from composerState hook

  const isDebug = typeof window !== "undefined" && (window.location.search.includes("debug=1") || localStorage.getItem("aklow-debug") === "1");

  // Additional refs not in hooks
  const isSendingRef = useRef(false);
  const viewTransitionRef = useRef<{ transition: ReturnType<typeof document.startViewTransition> | null }>({ transition: null });
  const inputLatestRef = useRef("");

  useEffect(() => { isSendingRef.current = isSending; }, [isSending]);
  useEffect(() => { inputLatestRef.current = input; }, [input]);

  // Disable body and html scrolling when ChatShell is mounted
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const scrollParentRef = useRef<HTMLDivElement>(null);

  // Windowed rendering (Performance): nur die letzten N Nachrichten in den DOM rendern
  const [renderCount, setRenderCount] = useState(80)
  const [pendingPrependScroll, setPendingPrependScroll] = useState<{
    scrollTop: number
    scrollHeight: number
  } | null>(null)

  const visibleMessages = useMemo(() => {
    return messages.slice(-renderCount)
  }, [messages, renderCount])

  const hiddenMessageCount = messages.length - visibleMessages.length

  // Beim Thread-Wechsel wieder auf "latest window" zurück
  useEffect(() => {
    setRenderCount(80)
    setPendingPrependScroll(null)
  }, [activeThreadId])

  // Scroll-Position beim Nachladen älterer Messages stabil halten (kein Jump)
  useLayoutEffect(() => {
    if (!pendingPrependScroll) return
    const scrollParent = scrollParentRef.current
    if (!scrollParent) return

    const newScrollHeight = scrollParent.scrollHeight
    const delta = newScrollHeight - pendingPrependScroll.scrollHeight
    scrollParent.scrollTop = pendingPrependScroll.scrollTop + delta
    setPendingPrependScroll(null)
  }, [pendingPrependScroll, visibleMessages.length])

  // Audio measurement refs (not from hooks)
  const audioLevelIntervalRef = useRef<number | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fakeWaveIntervalRef = useRef<number | null>(null);

  // Additional audio measurement (local state, not from hook)
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [localAudioBands, setLocalAudioBands] = useState<number[]>(Array(20).fill(0));
  const [localFakeWaveLevels, setLocalFakeWaveLevels] = useState<number[]>(Array(20).fill(0.3));
  
  // Mikrofon-Timer State für 3-Sekunden-Erkennung
  const micPressStartRef = useRef<number | null>(null);
  const micPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const micModeRef = useRef<'dictation' | 'realtime' | null>(null);

  // Removed duplicate dictation/realtime - these come from streamingAndVoice hook
  const _unused_realtimeVoice = useRealtimeVoice({
    onStart: () => {
      console.log("Real-time Audio gestartet");
      startAudioLevelMeasurement();
    },
    onStop: () => {
      console.log("Real-time Audio gestoppt");
      stopAudioLevelMeasurement();
      setLocalAudioLevel(0);
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
          
          setLocalAudioLevel(normalizedLevel);

          const bands: number[] = [];
          const data = audioDataArrayRef.current;
          for (let i = 0; i < 20; i++) {
            // Focus on lower frequencies for speech (indices 0-30 usually)
            const freqIndex = Math.floor((i / 20) * (data.length * 0.6));
            bands.push(data[freqIndex] / 255);
          }
          setLocalAudioBands(bands);
          
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
      setLocalAudioLevel(0);
    }
  }, [dictationStatus, realtimeStatus]);

  // Removed duplicate declarations - these come from streamingAndVoice hook
  
  // Audio-Level für Diktat-Mode
  useEffect(() => {
    if (dictationStatus === "recording" && !isRealtimeActive) {
      startAudioLevelMeasurement();
    } else if (dictationStatus !== "recording" && !isRealtimeActive) {
      stopAudioLevelMeasurement();
      window.setTimeout(() => setLocalAudioLevel(0), 0);
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
        setLocalFakeWaveLevels(() =>
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
      window.setTimeout(() => setLocalFakeWaveLevels(Array(20).fill(0.2)), 0);
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
    const hasContent = candidate.some((m) => (m.text || "").trim().length > 0 || !!m.card);

    if (!hasContent) {
      try {
        localStorage.removeItem(threadStorageKey(threadId));
      } catch {
        // ignore
      }
      // Cleanup temporary thread tracking
      removeTemporaryThreadTracking(threadId);
      const next = threads.filter((t) => t.id !== threadId);
      writeChatThreads(next);

      // Falls gerade aktiv, auf einen vorhandenen Thread umschalten
      if (activeThreadIdRef.current === threadId) {
        const fallback = next[0]?.id || null;
        setActiveThreadId(fallback || "thread-default");
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
      const urlThread = threads.find((t) => t.id === urlThreadId);
      const isTemporaryThread = urlThread?.temporary === true;
      setTemporaryChat(isTemporaryThread);
      
      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          setActiveThreadIdLocal(urlThreadId);
          currentThreadRef.current = urlThreadId;
          const loaded = loadMessages(urlThreadId);
          setMessages(loaded);
          messagesRef.current = loaded;
        });
        viewTransitionRef.current.transition = transition;
        transition.finished.finally(() => {
          viewTransitionRef.current.transition = null;
        });
      } else {
        setActiveThreadIdLocal(urlThreadId);
        currentThreadRef.current = urlThreadId;
        const loaded = loadMessages(urlThreadId);
        setMessages(loaded);
        messagesRef.current = loaded;
      }
      setActiveThreadId(urlThreadId);
      return;
    }

    // Determine which thread to use (URL param > store > default)
    const targetThreadId = urlThreadId || storeActiveThreadId || "thread-default";
    
    // Load messages if thread changed or if messages are empty (initial load)
    // Only load if thread actually changed, not on every message.length change
    if (targetThreadId !== activeThreadId || (messages.length === 0 && currentThreadRef.current !== targetThreadId)) {
      const newThread = threads.find((t) => t.id === targetThreadId);
      const isTemporaryThread = newThread?.temporary === true;
      setTemporaryChat(isTemporaryThread);
      
      const loaded = loadMessages(targetThreadId);
      
      // If no messages in localStorage, try to load from backend
      if (loaded.length === 0 && targetThreadId !== "thread-default" && tenantId) {
        gatewayClient.getThreadMessages(targetThreadId, {
          tenantId,
          includeNonCurrent: false,
        }).then((response) => {
          if (response.messages && response.messages.length > 0) {
            const convertedMessages: ChatMessage[] = response.messages
              .filter(msg => msg.isCurrent !== false)
              .map((msg) => ({
                id: msg.id,
                role: msg.role as "user" | "assistant",
                text: msg.content,
                timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : undefined,
                candidateGroupId: msg.candidateGroupId,
                candidateIndex: msg.candidateIndex,
                isCurrent: msg.isCurrent,
              }));
            
            if (document.startViewTransition) {
              const transition = document.startViewTransition(() => {
                setActiveThreadIdLocal(targetThreadId);
                currentThreadRef.current = targetThreadId;
                setMessages(convertedMessages);
                messagesRef.current = convertedMessages;
              });
              viewTransitionRef.current.transition = transition;
              transition.finished.finally(() => {
                viewTransitionRef.current.transition = null;
              });
            } else {
              setActiveThreadIdLocal(targetThreadId);
              currentThreadRef.current = targetThreadId;
              setMessages(convertedMessages);
              messagesRef.current = convertedMessages;
            }
            
            saveMessages(targetThreadId, convertedMessages, false);
          } else {
            // No messages from backend either, use empty array
            if (document.startViewTransition) {
              const transition = document.startViewTransition(() => {
                setActiveThreadIdLocal(targetThreadId);
                currentThreadRef.current = targetThreadId;
                setMessages([]);
                messagesRef.current = [];
              });
              viewTransitionRef.current.transition = transition;
              transition.finished.finally(() => {
                viewTransitionRef.current.transition = null;
              });
            } else {
              setActiveThreadIdLocal(targetThreadId);
              currentThreadRef.current = targetThreadId;
              setMessages([]);
              messagesRef.current = [];
            }
          }
        }).catch((error) => {
          console.warn('[ChatShell] Failed to load messages from backend:', error);
          // Fallback to localStorage (which is empty)
          if (document.startViewTransition) {
            const transition = document.startViewTransition(() => {
              setActiveThreadIdLocal(targetThreadId);
              currentThreadRef.current = targetThreadId;
              setMessages([]);
              messagesRef.current = [];
            });
            viewTransitionRef.current.transition = transition;
            transition.finished.finally(() => {
              viewTransitionRef.current.transition = null;
            });
          } else {
            setActiveThreadIdLocal(targetThreadId);
            currentThreadRef.current = targetThreadId;
            setMessages([]);
            messagesRef.current = [];
          }
        });
      } else {
        // Messages found in localStorage
        if (document.startViewTransition) {
          const transition = document.startViewTransition(() => {
            setActiveThreadIdLocal(targetThreadId);
            currentThreadRef.current = targetThreadId;
            setMessages(loaded);
            messagesRef.current = loaded;
          });
          viewTransitionRef.current.transition = transition;
          transition.finished.finally(() => {
            viewTransitionRef.current.transition = null;
          });
        } else {
          setActiveThreadIdLocal(targetThreadId);
          currentThreadRef.current = targetThreadId;
          setMessages(loaded);
          messagesRef.current = loaded;
        }
      }
      
      // Update URL without full reload - only if URL is different
      const currentUrl = new URL(window.location.href);
      const currentThreadParam = currentUrl.searchParams.get("thread");
      if (currentThreadParam !== targetThreadId && targetThreadId !== "thread-default") {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("thread", targetThreadId);
        window.history.replaceState(null, "", newUrl.toString());
      }
    }
  }, [storeActiveThreadId, activeThreadId, loadMessages, searchParams, threads, setTemporaryChat]);

  // Scroll handling
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollParentRef.current) {
      scrollParentRef.current.scrollTo({
        top: scrollParentRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      isNearBottomRef.current = true;
      setShowJumpToBottom(false);
    }
  }, []);

  // Scroll listener to detect if user is at bottom
  useEffect(() => {
    const scrollParent = scrollParentRef.current;
    if (!scrollParent) return;

    // If the user interacts with the scroll area via wheel/touch,
    // immediately disable auto-follow so they can scroll up freely.
    const handleWheel = () => {
      setShouldFollowOutput(false);
    };
    const handleTouchMove = () => {
      setShouldFollowOutput(false);
    };

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollParent;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      isNearBottomRef.current = isAtBottom;
      setShowJumpToBottom(!isAtBottom && messages.length > 0);
      // If the user scrolls up, stop auto-following streaming output.
      // Re-enable when user scrolls back to bottom.
      setShouldFollowOutput((prev) => (isAtBottom ? true : prev ? false : prev));
    };

    scrollParent.addEventListener('wheel', handleWheel, { passive: true });
    scrollParent.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollParent.addEventListener('scroll', handleScroll);
    return () => {
      scrollParent.removeEventListener('wheel', handleWheel);
      scrollParent.removeEventListener('touchmove', handleTouchMove);
      scrollParent.removeEventListener('scroll', handleScroll);
    };
  }, [messages.length]);

  // Autoscroll on messages change
  useEffect(() => {
    if (pendingCardScrollRef.current) {
      const { id } = pendingCardScrollRef.current;
      console.log('[ChatShell] Targeted scroll to pending card with id:', id);
      // Find element by data-message-id and scroll to it
      const element = document.querySelector(`[data-message-id="${id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      pendingCardScrollRef.current = null;
    } else if (isNearBottomRef.current && shouldFollowOutput) {
      scrollToBottom(messages.length > 0);
    }
  }, [messages, scrollToBottom, shouldFollowOutput]);

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
    
    // Entferne häufige Anfangsfloskeln für bessere Titel
    const prefixesToRemove = [
      /^(hallo|hi|hey|guten tag|guten morgen|guten abend)[,!.]?\s*/i,
      /^(bitte|kannst du|könntest du|würdest du|ich möchte|ich will|ich brauche)\s*/i,
      /^(hilf mir|erkläre mir|zeig mir|sag mir)\s*/i,
    ];
    
    let processed = clean;
    for (const prefix of prefixesToRemove) {
      processed = processed.replace(prefix, '');
    }
    
    // Extrahiere sinnvollen Titel
    const sentences = processed.split(/(?<=[.!?])\s+/).filter(Boolean);
    const firstSentence = sentences[0] || processed;
    
    // Kürze intelligent am Wortende
    let title = firstSentence;
    if (title.length > 50) {
      // Finde den letzten Wortbruch vor 50 Zeichen
      const truncated = title.slice(0, 50);
      const lastSpace = truncated.lastIndexOf(' ');
      title = lastSpace > 20 ? truncated.slice(0, lastSpace) + '…' : truncated + '…';
    }
    
    // Kapitalisiere ersten Buchstaben
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    return title || "Neuer Chat";
  }, []);

  // Memory Integration Hook
  const memoryIntegration = useMemoryIntegration(
    tenantId ?? undefined,
    memoryEnabled,
    temporaryChat,
    messagesRef,
    currentThreadRef,
    loadMessages,
    threads // Für Project-only Memory
  );
  const { searchMemory, saveThreadToMemory, archiveMemory } = memoryIntegration;

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string } | undefined;
      if (!detail?.threadId) return;
      removeThreadIfEmpty(activeThreadIdRef.current);
      setActiveThreadId(detail.threadId);
    };

    const handleNew = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string; temporary?: boolean } | undefined;
      const generateThreadId = () => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
          return `thread-${crypto.randomUUID()}`;
        }
        return `thread-${performance.now()}-${Math.random().toString(36).slice(2)}`;
      };
      const newId = detail?.threadId || generateThreadId();
      removeThreadIfEmpty(activeThreadIdRef.current);
      setActiveThreadId(newId);
      
      // ChatGPT-like UX: Focus input immediately after creating new chat
      // Use setTimeout to ensure the thread switch is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    const handleThinkingSteps = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.open !== undefined) {
        setIsStepsOpen(detail.open);
      } else {
        setIsStepsOpen(prev => !prev);
      }
    };

    const handleCleanupEmptyThreads = () => {
      // ChatGPT-like UX: Clean up empty threads when leaving chat module
      if (activeThreadIdRef.current) {
        removeThreadIfEmpty(activeThreadIdRef.current)
      }
    }

    window.addEventListener("aklow-select-thread", handleSelect as EventListener);
    window.addEventListener("aklow-new-chat", handleNew as EventListener);
    window.addEventListener("aklow-toggle-thinking-steps", handleThinkingSteps as EventListener);
    window.addEventListener("aklow-cleanup-empty-threads", handleCleanupEmptyThreads as EventListener);

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
        navigator.clipboard.writeText(stripInlineMemoryMarkers(lastAssistantMessage.text));
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
          const threadId = currentThreadRef.current || "thread-default";
          const currentThread = threads.find((t) => t.id === threadId);
          // B1: Nutze memoryClient für Auth
          await saveMemory({
            threadId,
            role: "assistant",
            content: lastAssistantMessage.text,
            timestamp: new Date().toISOString(),
            projectId: currentThread?.projectId,
          });
          setSavedMessageId(lastAssistantMessage.id);
          setTimeout(() => setSavedMessageId(null), 2000);
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

    const handleExportChat = () => {
      setIsExportDialogOpen(true);
    };

    // Quick Actions are now handled centrally in ChatWorkspaceShell
    // This handler is kept for backward compatibility but delegates to quickActionsBus
    const handleQuickAction = (e: CustomEvent<{ actionId: string }>) => {
      const quickActionId = e.detail?.actionId;
      if (!quickActionId) return;
      
      // Delegate to quickActionsBus which is handled centrally in ChatWorkspaceShell
      if (typeof window !== 'undefined') {
        const { emitQuickAction } = require('@/lib/quickActionsBus')
        emitQuickAction({ id: quickActionId, source: 'ChatShell' })
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

    // Handle action-start event - start action run
    const handleActionStart = async (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        actionId: string;
        context?: Record<string, unknown>;
        config?: Record<string, unknown>;
        source?: string;
      };
      
      if (!detail?.actionId) return;

      // FAIL-CLOSED: Normalisiere und validiere actionId
      const { normalizeExecutableActionId, getActionDefinition } = await import("../lib/actions/registry");
      const normalized = normalizeExecutableActionId(detail.actionId);
      
      if (!normalized) {
        console.warn(
          `[ChatShell] handleActionStart: ActionId "${detail.actionId}" ist nicht executable. Ignoriere.`,
          { detail }
        );
        return;
      }

      const threadId = activeThreadIdRef.current || "thread-default";
      setActiveThreadId(threadId);

      // Get action label from registry (mit normalisierter ID)
      const actionDef = getActionDefinition(normalized);
      const actionLabel = actionDef?.label || normalized;

      // Add user message (optional - just shows what action was triggered)
      const userMessage: ChatMessage = {
        id: `action-user-${Date.now()}`,
        role: "user",
        text: actionLabel,
      };

      setMessages(prev => {
        const next = [...prev, userMessage];
        saveMessages(threadId, next, false);
        return next;
      });

      // Start action run
      try {
        const assistantMessageId = `action-assistant-${Date.now()}`;
        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: "assistant",
          text: "",
          runState: "RUNNING",
        };

        setMessages(prev => {
          const next = [...prev, assistantMessage];
          saveMessages(threadId, next, false);
          return next;
        });

        await startRun(
          {
            actionId: detail.actionId,
            context: detail.context || {},
            config: detail.config,
            stream: true,
          },
          (event: ActionRunEvent) => {
            setMessages(prev => {
              const msgIndex = prev.findIndex(m => m.id === assistantMessageId);
              if (msgIndex === -1) return prev;

              const currentMsg = prev[msgIndex];
              const updatedMsg = { ...currentMsg };

              switch (event.type) {
                case "run.started":
                  updatedMsg.runId = event.data.run_id as string;
                  updatedMsg.runState = "RUNNING";
                  updatedMsg.text = "Aktion wird gestartet...";
                  break;

                case "assistant.message":
                  // Erweitere Text mit Erklärungen wenn vorhanden
                  const explanation = event.data.explanation as string;
                  const baseText = (event.data.text as string) || updatedMsg.text;
                  updatedMsg.text = explanation 
                    ? `${baseText}\n\n${explanation}` 
                    : baseText;
                  if (Array.isArray(event.data.pills)) {
                    const eventStep = (event.data.step_key as string) || (event.data.step as string);
                    const eventInputKey = event.data.input_key as string | undefined;
                    updatedMsg.pills = (event.data.pills as Pill[]).map((pill) => ({
                      ...pill,
                      step_key: pill.step_key || eventStep,
                      input_key: pill.input_key || eventInputKey,
                    }));
                    updatedMsg.pendingStepKey = eventStep || updatedMsg.pendingStepKey;
                    updatedMsg.pendingInputKey = eventInputKey || updatedMsg.pendingInputKey;
                  }
                  updatedMsg.step = (event.data.step_key as string) || (event.data.step as string) || updatedMsg.step;
                  updatedMsg.runState = (event.data.state as "WAITING_INPUT" | "RUNNING" | "DONE") || updatedMsg.runState;
                  // Check for structured output (draft reply card)
                  if (event.data.structured_output && typeof event.data.structured_output === "object") {
                    const structured = event.data.structured_output as Record<string, unknown>;
                    // Unterstütze sowohl draft_text (alt) als auch draft (neu, ActionOutputV1)
                    const draftContent = structured.draft || structured.draft_text;
                    if (draftContent && (detail.actionId === "inbox.draftReply" || detail.actionId === "inbox.draft_reply")) {
                      // Set card metadata for draft reply
                      updatedMsg.card = {
                        type: "draft_reply",
                        id: `draft-${Date.now()}`,
                        payload: {
                          draftText: draftContent as string,
                          tone: structured.tone as 'formal' | 'friendly' | 'casual' | 'professional' | undefined,
                          keyPointsAddressed: structured.key_points_addressed as string[],
                          suggestedSubject: structured.suggested_subject as string,
                        },
                      } as ChatCard;
                    }
                  }
                  break;

                case "assistant.delta":
                  updatedMsg.text = (updatedMsg.text || "") + (event.data.text_delta as string);
                  break;

                case "approval.requested":
                  updatedMsg.runState = "WAITING_INPUT";
                  {
                    const eventStep = (event.data.step_key as string) || (event.data.step as string);
                    const reason = (event.data.reason as string) || (event.data.message as string);
                    const scopes = (event.data.scopes as string[]) || [];
                    const toolName = (event.data.tool_name as string) || (event.data.actor as string);
                    
                    // Set card for approval UI
                    updatedMsg.card = {
                      type: "approval",
                      id: `approval-${eventStep}-${Date.now()}`,
                      payload: {
                        stepKey: eventStep,
                        reason: reason || "Freigabe erforderlich",
                        scopes: scopes,
                        toolName: toolName,
                        runId: updatedMsg.runId,
                      },
                    };
                    
                    updatedMsg.pendingStepKey = eventStep || updatedMsg.pendingStepKey;
                    updatedMsg.step = eventStep || updatedMsg.step;
                    updatedMsg.text = reason || updatedMsg.text || "Freigabe erforderlich";
                  }
                  break;

                case "user_input.requested":
                  updatedMsg.runState = "WAITING_INPUT";
                  {
                    const eventStep = (event.data.step_key as string) || (event.data.step as string);
                    const eventInputKey = event.data.input_key as string | undefined;
                    const prompt = (event.data.prompt as string) || "";
                    const rawPills = (event.data.pills as Pill[]) || [];
                    updatedMsg.pills = rawPills.map((pill) => ({
                      ...pill,
                      step_key: pill.step_key || eventStep,
                      input_key: pill.input_key || eventInputKey,
                    }));
                    updatedMsg.pendingStepKey = eventStep || updatedMsg.pendingStepKey;
                    updatedMsg.pendingInputKey = eventInputKey || updatedMsg.pendingInputKey;
                    updatedMsg.step = eventStep || updatedMsg.step;
                    
                    // Set card for input UI
                    updatedMsg.card = {
                      type: "user_input",
                      id: `input-${eventStep}-${Date.now()}`,
                      payload: {
                        stepKey: eventStep,
                        inputKey: eventInputKey,
                        prompt: prompt,
                        suggestions: rawPills,
                        runId: updatedMsg.runId,
                      },
                    };
                  }
                  updatedMsg.text = (event.data.prompt as string) || updatedMsg.text;
                  break;

                case "run.progress":
                  updatedMsg.text = (event.data.message as string) || updatedMsg.text;
                  break;

                case "run.completed":
                  updatedMsg.runState = "DONE";
                  if (event.data.result) {
                    const result = event.data.result as Record<string, unknown>;
                    
                    // Prüfe, ob result ein ActionOutputV1 ist (hat "type" field)
                    const actionOutputCard = convertActionOutputV1ToCard(result, detail.actionId);
                    
                    if (actionOutputCard) {
                      // ActionOutputV1 -> setze Card, Text minimal/leer
                      updatedMsg.card = actionOutputCard;
                      // Text nur als Fallback falls Card-Rendering fehlschlägt
                      updatedMsg.text = "";
                      
                      // Für draft: Text auch setzen für Fallback
                      if (result.type === "draft" && result.draft) {
                        updatedMsg.text = result.draft as string;
                      } else if (result.type === "summary" && result.summary) {
                        updatedMsg.text = result.summary as string;
                      }
                    } else {
                      // Legacy-Format: Extract output text from various possible locations
                      const outputText = extractOutputTextFromResult(result);
                      if (outputText) {
                        updatedMsg.text = outputText;
                      } else if (result.summary_text) {
                        updatedMsg.text = result.summary_text as string;
                      }
                    }
                    
                    // Fehlerbehandlung: Wenn result.error existiert, zeige Fehler-Card
                    if (result.error) {
                      // Check if it's a Launch Gate error
                      const errorStr = result.error as string
                      let errorCard: ChatCard
                      
                      try {
                        const errorJson = JSON.parse(errorStr)
                        if (errorJson.error && ['integration_not_connected', 'quota_exceeded', 'plan_not_allowed', 'tenant_not_found'].includes(errorJson.error)) {
                          // Launch Gate error - use special card type
                          errorCard = {
                            id: `launch-gate-error-${Date.now()}`,
                            type: "launch_gate_error",
                            title: "Aktion blockiert",
                            content: errorJson.message || "Die Aktion konnte nicht ausgeführt werden.",
                            createdAt: Date.now(),
                            metadata: {
                              errorCode: errorJson.error,
                              details: errorJson.details,
                            },
                          };
                        } else {
                          // Regular error
                          errorCard = {
                            id: `error-${Date.now()}`,
                            type: "insight",
                            title: "Fehler",
                            content: errorJson.message || errorStr || "Die Aktion konnte nicht ausgeführt werden.",
                            createdAt: Date.now(),
                          };
                        }
                      } catch {
                        // Not JSON, regular error
                        errorCard = {
                          id: `error-${Date.now()}`,
                          type: "insight",
                          title: "Fehler",
                          content: errorStr || "Die Aktion konnte nicht ausgeführt werden.",
                          createdAt: Date.now(),
                        };
                      }
                      
                      updatedMsg.card = errorCard;
                      updatedMsg.text = errorStr;
                    }
                  }
                  break;

                case "run.failed":
                  updatedMsg.runState = "DONE";
                  updatedMsg.text = (event.data.safe_message as string) || "Die Aktion konnte nicht ausgeführt werden.";
                  break;
              }

              const next = [...prev];
              next[msgIndex] = updatedMsg;
              saveMessages(threadId, next, false);
              return next;
            });
          }
        );
      } catch (error) {
        console.error("Action run failed:", error);
        const errorMessage: ChatMessage = {
          id: `action-error-${Date.now()}`,
          role: "assistant",
          text: `Fehler beim Ausführen der Aktion: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
          runState: "DONE",
        };
        setMessages(prev => {
          const next = [...prev, errorMessage];
          saveMessages(threadId, next, false);
          return next;
        });
      }
    };
    
    // Chat First: Dispatch Card Event
    const handleDispatchCard = (e: CustomEvent<{ card: ChatCard }>) => {
        const { card } = e.detail;
        console.log('[ChatShell] Received card dispatch event:', card.id, card.type)
        const threadId = activeThreadIdRef.current || "thread-default";

        // Avoid adding duplicate cards if they were just added
        const lastMsg = messagesRef.current[messagesRef.current.length - 1];
        if (lastMsg && lastMsg.card && lastMsg.card.id === card.id) {
          console.log('[ChatShell] Duplicate card, skipping')
          return
        }

        const newMessage: ChatMessage = {
            id: `card-${card.id}-${Date.now()}`,
            role: 'assistant',
            text: '', // Empty text for card-only messages
            card: card
        };
        
        setMessages(prev => {
            const next = [...prev, newMessage];
            // Set pending scroll to the last index and disable followOutput
            pendingCardScrollRef.current = { index: next.length - 1, id: newMessage.id };
            setShouldFollowOutput(false);
            
            saveMessages(threadId, next, false);
            return next;
        });
        
        // Re-enable follow output after a delay
        setTimeout(() => {
            setShouldFollowOutput(true);
        }, 1000);
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
    window.addEventListener("aklow-action-start", handleActionStart as EventListener);
    window.addEventListener("aklow-dispatch-chat-card", handleDispatchCard as EventListener);
    window.addEventListener("aklow-export-chat", handleExportChat as EventListener);
    
    // Quick Actions Bus
    const unsubscribeQuickAction = subscribeQuickAction((evt) => {
      const prompt = buildQuickActionPrompt(evt);
      if (prompt) {
        dispatchPrefillChat(prompt);
        dispatchFocusChat();
      }
    });
    
    const handleFocusChat = () => {
        inputRef.current?.focus();
    };
    window.addEventListener("aklow-focus-chat", handleFocusChat);

    return () => {
      unsubscribeQuickAction();
      window.removeEventListener("aklow-select-thread", handleSelect as EventListener);
      window.removeEventListener("aklow-new-chat", handleNew as EventListener);
      window.removeEventListener("aklow-toggle-thinking-steps", handleThinkingSteps as EventListener);
      window.removeEventListener("aklow-cleanup-empty-threads", handleCleanupEmptyThreads as EventListener);
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
      window.removeEventListener("aklow-action-start", handleActionStart as EventListener);
      window.removeEventListener("aklow-dispatch-chat-card", handleDispatchCard as EventListener);
      window.removeEventListener("aklow-export-chat", handleExportChat as EventListener);
      window.removeEventListener("aklow-focus-chat", handleFocusChat);
    };
  }, [stopTts, dictationStatus, startRecording, stopRecording, toggleTts, tenantId, pressRealtime, stopRealtimeAll, realtimeStatus, t, removeThreadIfEmpty, saveThreadToMemory, saveMessages, temporaryChat]);

  // Initial load messages on mount if thread is already selected
  useEffect(() => {
    if (currentThreadRef.current) return;
    const defaultThreadId = storeActiveThreadId || "thread-default";
    currentThreadRef.current = defaultThreadId;
    const loaded = loadMessages(defaultThreadId);
    
    // Remove duplicates based on message id and role
    const uniqueMessages = loaded.filter((msg, index, self) => {
      const firstIndex = self.findIndex((m) => m.id === msg.id);
      // Also check for duplicate assistant messages with same text
      if (msg.role === "assistant" && index !== firstIndex) {
        const sameText = self[firstIndex]?.text === msg.text && !msg.card; // Cards are unique enough
        return !sameText;
      }
      return index === firstIndex;
    });
    
    // If no messages in localStorage, try to load from backend
    if (uniqueMessages.length === 0 && defaultThreadId !== "thread-default" && tenantId) {
      gatewayClient.getThreadMessages(defaultThreadId, {
        tenantId,
        includeNonCurrent: false,
      }).then((response) => {
        if (response.messages && response.messages.length > 0) {
          const convertedMessages: ChatMessage[] = response.messages
            .filter(msg => msg.isCurrent !== false)
            .map((msg) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              text: msg.content,
              timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : undefined,
              candidateGroupId: msg.candidateGroupId,
              candidateIndex: msg.candidateIndex,
              isCurrent: msg.isCurrent,
            }));
          setMessages(convertedMessages);
          messagesRef.current = convertedMessages;
          saveMessages(defaultThreadId, convertedMessages, false);
        } else {
          setMessages([]);
          messagesRef.current = [];
        }
      }).catch((error) => {
        console.warn('[ChatShell] Failed to load messages from backend:', error);
        setMessages([]);
        messagesRef.current = [];
      });
    } else {
      setMessages(uniqueMessages);
      messagesRef.current = uniqueMessages;
    }
  }, [loadMessages, storeActiveThreadId, gatewayClient, tenantId, saveMessages]);

  useEffect(() => {
    return () => {
      stopTts();
    };
  }, [stopTts]);

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0];
  const isLastAssistantMessage = (msg: ChatMessage) => msg.id === lastAssistantMessage?.id;

  const pinnedToBottom = isNearBottomRef.current;
  // Hide thinking indicator as soon as we have any response text
  const showThinking = isSending && (thinkingSteps.length > 0 || !!thinkingNote) && (!lastAssistantMessage || !lastAssistantMessage.text);

  const sendMessage = useCallback(async (trimmed: string, hideUserMessage: boolean = false) => {
    if (!trimmed || isSending) return;
    if (!tenantId) {
      const errorMsg = 'Bitte melde dich an, um Nachrichten zu senden.';
      console.error('[ChatShell] Cannot send message: tenantId is required. User must be authenticated.');
      toast.error(errorMsg, {
        description: 'Die Chat-Funktion erfordert eine Anmeldung.',
        action: {
          label: 'Seite neu laden',
          onClick: () => window.location.reload(),
        },
      });
      return;
    }
    
    // Debug logging (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ChatShell] Sending message:', {
        tenantId,
        threadId: currentThreadRef.current || "thread-default",
        endpoint: '/api/chat/stream',
      });
    }
    
    abortControllerRef.current = new AbortController();

    const threadId = currentThreadRef.current || "thread-default";
    const currentThread = threads.find((t) => t.id === threadId);
    const isTemporaryThread = currentThread?.temporary === true;
    setTemporaryChat(isTemporaryThread);
    const projectId = currentThread?.projectId;
    const activeProject = projectId ? projects.find((p) => p.id === projectId) : undefined;
    const memoryPrefEnabled = readMemoryEnabled();
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
      timestamp: Date.now(),
    };

    // Optimistic UI Update (skip if hideUserMessage is true)
    if (!hideUserMessage) {
      setMessages((prev) => {
        const next = [...prev, userMessage];
        saveMessages(threadId, next, false);
        return next;
      });
    }

    // Automatische Titel-/Preview-Generierung beim ersten Inhalt
    const needsAutoNaming = currentThread && (
      currentThread.title === "Neuer Chat" || 
      currentThread.title === "Willkommen!" || 
      currentThread.title === "Chat ohne Memory"
    );
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

    // If we're inside a project, upload attachments and register them as project files (ChatGPT-like)
    const uploadedProjectFiles: ProjectFileRef[] = [];
    if (activeProject && !isTemporaryThread && attachments.length > 0 && tenantId) {
      try {
        for (const a of attachments) {
          const formData = new FormData();
          formData.append("file", a.file);
          formData.append("tenant_id", tenantId);
          formData.append("metadata", JSON.stringify({ projectId: activeProject.id, source: "chat_attachment", threadId }));
          const { authedFetch } = await import('@/lib/api/authedFetch')
          const res = await authedFetch("/api/documents", { method: "POST", body: formData });
          if (!res.ok) continue;
          const json = await res.json();
          if (json?.document_id) {
            uploadedProjectFiles.push({
              documentId: String(json.document_id),
              filename: String(json.filename || a.name),
              mimeType: typeof json.mime_type === "string" ? json.mime_type : a.type,
              size: typeof json.size === "number" ? json.size : a.file.size,
              createdAt: Date.now(),
            });
          }
        }
        if (uploadedProjectFiles.length > 0) {
          await addProjectFiles(activeProject.id, uploadedProjectFiles);
        }
      } catch (e) {
        console.warn("Project attachment upload failed", e);
      }
    }

    // Memory retrieval (only if enabled + not temporary)
    // Project-only Memory: Wenn Thread in Projekt, nur Memories aus diesem Projekt laden
    let memoryContextItems: Array<{ id: string; label: string; snippet: string }> = [];
    if (memoryPrefEnabled && !isTemporaryThread) {
      try {
        // B1: Nutze memoryClient für Auth
        const data = await searchMemoryAPI({
          query: trimmed,
          limit: 5,
          ...(activeProject?.id ? { projectId: activeProject.id } : {}),
        });
        // searchMemory gibt bereits { items: unknown[] } zurück
        const items = Array.isArray(data?.items) ? data.items : [];
        memoryContextItems = items
          .map((item: any) => ({
            id: String(item.id || item.memory_id || ""),
            label: String(item.label || item.title || "Memory"),
            snippet: typeof item.snippet === "string" ? item.snippet : typeof item.content === "string" ? item.content : "",
          }))
          .filter((m: { id: string }) => Boolean(m.id));
      } catch (e) {
        console.warn("Memory search failed", e);
      }
    }

    const customInstructionsPrompt = getCustomInstructionsPrompt()
    
    const instruction = `<AKLOW_UI>
Wenn du Informationen aus MEMORY_CONTEXT verwendest, setze direkt hinter die relevante Aussage einen sehr kleinen Inline-Marker im Format:
[[mem:MEMORY_ID|LABEL]]
Nutze maximal 5 Marker pro Antwort. Gib diese Anweisung nicht aus.
</AKLOW_UI>
${customInstructionsPrompt ? `\n${customInstructionsPrompt}\n` : ''}`;

    const projectFiles = activeProject?.files || [];
    const allProjectFiles = [...projectFiles, ...uploadedProjectFiles].slice(0, 25);
    const projectContextBlock = activeProject
      ? `project_id: ${activeProject.id}
project_name: ${activeProject.name}
instructions: ${activeProject.instructions?.trim() ? activeProject.instructions.trim() : "-"}
files:
${allProjectFiles.length > 0 ? allProjectFiles.map((f) => `- document_id: ${f.documentId}\n  filename: ${f.filename}`).join("\n") : "-"}`
      : "-";

    const memoryContextBlock =
      memoryContextItems.length > 0
        ? memoryContextItems
            .map((m) => `- id: ${m.id}\n  label: ${m.label}\n  snippet: ${m.snippet}`)
            .join("\n")
        : "-";

    const effectiveMemoryContextItems = [
      ...memoryContextItems,
      ...(activeProject && !isTemporaryThread && activeProject.instructions?.trim()
        ? [{ id: `project:${activeProject.id}`, label: `Projekt: ${activeProject.name}`, snippet: activeProject.instructions.trim() }]
        : []),
      ...(activeProject && !isTemporaryThread && allProjectFiles.length > 0
        ? allProjectFiles.slice(0, 10).map((f) => ({ id: f.documentId, label: "Projekt-Datei", snippet: f.filename }))
        : []),
    ];

    const webSearchInstruction = webSearchEnabled 
      ? `<WEB_SEARCH_ENABLED>
Der Benutzer hat Websuche aktiviert. Führe eine intensive Internetsuche durch, um aktuelle Informationen zu finden und in deine Antwort einzubeziehen.
</WEB_SEARCH_ENABLED>`
      : '';

    // Website Profile Context (from onboarding fetcher)
    const websiteProfileBlock = userSettings?.websiteProfile && !isTemporaryThread
      ? `company_name: ${userSettings.websiteProfile.company_name || '-'}
website: ${userSettings.websiteProfile.website || '-'}
industry: ${userSettings.websiteProfile.industry || '-'}
value_proposition: ${userSettings.websiteProfile.value_proposition || '-'}
target_audience: ${userSettings.websiteProfile.target_audience || '-'}
products_services: ${userSettings.websiteProfile.products_services || '-'}
keywords: ${userSettings.websiteProfile.keywords || '-'}`
      : '-';

    const messageForModel = `${instruction}
${webSearchInstruction}
<PROJECT_CONTEXT>
${projectContextBlock}
</PROJECT_CONTEXT>
<MEMORY_CONTEXT>
${memoryContextBlock}
</MEMORY_CONTEXT>
<WEBSITE_PROFILE>
${websiteProfileBlock}
</WEBSITE_PROFILE>
<USER_MESSAGE>
${fullText}
</USER_MESSAGE>`;

    const assistantMessageId = `assistant-${generateId()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      text: "",
      timestamp: Date.now(),
      uiMessages: [],
      usedMemories:
        memoryContextItems.length > 0
          ? memoryContextItems.map((m) => ({ id: m.id, content: m.snippet, type: m.label }))
          : undefined,
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
        messageForModel,
        {
          onStart: (data) => {
            const steps = (data.steps ?? []) as ThinkingStep[];
            setThinkingSteps(steps);
            setThinkingNote("Antwort wird erstellt …");
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
            // Don't update thinkingNote on every chunk to prevent flickering
            // It's already set to "Antwort wird erstellt …" from onStart or will be set on first chunk

            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, text: fullContent } : msg
              );
              saveMessages(threadId, updated, true); // Use debounce for chunks
              return updated;
            });
          },
          onDelta: (data) => {
            // Delta event: append new characters
            const delta = data.delta || "";
            if (delta) {
              fullContent += delta;
            }
            // Don't update thinkingNote on every delta to prevent flickering
            // It's already set to "Antwort wird erstellt …" from onStart or will be set on first delta

            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, text: fullContent } : msg
              );
              saveMessages(threadId, updated, true); // Use debounce for deltas
              return updated;
            });
          },
          onStatus: (data) => {
            // Status event: update status info chip
            const stage = data.stage || "";
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      statusInfo: {
                        stage,
                        toolName: msg.statusInfo?.toolName,
                        details: msg.statusInfo?.details,
                      },
                    }
                  : msg
              );
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
                  ? { ...msg, text: finalContent, uiMessages: cleanedUiMessages, timestamp: msg.timestamp || Date.now() }
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
            const needsAutoNaming = currentThread && (
              currentThread.title === "Neuer Chat" || 
              currentThread.title === "Willkommen!" || 
              currentThread.title === "Chat ohne Memory"
            );
            
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
          mode: composerMode,
          signal: abortControllerRef.current.signal,
          memoryContext: effectiveMemoryContextItems,
          metadata: {
            ui: { memoryMarkers: true, markerSyntax: "[[mem:id|label]]" },
            temporary: isTemporaryThread,
            memoryEnabled: memoryPrefEnabled,
            project: activeProject
              ? {
                  id: activeProject.id,
                  name: activeProject.name,
                  documentIds: allProjectFiles.map((f) => f.documentId),
                }
              : undefined,
          },
        }
      );
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Unbekannter Fehler im Chat";
      const isNetworkError = err instanceof Error && (
        err.message.includes('fetch') || 
        err.message.includes('network') || 
        err.message.includes('Failed to fetch')
      );
      const isAuthError = err instanceof Error && (
        err.message.includes('401') || 
        err.message.includes('authentication') ||
        err.message.includes('Unauthorized')
      );
      const isBackendError = err instanceof Error && (
        err.message.includes('503') || 
        err.message.includes('502') ||
        err.message.includes('connection_error')
      );
      
      // Update UI with error message
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, text: "Fehler beim Senden: " + errorText } : msg
        );
        saveMessages(threadId, updated);
        return updated;
      });
      setThinkingNote("Fehler beim Streamen");
      setIsSending(false);
      
      // Show user-friendly error toast
      let toastMessage = "Nachricht konnte nicht gesendet werden.";
      let toastDescription = errorText;
      
      if (isNetworkError) {
        toastMessage = "Verbindungsfehler";
        toastDescription = "Bitte überprüfe deine Internetverbindung und versuche es erneut.";
      } else if (isAuthError) {
        toastMessage = "Anmeldung erforderlich";
        toastDescription = "Bitte melde dich erneut an.";
      } else if (isBackendError) {
        toastMessage = "Backend nicht erreichbar";
        toastDescription = "Der Server ist möglicherweise nicht erreichbar. Bitte versuche es später erneut.";
      }
      
      toast.error(toastMessage, {
        description: toastDescription,
      });
      
      // Debug logging (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.error('[ChatShell] sendMessage error:', {
          error: err,
          tenantId,
          threadId: currentThreadRef.current || "thread-default",
          errorType: isNetworkError ? 'network' : isAuthError ? 'auth' : isBackendError ? 'backend' : 'unknown',
        });
      }
    }
  }, [isSending, tenantId, stopTts, saveMessages, attachments, threads, makeTitle, t]);

  const handleQuickCardClick = useCallback(async (text: string) => {
    setFollowUpSuggestions([]);
    await sendMessage(text);
  }, [sendMessage, setFollowUpSuggestions]);

  const handleCardAction = useCallback(async (actionId: string, params?: any) => {
      // For now, most actions will just prefill the chat or trigger standard events
      if (actionId === 'open_inspector') {
          // Open inspector logic is handled via events usually, but we can trigger it
          // Or just let the CardRenderer handle simple clicks
      }
      
      // AI Suggestion Grid Actions / Workflow Actions
      if (actionId.includes('.') || (params && params.actionId)) {
          const { dispatchActionStart } = await import("../lib/actions/dispatch");
          
          let actionToRun = actionId;
          const actionContext = params?.context || {
              module: actionId.split('.')[0],
              target: { type: actionId.split('.')[0] }
          };

          if (params && params.actionId) {
              actionToRun = params.actionId;
          }

          // FAIL-CLOSED: dispatchActionStart normalisiert und validiert automatisch
          dispatchActionStart(
              actionToRun,
              actionContext,
              {},
              'ChatShell-handleCardAction'
          );
          return;
      }

      // Example: Dispatch event for others to pick up
      window.dispatchEvent(new CustomEvent('aklow-card-action', { detail: { actionId, params } }));
      
      // Also prefill chat if action looks like a prompt
      if (actionId.startsWith('prompt:')) {
          const prompt = actionId.replace('prompt:', '');
          setInput(prompt);
          inputRef.current?.focus();
      }
  }, []);

  const handleCardRowClick = useCallback((messageId: string, rowId: string, rowData: any) => {
    setMessages(prev => {
        const updated = prev.map(msg => {
            if (msg.id !== messageId || !msg.card || msg.card.type !== 'list') return msg;
            
            const listCard = msg.card as ListCardPayload;
            const isAlreadySelected = listCard.selectedItemId === rowId;
            
            // Generate expanded item data if expanding
            // This is a generic mapper. In a real app, you might fetch details.
            // For now, we map the row data to an Entity Card.
            const entityData: EntityCardPayload | undefined = isAlreadySelected ? undefined : {
                id: `entity-${rowId}`,
                type: 'entity',
                title: rowData.name || rowData.title || 'Details',
                subtitle: rowData.subtitle || rowData.description || undefined,
                status: rowData.status,
                data: Object.entries(rowData).reduce((acc, [k, v]) => {
                    if (k !== 'id' && k !== 'name' && k !== 'title' && typeof v !== 'object') {
                        acc[k] = String(v);
                    }
                    return acc;
                }, {} as Record<string, string>),
                // Add actions for the inline entity
                actions: [
                    { id: 'view_details', label: 'Details öffnen', variant: 'secondary' },
                    { id: 'edit', label: 'Bearbeiten', variant: 'secondary' }
                ]
            };

            return {
                ...msg,
                card: {
                    ...listCard,
                    selectedItemId: isAlreadySelected ? undefined : rowId,
                    expandedItemData: entityData
                }
            };
        });
        saveMessages(activeThreadIdRef.current || 'thread-default', updated, true);
        return updated;
    });
  }, [saveMessages]);

  const handlePostEntity = useCallback((entity: EntityCardPayload) => {
    const threadId = activeThreadIdRef.current || "thread-default";
    const newMessage: ChatMessage = {
       id: `card-${entity.id}-${Date.now()}`,
       role: 'assistant',
       text: '',
       card: entity
    };
    
    setMessages(prev => {
        const next = [...prev, newMessage];
        // Set pending scroll to top of the card and disable followOutput
        pendingCardScrollRef.current = { index: next.length - 1, id: newMessage.id };
        setShouldFollowOutput(false);
        
        saveMessages(threadId, next, false);
        return next;
    });
    
    // Re-enable follow output after a delay
    setTimeout(() => {
        setShouldFollowOutput(true);
    }, 1000);
  }, [saveMessages]);

  const handlePinCard = useCallback((card: ChatCard) => {
      // Dispatch event to DashboardOverlay
      window.dispatchEvent(new CustomEvent('aklow-pin-card', { detail: { card } }));
      
      // Optional: Show toast
      // toast.success('An Inspector angepinnt'); 
  }, []);

  const handleCardInfo = useCallback((card: ChatCard) => {
    // Dispatch event to show explanation in DashboardOverlay
    const explanation = (card as any).explanation;
    if (explanation) {
       window.dispatchEvent(new CustomEvent('aklow-show-explanation', {
         detail: {
           title: (card as any).title || 'Information',
           explanation: explanation,
           references: (card as any).references || [] // Assume references might exist
         }
       }));
    }
  }, []);

  const handleEditMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
        setEditingMessageId(lastUserMessage.id);
        setEditingText(lastUserMessage.text);
    }
  }, [messages]);

  // Helper: Check if message/run is waiting for input
  const isWaitingInput = useCallback((msg: ChatMessage): boolean => {
    return msg.runState === "WAITING_INPUT" && 
           (msg.pills && msg.pills.length > 0 || msg.card?.type === "user_input");
  }, []);

  function renderMessage(message: ChatMessage) {
    const isUser = message.role === "user";
    const waitingForInput = isWaitingInput(message);

    // Special handling for Card-only messages
    if (message.card && !message.text) {
        return (
            <div className="flex justify-start animate-[fadeInUp_0.4s_ease-out] mb-4 w-full">
                <OutputCardFrame>
                     <CardRenderer 
                        card={message.card} 
                        onAction={(id, params) => handleCardAction(id, params)}
                        onRowClick={(rowId, rowData) => handleCardRowClick(message.id, rowId, rowData)}
                        onPostEntity={handlePostEntity}
                        onPin={() => handlePinCard(message.card!)}
                        onInfo={() => handleCardInfo(message.card!)}
                     />
                </OutputCardFrame>
            </div>
        );
    }

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

      const handleEditSave = async () => {
        if (!editingText.trim()) return;
        
        try {
          // Use v2 API: Edit message creates a new branch
          // Backend returns { messageId, branchId } - we use the current thread
          const currentThreadId = activeThreadId || "thread-default";
          
          if (!tenantId) {
            console.error('[handleEditSave] tenantId required');
            return;
          }
          const response = await gatewayClient.editMessage(message.id, {
            tenantId,
            newContent: editingText.trim(),
          }).catch((error) => {
            console.error('[handleEditSave] editMessage failed:', error);
            throw error;
          })
          
          // Load messages from the new branch using current thread
          if (!tenantId) {
            console.error('[handleEditSave] tenantId required');
            return;
          }
          const branchMessages = await gatewayClient.getThreadMessages(currentThreadId, {
            tenantId,
            branchId: response.branchId,
          }).catch((error) => {
            console.error('[handleEditSave] getThreadMessages failed:', error);
            throw error;
          })
          
          // Convert to ChatMessage format and set
          const convertedMessages: ChatMessage[] = branchMessages.messages.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            text: msg.content,
          }))
          setMessages(convertedMessages)
          
          setEditingMessageId(null)
          setEditingText("")
          
          // Send edited message to bot in new thread
          await sendMessage(editingText.trim())
        } catch (error) {
          console.error('Failed to edit message:', error)
          // Fallback to old behavior
          const threadId = activeThreadId || "thread-default"
          setMessages((prev) => {
            const updated = prev.map((msg) =>
              msg.id === message.id ? { ...msg, text: editingText.trim() } : msg
            )
            saveMessages(threadId, updated)
            return updated
          })
          setEditingMessageId(null)
          setEditingText("")
          sendMessage(editingText.trim())
        }
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
                    className="px-3 py-1 text-sm ak-text-secondary hover:ak-text-primary active:scale-95 transition-transform"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleEditSave}
                    className="px-3 py-1 text-sm bg-[var(--ak-accent-inbox)] text-[var(--ak-color-text-inverted)] rounded hover:brightness-110 active:scale-95 transition-transform"
                  >
                    Senden
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="ak-body whitespace-pre-wrap leading-[1.7] rounded-2xl px-4 py-3 ak-shadow-card text-right bg-gradient-to-br from-[var(--ak-color-bg-surface-muted)] to-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]"
                  style={{ color: "var(--ak-color-text-primary)", fontSize: "15px" }}
                >
                  {message.text}
                </div>
                {/* User message actions - only on hover */}
                {hoveredUserMessageId === message.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleUserCopy}
                      className="p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95 ak-text-muted hover:ak-text-primary hover:ak-surface-2"
                      aria-label="Kopieren"
                      title="Kopieren"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleUserEdit}
                      className="p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95 ak-text-muted hover:ak-text-primary hover:ak-surface-2"
                      aria-label="Bearbeiten"
                      title="Bearbeiten"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
            
          </div>
        </div>
      );
    }

    const ttsActive = speakingId === message.id;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(stripInlineMemoryMarkers(message.text));
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    };

    const handleSave = async () => {
      if (temporaryChat) return; // Skip memory save in temporary chat mode
      try {
        const threadId = activeThreadId || "thread-default";
        const timestamp = new Date().toISOString();
        const currentThread = threads.find((t) => t.id === threadId);
        // B1: Nutze memoryClient für Auth
        await saveMemory({
          threadId,
          role: "assistant",
          content: message.text,
          timestamp,
          projectId: currentThread?.projectId,
        });
        setSavedMessageId(message.id);
        setTimeout(() => {
          setSavedMessageId(null);
        }, 2000);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    };

    const handleUpdate = async () => {
      if (!tenantId) {
        console.error('[handleRegenerate] tenantId required');
        return;
      }
      try {
        // Use v2 API: Regenerate message
        const response = await gatewayClient.regenerateMessage(message.id, {
          tenantId,
        })
        
        // The regenerate API creates a new candidate, we need to load it
        // For now, we'll trigger a new stream by finding the parent user message
        const messageIndex = messages.findIndex((m) => m.id === message.id)
        if (messageIndex === -1) return
        
        let lastUserMessage: ChatMessage | null = null
        for (let i = messageIndex - 1; i >= 0; i--) {
          if (messages[i].role === "user") {
            lastUserMessage = messages[i]
            break
          }
        }
        
        if (!lastUserMessage) return
        
        // Reload messages to get the new candidate
        const threadMessages = await gatewayClient.getThreadMessages(activeThreadId || "thread-default", {
          tenantId,
          branchId: response.branchId,
          includeNonCurrent: true, // Include all candidates
        })
        
        // Find all candidates for this message
        const assistantCandidates = threadMessages.messages
          .filter(msg => msg.role === 'assistant' && msg.candidateGroupId === response.candidateGroupId)
          .sort((a, b) => (a.candidateIndex || 0) - (b.candidateIndex || 0))
        
        if (assistantCandidates.length > 0) {
          // Convert candidates
          const candidates: ChatMessage[] = assistantCandidates.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            text: msg.content,
            candidateGroupId: msg.candidateGroupId,
            candidateIndex: msg.candidateIndex,
            isCurrent: msg.isCurrent,
          }))
          
          // Find current candidate index
          const currentCandidate = candidates.find(c => c.isCurrent !== false) || candidates[candidates.length - 1]
          const currentIndex = currentCandidate ? candidates.findIndex(c => c.id === currentCandidate.id) : candidates.length - 1
          
          // Store candidates for this message
          setMessageCandidates(prev => ({
            ...prev,
            [message.id]: {
              candidates,
              currentIndex,
              candidateGroupId: response.candidateGroupId,
            }
          }))
          
          // Update messages to show current candidate
          const convertedMessages: ChatMessage[] = threadMessages.messages
            .filter(msg => {
              if (msg.role === 'assistant' && msg.candidateGroupId === response.candidateGroupId) {
                return msg.id === currentCandidate.id
              }
              return true
            })
            .map((msg) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              text: msg.content,
              candidateGroupId: msg.candidateGroupId,
              candidateIndex: msg.candidateIndex,
              isCurrent: msg.isCurrent,
            }))
          setMessages(convertedMessages)
        } else {
          // Fallback: no candidates found
          const convertedMessages: ChatMessage[] = threadMessages.messages
            .filter(msg => msg.isCurrent !== false)
            .map((msg) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              text: msg.content,
            }))
          setMessages(convertedMessages)
        }
      } catch (error) {
        console.error('Failed to regenerate message:', error)
        // Fallback to old behavior
        const messageIndex = messages.findIndex((m) => m.id === message.id)
        if (messageIndex === -1) return
        
        let lastUserMessage: ChatMessage | null = null
        for (let i = messageIndex - 1; i >= 0; i--) {
          if (messages[i].role === "user") {
            lastUserMessage = messages[i]
            break
          }
        }
        
        if (!lastUserMessage) return
        
        const threadId = activeThreadId || "thread-default"
        setMessages((prev) => {
          const updated = prev.filter((m) => m.id !== message.id)
          saveMessages(threadId, updated)
          return updated
        })
        
        await sendMessage(lastUserMessage.text)
      }
    };

    const handleCandidateNavigation = async (messageId: string, direction: 'prev' | 'next') => {
      const candidateData = messageCandidates[messageId]
      if (!candidateData || candidateData.candidates.length <= 1) return
      
      let newIndex = candidateData.currentIndex
      if (direction === 'next') {
        newIndex = (newIndex + 1) % candidateData.candidates.length
      } else {
        newIndex = (newIndex - 1 + candidateData.candidates.length) % candidateData.candidates.length
      }
      
      const newCandidate = candidateData.candidates[newIndex]
      
      // Update messages to show selected candidate
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            ...newCandidate,
          }
        }
        return msg
      }))
      
      // Update candidate state
      setMessageCandidates(prev => ({
        ...prev,
        [messageId]: {
          ...candidateData,
          currentIndex: newIndex,
        }
      }))
    }

    const handleBranchInNewChat = async () => {
      if (!tenantId) {
        console.error('[handleBranchInNewChat] tenantId required');
        return;
      }
      try {
        // Use v2 API: Branch message creates a new thread
        const response = await gatewayClient.branchMessage(message.id, {
          tenantId,
        })
        
        // Switch to the new thread
        setActiveThreadId(response.threadId)
        
        // Load messages from the new branch
        const branchMessages = await gatewayClient.getThreadMessages(response.threadId, {
          tenantId,
          branchId: response.branchId,
        })
        
        // Convert to ChatMessage format and set
        const convertedMessages: ChatMessage[] = branchMessages.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          text: msg.content,
        }))
        setMessages(convertedMessages)
      } catch (error) {
        console.error('Failed to branch message:', error)
      }
    };

    const handleReadAloud = () => {
      const plainText = stripInlineMemoryMarkers(message.text);
      if (ttsActive) {
        stopTts();
      } else {
        toggleTts({ id: message.id, text: plainText, lang: "de-DE" });
      }
    };

    const handleFeedback = async (messageId: string, type: "thumbs_up" | "thumbs_down") => {
      setFeedbackStatus((prev) => ({ ...prev, [messageId]: type }));
      try {
        const { authedFetch } = await import('@/lib/api/authedFetch')
        await authedFetch("/api/feedback", {
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

    const handleShare = async () => {
      // Build snapshot: last user before this assistant + this assistant
      const idx = messages.findIndex((m) => m.id === message.id);
      let lastUser: ChatMessage | null = null;
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i]?.role === "user") {
          lastUser = messages[i];
          break;
        }
      }

      const snapshotMessages = [
        ...(lastUser ? [{ role: "user" as const, text: stripInlineMemoryMarkers(lastUser.text) }] : []),
        { role: "assistant" as const, text: stripInlineMemoryMarkers(message.text) },
      ];

      try {
        const { authedFetch } = await import('@/lib/api/authedFetch')
        const res = await authedFetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ snapshot: { threadId: activeThreadId, messageId: message.id, messages: snapshotMessages } }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const url = data.url as string;

        if (navigator.share) {
          try {
            await navigator.share({
              title: "AKLOW Chat",
              text: snapshotMessages.map((m) => `${m.role}: ${m.text}`).join("\n\n").slice(0, 240),
              url,
            });
            return;
          } catch (err) {
            // Fallback to copy
            console.warn("Native share failed, fallback to copy", err);
          }
        }

        await navigator.clipboard.writeText(url);
        setHoveredTooltip({ messageId: message.id, icon: "share" });
        setTimeout(() => setHoveredTooltip(null), 1200);
      } catch (err) {
        console.error("Share failed", err);
      }
    };

    const isLast = isLastAssistantMessage(message);

    if (message.job) {
      return (
        <div key={message.id} className="group flex justify-start mb-6 animate-[fadeInUp_0.4s_ease-out]" style={{ marginLeft: "4%", maxWidth: "80%" }}>
          <div className="ak-glass flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[var(--ak-surface-1)]/40 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--ak-border-hairline)] bg-[var(--ak-color-bg-hover)] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  "h-2 w-2 rounded-full",
                  message.job.status === 'running' && "bg-[var(--ak-accent-inbox)] animate-pulse",
                  message.job.status === 'done' && "bg-[var(--ak-semantic-success)]",
                  message.job.status === 'error' && "bg-[var(--ak-semantic-danger)]",
                  message.job.status === 'queued' && "bg-[var(--ak-text-muted)]"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">
                  {message.job.module} · {message.job.view.split(':')[1]}
                </span>
              </div>
              <span className="text-[10px] font-medium text-[var(--ak-color-text-muted)]">
                {message.job.status === 'running' ? 'Wird ausgeführt...' : message.job.status === 'done' ? 'Abgeschlossen' : 'Warteschlange'}
              </span>
            </div>
            <div className="p-[var(--ak-card-pad)]">
              <h4 className="ak-text-title">{message.job.label}</h4>
              {message.job.error && (
                <p className="mt-1 ak-text-meta text-[var(--ak-semantic-danger)]">{message.job.error}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Build assistant action bar actions
    // Sichtbar: Kopieren, Daumen hoch, Daumen runter, Speichern, Mehr (...)
    // Im Dropdown: Teilen, Neu generieren, Chat exportieren, Vorlesen
    const assistantActions: ChatAction[] = [
      {
        type: 'copy',
        onClick: handleCopy,
        label: t('chat.copy'),
      },
      {
        type: 'thumbs_up' as ChatActionType,
        onClick: () => handleFeedback(message.id, 'thumbs_up'),
        label: t('chat.feedback.good'),
        active: feedbackStatus[message.id] === 'thumbs_up',
      },
      {
        type: 'thumbs_down' as ChatActionType,
        onClick: () => handleFeedback(message.id, 'thumbs_down'),
        label: t('chat.feedback.bad'),
        active: feedbackStatus[message.id] === 'thumbs_down',
      },
      {
        type: 'save' as ChatActionType,
        onClick: handleSave,
        label: savedMessageId === message.id ? t('chat.saved') : t('chat.save'),
        active: savedMessageId === message.id,
      },
      ...(expandedActions[message.id] ? [
        {
          type: 'share' as ChatActionType,
          onClick: handleShare,
          label: 'Teilen',
        },
        {
          type: 'regenerate' as ChatActionType,
          onClick: handleUpdate,
          label: t('chat.regenerate'),
        },
        ...(isLast ? [{
          type: 'export' as ChatActionType,
          onClick: () => setIsExportDialogOpen(true),
          label: 'Chat exportieren',
        }] : []),
        {
          type: 'read' as ChatActionType,
          onClick: handleReadAloud,
          label: ttsActive ? 'Stoppen' : 'Vorlesen',
          active: ttsActive,
          disabled: !ttsSupported || !message.text || message.text.trim().length === 0,
        },
        {
          type: 'more' as ChatActionType,
          onClick: () => setExpandedActions(prev => ({ ...prev, [message.id]: false })),
          label: 'Weniger',
        },
      ] : [
        {
          type: 'more' as ChatActionType,
          onClick: () => setExpandedActions(prev => ({ ...prev, [message.id]: true })),
          label: 'Mehr',
        },
      ]),
    ]

    return (
      <MessageFrame
        key={message.id}
        alignment="left"
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
        showHoverActions={false}
      >
            
            {/* Render Card if present AND message has text (mixed content) */}
            {message.card && message.text && (
                 <div className="w-full mb-3">
                     <OutputCardFrame>
                         <CardRenderer 
                            card={message.card} 
                            onAction={(id, params) => handleCardAction(id, params)}
                            onRowClick={(rowId, rowData) => handleCardRowClick(message.id, rowId, rowData)}
                            onPostEntity={handlePostEntity}
                            onPin={() => handlePinCard(message.card!)}
                            onInfo={() => handleCardInfo(message.card!)}
                         />
                     </OutputCardFrame>
                 </div>
            )}

            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex-1 min-w-0 text-[var(--ak-color-text-primary)] font-normal antialiased leading-[1.7]">
                {message.text ? (
                  <ChatMarkdown content={normalizeChatMarkdown(message.text)} tenantId={tenantId || undefined} />
                ) : (
                  <div className="text-[var(--ak-color-text-muted)] italic">
                    Antwort wird erstellt...
                  </div>
                )}
              </div>
            </div>

            {/* Timestamp and inline actions */}
            <div className="flex items-center gap-2 mt-1">
              {message.timestamp && (
                <div className="text-xs text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(message.timestamp)}
                </div>
              )}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95 ak-text-muted hover:ak-text-primary hover:ak-surface-2"
                  aria-label={t('chat.copy')}
                  title={t('chat.copy')}
                >
                  <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(message.id, 'thumbs_up')}
                  className={clsx(
                    "p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95",
                    feedbackStatus[message.id] === 'thumbs_up'
                      ? "text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)]"
                      : "ak-text-muted hover:text-[var(--ak-semantic-success)] hover:bg-[var(--ak-semantic-success-soft)]"
                  )}
                  aria-label={t('chat.feedback.good')}
                  title={t('chat.feedback.good')}
                >
                  <HandThumbUpIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(message.id, 'thumbs_down')}
                  className={clsx(
                    "p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95",
                    feedbackStatus[message.id] === 'thumbs_down'
                      ? "text-[var(--ak-semantic-danger)] bg-[var(--ak-semantic-danger-soft)]"
                      : "ak-text-muted hover:text-[var(--ak-semantic-danger)] hover:bg-[var(--ak-semantic-danger-soft)]"
                  )}
                  aria-label={t('chat.feedback.bad')}
                  title={t('chat.feedback.bad')}
                >
                  <HandThumbDownIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className={clsx(
                    "p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95",
                    savedMessageId === message.id
                      ? "text-[var(--ak-accent-inbox)] bg-[var(--ak-accent-inbox-soft)]"
                      : "ak-text-muted hover:ak-text-primary hover:ak-surface-2"
                  )}
                  aria-label={savedMessageId === message.id ? t('chat.saved') : t('chat.save')}
                  title={savedMessageId === message.id ? t('chat.saved') : t('chat.save')}
                >
                  <BookmarkIcon className="h-3.5 w-3.5" />
                </button>
                
                {/* More menu toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedActions(prev => ({ ...prev, [message.id]: !prev[message.id] }))}
                  className="p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95 ak-text-muted hover:ak-text-primary hover:ak-surface-2"
                  aria-label="Mehr Aktionen"
                  title="Mehr Aktionen"
                >
                  <EllipsisHorizontalIcon className="h-3.5 w-3.5" />
                </button>
                
                {/* Expanded actions */}
                {expandedActions[message.id] && (
                  <>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95 ak-text-muted hover:text-[var(--ak-accent-documents)] hover:bg-[var(--ak-accent-documents-soft)]"
                      aria-label="Teilen"
                      title="Teilen"
                    >
                      <ShareIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95 ak-text-muted hover:ak-text-primary hover:ak-surface-2"
                      aria-label={t('chat.regenerate')}
                      title={t('chat.regenerate')}
                    >
                      <ArrowPathIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleReadAloud}
                      disabled={!ttsSupported || !message.text || message.text.trim().length === 0}
                      className={clsx(
                        "p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95",
                        ttsActive
                          ? "text-[var(--ak-accent-inbox)] bg-[var(--ak-accent-inbox-soft)]"
                          : "ak-text-muted hover:ak-text-primary hover:ak-surface-2",
                        (!ttsSupported || !message.text || message.text.trim().length === 0) && "opacity-50 cursor-not-allowed"
                      )}
                      aria-label={ttsActive ? 'Stoppen' : 'Vorlesen'}
                      title={ttsActive ? 'Stoppen' : 'Vorlesen'}
                    >
                      <SpeakerWaveIcon className="h-3.5 w-3.5" />
                    </button>
                    {isLast && (
                      <button
                        type="button"
                        onClick={() => setIsExportDialogOpen(true)}
                        className="p-1 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95 ak-text-muted hover:ak-text-primary hover:ak-surface-2"
                        aria-label="Chat exportieren"
                        title="Chat exportieren"
                      >
                        <CloudArrowUpIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Candidates Navigation */}
            {messageCandidates[message.id] && messageCandidates[message.id].candidates.length > 1 && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 ak-surface-2 rounded-lg ak-border-default">
                <button
                  type="button"
                  onClick={() => handleCandidateNavigation(message.id, 'prev')}
                  className="p-1 rounded hover:ak-surface-2-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={messageCandidates[message.id].candidates.length <= 1}
                  aria-label="Vorheriger Candidate"
                >
                  <ChevronLeftIcon className="h-4 w-4 ak-text-secondary" />
                </button>
                <div className="flex items-center gap-1.5 flex-1 justify-center">
                  {messageCandidates[message.id].candidates.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const candidateData = messageCandidates[message.id]
                        if (idx !== candidateData.currentIndex) {
                          const direction = idx > candidateData.currentIndex ? 'next' : 'prev'
                          const steps = Math.abs(idx - candidateData.currentIndex)
                          for (let i = 0; i < steps; i++) {
                            setTimeout(() => handleCandidateNavigation(message.id, direction), i * 50)
                          }
                        }
                      }}
                      className={clsx(
                        "h-1.5 rounded-full transition-all",
                        idx === messageCandidates[message.id].currentIndex
                          ? "w-6 bg-[var(--ak-accent-inbox)]"
                          : "w-1.5 bg-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-text-muted)]"
                      )}
                      aria-label={`Candidate ${idx + 1} von ${messageCandidates[message.id].candidates.length}`}
                    />
                  ))}
                </div>
                <span className="text-xs ak-text-muted min-w-[60px] text-center">
                  {messageCandidates[message.id].currentIndex + 1} / {messageCandidates[message.id].candidates.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleCandidateNavigation(message.id, 'next')}
                  className="p-1 rounded hover:ak-surface-2-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={messageCandidates[message.id].candidates.length <= 1}
                  aria-label="Nächster Candidate"
                >
                  <ChevronRightIcon className="h-4 w-4 ak-text-secondary" />
                </button>
              </div>
            )}

            {/* Used Memories Chips */}
            {message.usedMemories && message.usedMemories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.usedMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="group/memory inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{memory.content.slice(0, 50)}{memory.content.length > 50 ? "…" : ""}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const success = await archiveMemory(memory.id);
                        if (success) {
                          // Remove from message
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === message.id
                                ? {
                                    ...m,
                                    usedMemories: m.usedMemories?.filter((mem: { id: string }) => mem.id !== memory.id),
                                  }
                                : m
                            )
                          );
                        }
                      }}
                      className="opacity-0 group-hover/memory:opacity-100 transition-opacity inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-[var(--ak-color-bg-danger-soft)] hover:text-[var(--ak-color-danger)]"
                      aria-label="Forget"
                      title="Forget"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Audio Player für Vorlesen-Modus */}
            {ttsActive && (
              <div className="mt-2 mb-2 px-4 py-2 ak-surface-2 rounded-lg ak-border-default flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-[var(--ak-accent-inbox)] rounded" style={{ animation: "audio-wave 0.6s ease-in-out infinite", animationDelay: "0ms" }} />
                      <div className="w-1 h-4 bg-[var(--ak-accent-inbox)] rounded" style={{ animation: "audio-wave 0.6s ease-in-out infinite", animationDelay: "0.15s" }} />
                      <div className="w-1 h-4 bg-[var(--ak-accent-inbox)] rounded" style={{ animation: "audio-wave 0.6s ease-in-out infinite", animationDelay: "0.3s" }} />
                    </div>
                    <span className="text-xs ak-text-secondary ml-2">Wird vorgelesen...</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-accent-inbox)] hover:bg-[var(--ak-accent-inbox-soft)] transition-colors"
                  aria-label={t('chat.stopReadAloud')}
                >
                  <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" strokeWidth={1} />
                </button>
              </div>
            )}



            {Array.isArray(message.uiMessages) && message.uiMessages.length > 0 ? (
              <div className="mt-3 w-full space-y-3">
                {message.uiMessages.map((uiMessage, index) => (
                  <WidgetRenderer key={index} message={uiMessage} />
                ))}
              </div>
            ) : null}

            {/* Pills for guided runs - ONLY show when WAITING_INPUT */}
            {waitingForInput && message.pills && message.pills.length > 0 && (
              <div className="mt-4 w-full">
                {message.step && (
                  <div className="text-xs text-[var(--ak-color-text-secondary)] mb-2">
                    {message.step}
                  </div>
                )}
                <Pills
                  pills={message.pills}
                  onPillClick={async (pill) => {
                    if (message.runId && message.runState === "WAITING_INPUT") {
                      const stepKey = pill.step_key || message.pendingStepKey || message.step;
                      const inputKey = pill.input_key || message.pendingInputKey;
                      
                      if (!stepKey) {
                        setMessages(prev => {
                          const msgIndex = prev.findIndex(m => m.id === message.id);
                          if (msgIndex === -1) return prev;
                          const next = [...prev];
                          const warningText = `${next[msgIndex].text}\n\n⚠️ Konnte Eingabe nicht senden (step_key fehlt). Bitte starte die Aktion erneut.`;
                          next[msgIndex] = { ...next[msgIndex], text: warningText };
                          saveMessages(activeThreadIdRef.current || "thread-default", next, false);
                          return next;
                        });
                        return;
                      }

                      try {
                        await sendInput(message.runId, {
                          step_key: stepKey,
                          input_key: inputKey,
                          input: pill.value,
                        });
                        // Update message state
                        setMessages(prev => {
                          const msgIndex = prev.findIndex(m => m.id === message.id);
                          if (msgIndex === -1) return prev;
                          const next = [...prev];
                          next[msgIndex] = {
                            ...next[msgIndex],
                            runState: "RUNNING",
                            pills: undefined, // Clear pills while processing
                          };
                          saveMessages(activeThreadIdRef.current || "thread-default", next, false);
                          return next;
                        });
                      } catch (error) {
                        console.error("Failed to send input:", error);
                      }
                    }
                  }}
                  maxVisible={3}
                />
              </div>
            )}

{/* Follow-up Suggestions - SUPPRESS when WAITING_INPUT */}
{!waitingForInput && isLastAssistantMessage(message) && followUpSuggestions.length > 0 && (
                              <div className="mt-6 flex flex-wrap gap-2.5">
                                {followUpSuggestions.slice(0, 3).map((suggestion, index) => (
                                  <motion.button
                                    key={`suggestion-${index}`}
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ 
                                      delay: index * 0.05,
                                      duration: 0.2,
                                      ease: "easeOut"
                                    }}
                                    onClick={() => handleQuickCardClick(suggestion)}
                                    className="px-4 py-2 rounded-lg ak-surface-1 ak-border-default text-sm font-medium ak-text-primary hover:ak-surface-2 hover:ak-border-strong hover:ak-shadow-1 active:scale-95 transition-all duration-200 ak-shadow-1 group"
                                  >
                                    {suggestion} 
                                    <span className="ak-text-muted ml-1.5 group-hover:text-[var(--ak-accent-documents)] group-hover:translate-x-0.5 inline-block transition-all">→</span>
                                  </motion.button>
                                ))}
                                {followUpSuggestions.length > 3 && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15, duration: 0.2 }}
                                    type="button"
                                    onClick={() => {
                                      // TODO: Show more suggestions
                                    }}
                                    className="px-3 py-2 rounded-lg ak-surface-1 ak-border-default text-xs font-medium ak-text-secondary hover:ak-surface-2 transition-colors ak-shadow-1"
                                  >
                                    + {followUpSuggestions.length - 3} mehr
                                  </motion.button>
                                )}
                              </div>
                            )}
      </MessageFrame>
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
      expandedActions,
      speakingId,
      ttsSupported,
      thinkingSteps,
      messages.length,
      // Add dependencies for Card expansion
      messages // We need full messages array dependency if we are modifying it deeply, or at least the specific message
    ]
  );

  // Neue Mikrofon-Handler-Funktionen
  const handleMicrophonePress = useCallback(() => {
    // Wenn bereits aktiv (Recording oder Realtime)
    if (isMicrophoneActive) {
      if (isRealtimeActive) {
        void stopRealtimeAll();
      } else {
        stopRecording(); // Das löst die Transkription aus (Senden)
      }
      micModeRef.current = null;
      micPressStartRef.current = null;
      if (micPressTimerRef.current) {
        clearTimeout(micPressTimerRef.current);
        micPressTimerRef.current = null;
      }
      return;
    }
    
    // Nicht aktiv: Starte Aufnahme
    micPressStartRef.current = Date.now();
    micModeRef.current = 'dictation';
    startRecording();

    // Timer für Realtime (3s)
    micPressTimerRef.current = setTimeout(() => {
      micModeRef.current = 'realtime';
      void pressRealtime();
    }, 3000);
  }, [isMicrophoneActive, isRealtimeActive, stopRecording, stopRealtimeAll, startRecording, pressRealtime]);

  const handleMicrophoneRelease = useCallback(() => {
    const pressDuration = micPressStartRef.current ? Date.now() - micPressStartRef.current : 0;
    
    if (micPressTimerRef.current) {
      clearTimeout(micPressTimerRef.current);
      micPressTimerRef.current = null;
    }
    
    // Wenn < 3 Sekunden: Behalte Dictation bei (User will vielleicht nur einmal drücken)
    if (pressDuration < 3000 && micModeRef.current === 'dictation') {
      // Dictation läuft weiter, nichts tun
      micPressStartRef.current = null;
    } else if (micModeRef.current === 'realtime') {
      // Realtime wurde gestartet, jetzt loslassen beendet den Realtime-Turn
      void releaseRealtime();
      micPressStartRef.current = null;
    } else {
      micPressStartRef.current = null;
    }
  }, [releaseRealtime]);

  const handleCancelAudio = useCallback(() => {
    if (micPressTimerRef.current) {
      clearTimeout(micPressTimerRef.current);
      micPressTimerRef.current = null;
    }
    micPressStartRef.current = null;
    
    if (dictationStatus === 'recording') {
      cancelRecording(); // Aufnahme abbrechen ohne Transkription
    }
    if (isRealtimeActive) {
      void stopRealtimeAll();
    }
    micModeRef.current = null;
  }, [dictationStatus, isRealtimeActive, cancelRecording, stopRealtimeAll]);

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

  // ESC: zentralisiertes Escape-Handling (funktioniert auch in Inputs/Textareas)
  useAklowEscape({
    enabled: true,
    onEscape: () => {
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
  });

  return (
    <div
      suppressHydrationWarning
      className={clsx(
        // Important: ChatShell must respect the height of its parent layout (ChatWorkspaceShell).
        // Using h-screen here can cause clipping when ChatShell is mounted inside another full-height container.
        "flex h-full min-h-0 w-full max-w-full flex-col gap-0 relative transition-colors duration-1000 ease-in-out overflow-hidden",
        (ambientColor === "ak-bg-surface-1" || ambientColor?.includes("surface") || !ambientColor) ? "bg-[var(--ak-color-bg-surface)]" : ambientColor
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Ambient Glow Orbs - Opacity bleibt konstant während Streaming */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={clsx(
          "absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000",
          (ambientColor === "ak-bg-surface-1" || ambientColor?.includes("surface") || !ambientColor) 
            ? "bg-[var(--ak-accent-inbox-soft)] opacity-[0.18]" 
            : isSending 
              ? "opacity-[0.18] " + ambientColor.replace("/30", "")
              : "opacity-40 " + ambientColor.replace("/30", "")
        )} />
        <div className={clsx(
          "absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000",
          (ambientColor === "ak-bg-surface-1" || ambientColor?.includes("surface") || !ambientColor) 
            ? "bg-[var(--ak-accent-documents-soft)] opacity-[0.18]" 
            : isSending 
              ? "opacity-[0.18] " + ambientColor.replace("/30", "")
              : "opacity-40 " + ambientColor.replace("/30", "")
        )} />
      </div>

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[var(--ak-accent-documents-soft)] backdrop-blur-sm border-2 border-[var(--ak-accent-documents)] border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"
          >
            <div className="ak-surface-1 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
              <div className="h-16 w-16 bg-[var(--ak-accent-documents-soft)] rounded-full flex items-center justify-center text-[var(--ak-accent-documents)]">
                <CloudArrowUpIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold ak-text-primary">Dateien hier ablegen</h3>
              <p className="text-sm ak-text-muted">Zum Chat hinzufügen</p>
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
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
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

      {/* Scrollable Content Area - absolute positioned to ensure independent scrolling */}
      <div
        ref={scrollParentRef}
        className="absolute inset-0 top-14 bottom-0 overflow-y-auto overflow-x-hidden ak-scrollbar"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
          contain: 'layout style',
        }}
      >
        {/* Empty State - Greeting Card */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <ChatGreetingCard 
              workspaceId={activeThreadId || 'default'}
              onQuickAction={async (actionId) => {
                let prompt = "";
                
                if (actionId === 'daily_briefing') {
                  prompt = "Erstelle mir bitte ein kurzes Briefing für den heutigen Tag. Zeige mir: wichtige anstehende Aufgaben, Termine und Prioritäten. Gib mir einen klaren Überblick.";
                } else if (actionId === 'draft_content') {
                  prompt = "Ich möchte einen professionellen Text verfassen. Was soll es sein? Eine E-Mail, ein Social-Media-Post, ein Bericht oder etwas anderes? Gib mir ein paar Optionen oder stelle mir Fragen, damit ich dir den Kontext geben kann.";
                } else if (actionId === 'find_info') {
                  prompt = "Ich suche nach spezifischen Informationen in meinen Dokumenten, Chats oder Notizen. Zu welchem Thema, Projekt oder Kontext benötigst du Informationen? Beschreibe kurz, wonach ich suchen soll.";
                }

                if (prompt) {
                  await sendMessage(prompt, true);
                }
              }}
            />
          </div>
        )}

          {/* Messages Container */}
          {messages.length > 0 && (
            <div className="pt-4 w-full">
              
              {/* Context cards - Pinned Context Area (Future) */}
              <div className="px-4 pb-4">
                <ContextCardRenderer className="mx-auto max-w-3xl w-full" />
              </div>

              {/* Compose Card - Rendered as Output Card */}
              {isComposeOpen && (
                <div className="px-4 pt-2 pb-4">
                  <ComposeCard
                    initialContext={{ channel: composeChannel }}
                    onClose={() => setIsComposeOpen(false)}
                    onSuccess={() => {
                      toast.success('Nachricht gesendet');
                      setIsComposeOpen(false);
                    }}
                  />
                </div>
              )}

              {/* Windowed Rendering: Ältere Nachrichten nachladen */}
              {hiddenMessageCount > 0 && (
                <div className="px-4 pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      const scrollParent = scrollParentRef.current
                      if (scrollParent) {
                        setPendingPrependScroll({
                          scrollTop: scrollParent.scrollTop,
                          scrollHeight: scrollParent.scrollHeight,
                        })
                      }
                      setRenderCount((prev) => Math.min(prev + 80, messages.length))
                    }}
                    className="mx-auto max-w-3xl w-full rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)] px-4 py-2 text-xs font-medium text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                  >
                    Ältere Nachrichten laden ({hiddenMessageCount})
                  </button>
                </div>
              )}

              {/* Messages (windowed) */}
              {visibleMessages.map((msg) => (
                <div key={msg.id} data-message-id={msg.id} className="mx-auto max-w-3xl w-full px-4 py-2">
                  {renderMessageMemo(msg)}
                </div>
              ))}

              {/* Thinking indicator */}
              {showThinking && (
                <div className="mx-auto max-w-3xl w-full px-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start relative px-[5%] mt-2 mb-4"
                  >
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--ak-color-bg-surface)]/40 border border-[var(--ak-color-border-subtle)]/30">
                      <div className="flex items-center gap-0.5">
                        <span className="inline-block w-1 h-1 rounded-full bg-[var(--ak-color-text-muted)]/60" style={{ animation: "thinking-dot-blink 1.2s ease-in-out infinite", animationDelay: "0ms" }} />
                        <span className="inline-block w-1 h-1 rounded-full bg-[var(--ak-color-text-muted)]/60" style={{ animation: "thinking-dot-blink 1.2s ease-in-out infinite", animationDelay: "300ms" }} />
                        <span className="inline-block w-1 h-1 rounded-full bg-[var(--ak-color-text-muted)]/60" style={{ animation: "thinking-dot-blink 1.2s ease-in-out infinite", animationDelay: "600ms" }} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Bottom padding for composer - increased for better scroll clearance */}
              <div className="h-32" />
            </div>
          )}

      </div>

      {/* Jump to bottom Button - fixed above composer */}
      {showJumpToBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-28 left-1/2 md:left-[calc(50%+var(--ak-rail-width)/2+var(--ak-sidebar-width,0px)/2)] -translate-x-1/2 z-40 flex h-10 w-10 items-center justify-center rounded-full ak-bg-glass text-[var(--ak-text-muted)] shadow-xl ring-1 ring-black/5 hover:brightness-110 hover:text-[var(--ak-accent-documents)] active:scale-90 transition-all"
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

      {/* Composer - Fixed at bottom, aligned to Chat viewport (rail + sidebar) */}
      <div className="fixed bottom-0 right-0 left-0 md:left-[calc(var(--ak-rail-width)+var(--ak-sidebar-width,0px))] z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-4 flex justify-center bg-gradient-to-t from-[var(--ak-color-bg-app)] via-[var(--ak-color-bg-app)] to-transparent pointer-events-none">
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
                  <div key={file.id} className="group relative flex items-center gap-2 p-2 ak-bg-glass ak-border-default rounded-xl ak-shadow-1 pr-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)]">
                      <DocumentIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold ak-text-primary truncate max-w-[120px]">{file.name}</span>
                      <span className="text-[10px] ak-text-muted uppercase">{file.type.split('/')[1] || 'FILE'}</span>
                    </div>
                    <button 
                      onClick={() => removeAttachment(file.id)}
                      className="absolute right-1 top-1 h-5 w-5 flex items-center justify-center rounded-full ak-surface-2 ak-text-muted opacity-0 group-hover:opacity-100 hover:bg-[var(--ak-semantic-danger-soft)] hover:text-[var(--ak-semantic-danger)] transition-all"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className={clsx(
            "relative flex items-center gap-2 rounded-[var(--ak-radius-2xl)] px-4 py-2.5 min-h-[60px]",
            "ak-composer-surface",
            isRealtimeActive 
              ? "ak-composer-surface--realtime ring-2 ring-[var(--ak-semantic-danger)]/20"
              : ""
          )}>
            {/* Audio-Wellen-Visualisierung - 60% Breite, zentriert, ChatGPT-Stil */}
            {isMicrophoneActive && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] flex items-center justify-center gap-1 z-10 pointer-events-none">
                <div className="flex items-center justify-center gap-[3px] h-10 w-full overflow-hidden">
                  {Array.from({ length: 32 }).map((_, i) => {
                    // ChatGPT-ähnliche flüssige Wellen-Logik
                    const frequencyBand = localAudioBands[i % localAudioBands.length] || 0;
                    const level = audioLevel > 0 ? (localAudioLevel * 0.5 + frequencyBand * 0.5) : (localFakeWaveLevels[i % 20] || 0.2);
                    
                    // Sanftere, flüssigere Höhe
                    const targetHeight = Math.max(4, level * 36);
                    
                    // ChatGPT-ähnliche Farben: Indigo/Blau/Violett für Dictation, Rot/Orange/Pink für Realtime
                    const colors = isRealtimeActive 
                      ? ['#ef4444', '#f43f5e', '#ec4899', '#d946ef'] 
                      : ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6'];
                    const color = colors[i % colors.length];
                    
                    return (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: targetHeight,
                          backgroundColor: color,
                          boxShadow: `0 0 12px ${color}40`,
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20,
                          mass: 0.8
                        }}
                        className="w-[3px] rounded-full flex-shrink-0"
                        style={{
                          opacity: 0.4 + (level * 0.6),
                        }}
                      />
                    );
                  })}
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
                className={clsx(
                  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] border border-transparent",
                  isPlusMenuOpen 
                    ? "bg-[var(--ak-color-graphite-base)] shadow-md"
                    : "bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]"
                )}
                style={isPlusMenuOpen ? { color: 'var(--ak-color-graphite-text)' } : undefined}
                aria-label={t('chat.openMenu')}
              >
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {/* Fast Actions removed - suggestion indicator removed */}
                </div>
              </button>

            {isPlusMenuOpen && (
              <>
                <div className="fixed inset-0 z-[9998] cursor-default pointer-events-auto" onClick={() => setIsPlusMenuOpen(false)} />
                <div className="ak-glass fixed bottom-24 left-4 z-[9999] w-72 origin-bottom-left rounded-2xl border border-[var(--ak-color-border-fine)] shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-160px-env(safe-area-inset-bottom,0px))] overflow-y-auto">
                  <div className="flex flex-col gap-0.5">
                    {/* Fast Actions removed - use Suggestion System instead (see Phase 3) */}

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left text-sm font-medium ak-text-primary hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      <CloudArrowUpIcon className="h-5 w-5 ak-text-muted" />
                      Datei oder Foto hochladen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        setIsDeepResearchModalOpen(true);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left text-sm font-medium ak-text-primary hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      <GlobeAltIcon className="h-5 w-5 ak-text-muted" />
                      Intensive Internetsuche
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>

            {/* Web Search Toggle */}
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={clsx(
                "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all",
                webSearchEnabled
                  ? "bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]"
                  : "bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]"
              )}
              title={webSearchEnabled ? "Websuche deaktivieren" : "Websuche aktivieren"}
            >
              <GlobeAltIcon className="h-4 w-4" />
            </button>

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
              "ak-body flex-1 border-none bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-secondary)] focus:ring-0 focus:outline-none outline-none ring-0 border-0 shadow-none resize-none py-1 min-h-[24px] max-h-[120px] overflow-y-auto focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!border-none focus-visible:!outline-none focus:!ring-0 focus-visible:!shadow-none focus-visible:!border-none",
              shouldHideInput && "text-transparent placeholder-transparent caret-transparent cursor-not-allowed select-none opacity-80"
            )}
          />

            <button
              type="button"
              onClick={handleMicrophonePress}
              onMouseDown={(e) => {
                e.preventDefault();
                handleMicrophonePress();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                handleMicrophoneRelease();
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
                handleMicrophonePress();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleMicrophoneRelease();
              }}
              className={clsx(
                "relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px]",
                isMicrophoneActive && "ring-2 ring-[var(--ak-color-bg-danger-soft)] ring-offset-2",
                isRealtimeActive && "bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)]",
                dictationStatus === 'recording' && "bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]"
              )}
              aria-label={isMicrophoneActive ? (isRealtimeActive ? 'Realtime Voice' : 'Transkription') : t('chat.microphone')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (isMicrophoneActive) {
                  handleCancelAudio();
                } else if (isSending) {
                  handleStopGeneration();
                } else {
                  void handleSend();
                }
              }}
              disabled={!isSending && !input.trim() && !isMicrophoneActive}
              className={clsx(
                "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full ak-shadow-soft transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-95 border",
                isMicrophoneActive
                  ? "bg-[var(--ak-semantic-danger)] hover:brightness-110 border-transparent cursor-pointer"
                  : isSending 
                    ? "bg-[var(--ak-color-graphite-base)] hover:brightness-90 border-transparent cursor-pointer"
                    : input.trim()
                      ? "bg-[var(--ak-semantic-success)] hover:opacity-90 border-[var(--ak-color-border-subtle)] cursor-pointer"
                      : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-muted)] border-[var(--ak-color-border-subtle)]",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
              aria-label={isMicrophoneActive ? 'Aufnahme abbrechen' : (isSending ? t('chat.stopGenerating') : t('chat.send'))}
            >
              {isMicrophoneActive ? (
                <XMarkIcon className="h-5 w-5" />
              ) : isSending ? (
                <div className="h-3 w-3 ak-bg-surface-1 rounded-sm" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
        <div className="fixed top-4 right-4 z-[10000] p-3 bg-[var(--ak-color-graphite-base)]/80 backdrop-blur-md rounded-xl border border-[var(--ak-surface-1)]/20 text-[10px] font-mono text-[var(--ak-semantic-success)] shadow-2xl pointer-events-none select-none max-w-xs space-y-1">
          <div className="flex justify-between border-b border-[var(--ak-surface-1)]/10 pb-1 mb-1">
            <span className="font-bold uppercase" style={{ color: 'var(--ak-color-graphite-text)' }}>Debug HUD</span>
            <span className="ak-text-muted">v1.0</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="ak-text-muted">activeThreadId:</span>
            <span className="truncate ml-2">{activeThreadId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="ak-text-muted">pinnedToBottom:</span>
            <span>{pinnedToBottom ? "TRUE" : "FALSE"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="ak-text-muted">messages:</span>
            <span>{messages.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="ak-text-muted">isSending:</span>
            <span className={isSending ? "text-[var(--ak-semantic-warning)]" : ""}>{isSending ? "STREAMING" : "IDLE"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="ak-text-muted">tenantId:</span>
            <span>{tenantId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="ak-text-muted">industry:</span>
            <span>GENERAL</span>
          </div>
        </div>
      )}
      
      {/* Export Dialog */}
      <ChatExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        messages={messages.map((msg): ExportMessage => ({
          role: msg.role as 'user' | 'assistant',
          text: msg.text,
          timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : undefined
        }))}
        chatTitle={threads.find(t => t.id === currentThreadRef.current)?.title}
      />

      <DeepResearchModal 
        isOpen={isDeepResearchModalOpen}
        onClose={() => setIsDeepResearchModalOpen(false)}
        onStartResearch={handleStartDeepResearch}
      />
    </div>
  );
}
