"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { BellIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import { WidgetRenderer } from "./chat/WidgetRenderer";
import { sendChatMessageStream, ChatResponse } from "../lib/chatClient";
import { useDictation } from "../hooks/useDictation";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { TtsToggleButton } from "./chat/TtsToggleButton";
import { ChatMessageAvatar } from "./chat/ChatMessageAvatar";
import { ThinkingStepsDrawer } from "./chat/ThinkingStepsDrawer";
import { ChatMarkdown } from "./chat/markdown/ChatMarkdown";

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

  const { status: realtimeStatus, toggle: toggleRealtime } = useRealtimeVoice({
    onStart: () => {
      console.log("Real-time Audio gestartet");
    },
    onStop: () => {
      console.log("Real-time Audio gestoppt");
    },
  });

  const isMicrophoneActive =
    dictationStatus === "recording" ||
    dictationStatus === "transcribing" ||
    realtimeStatus === "live";

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
    return () => {
      window.removeEventListener("aklow-select-thread", handleSelect as EventListener);
      window.removeEventListener("aklow-new-chat", handleNew as EventListener);
    };
  }, [loadMessages, stopTts]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      stopTts();
    };
  }, [stopTts]);

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0];
  const isLastAssistantMessage = (msg: ChatMessage) => msg.id === lastAssistantMessage?.id;

  const showThinking = isSending && (thinkingSteps.length > 0 || !!thinkingNote);

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === "user";

    if (isUser) {
      return (
        <div
          key={message.id}
          className="flex justify-end"
          style={{ marginLeft: "auto", maxWidth: "60%", marginRight: "3%" }}
        >
          <div className="flex flex-col gap-2" style={{ alignItems: "flex-end", width: "100%" }}>
            <div
              className="ak-body whitespace-pre-wrap leading-relaxed rounded-xl px-2.5 py-1.5 shadow-sm text-right bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)]"
              style={{ color: "var(--ak-color-text-primary)", fontSize: "16px" }}
            >
              {message.text}
            </div>
          </div>
        </div>
      );
    }

    const ttsActive = speakingId === message.id;

    return (
      <div
        key={message.id}
        className="flex justify-start animate-[fadeInUp_0.3s_var(--ak-motion-ease)]"
        style={{
          marginLeft: "3%",
          maxWidth: "85%",
          opacity: 0,
          animation: "fadeInUp 0.3s var(--ak-motion-ease) forwards",
        }}
      >
        <div className="flex w-full items-start gap-3">
          <ChatMessageAvatar role="assistant" />
          <div className="flex w-full flex-col gap-3" style={{ alignItems: "flex-start" }}>
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <ChatMarkdown content={message.text} />
              </div>
              <div className="flex items-center gap-1">
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
                <TtsToggleButton
                  active={ttsActive}
                  disabled={!ttsSupported || !message.text || message.text.trim().length === 0}
                  onClick={() => toggleTts({ id: message.id, text: message.text, lang: "de-DE" })}
                />
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
      const next = [...prev, assistantMessage];
      saveMessages(threadId, next);
      return next;
    });

    try {
      let fullContent = "";

      await sendChatMessageStream(
        {
          tenantId,
          sessionId: threadId,
          channel: "web_chat",
          message: trimmed,
        },
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
            fullContent += data.content || "";
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
            const finalContent = data.content || fullContent;
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, text: finalContent, uiMessages: data.uiMessages }
                  : msg
              );
              saveMessages(threadId, updated);
              return updated;
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

  const handleBellClick = () => {
    window.dispatchEvent(new CustomEvent("aklow-open-module", { detail: { module: "inbox" } }));
  };

  return (
    <div
      className="flex h-full flex-col gap-4 rounded-2xl px-4 pt-4 pb-2 relative"
      style={{
        background: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--ak-color-border-hairline)",
        boxShadow: "var(--ak-shadow-glass)",
      }}
    >
      <button
        type="button"
        onClick={handleBellClick}
        className="absolute top-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent text-slate-500 transition-all duration-200 hover:bg-white/30 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:ring-offset-2"
        aria-label="Benachrichtigungen"
      >
        <BellIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      <ThinkingStepsDrawer
        open={isStepsOpen}
        onClose={() => setIsStepsOpen(false)}
        steps={thinkingSteps}
        note={thinkingNote}
      />

      <div className="flex-1 overflow-y-auto space-y-6 px-[5%] py-2 pb-28 mx-auto max-w-3xl">
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
              <div className="flex justify-start">
                <div className="flex items-center gap-1 px-[5%]">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 opacity-60"
                    style={{ animation: "thinking-dot 1.4s ease-in-out infinite", animationDelay: "0ms" }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 opacity-60"
                    style={{ animation: "thinking-dot 1.4s ease-in-out infinite", animationDelay: "200ms" }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 opacity-60"
                    style={{ animation: "thinking-dot 1.4s ease-in-out infinite", animationDelay: "400ms" }}
                  />
                  {(thinkingSteps.length > 0 || thinkingNote) && (
                    <button
                      type="button"
                      onClick={() => setIsStepsOpen(true)}
                      className="ml-2 inline-flex items-center gap-1 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/70 px-2.5 py-1 text-[11px] font-medium text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)]"
                      aria-label="Orchestrator anzeigen"
                    >
                      <RectangleStackIcon className="h-4 w-4" aria-hidden="true" />
                      Orchestrator
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSend} className="px-[5%]">
        <div className="ak-glass-panel relative flex items-center gap-2 rounded-full px-4 py-3 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-within:shadow-[var(--ak-shadow-glass)] focus-within:scale-[1.01] border border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface)]/70 backdrop-blur-xl">
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
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                      }}
                      className="ak-body w-full px-4 py-3 text-left text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      Bild generieren
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                      }}
                      className="ak-body w-full px-4 py-3 text-left text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      Lernmodus
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreibe mit Aklow"
            ref={inputRef}
            className="ak-body flex-1 border-none bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-secondary)] focus-visible:outline-none"
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
              "inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px]",
              isMicrophoneActive && "ring-2 ring-[var(--ak-color-bg-danger-soft)] ring-offset-2"
            )}
            aria-label="Mikrofon"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-full shadow-[var(--ak-shadow-soft)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:translate-y-[-1px] active:translate-y-[0px] active:scale-95",
              input.trim()
                ? "bg-[var(--ak-color-accent)] text-white hover:opacity-90"
                : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-muted)] border border-[var(--ak-color-border-subtle)]",
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
