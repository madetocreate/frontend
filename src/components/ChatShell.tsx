"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendChatMessageStream, ChatResponse } from "../lib/chatClient";
import { useDictation } from "../hooks/useDictation";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";

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

function createSessionId(): string {
  return "web-session-" + Math.random().toString(36).slice(2);
}

export function ChatShell() {
  const [tenantId] = useState<string>('demo-tenant')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false)
  const [quickHint, setQuickHint] = useState<string>('')
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [thinkingNote, setThinkingNote] = useState<string | null>(null)
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)
  const currentThreadRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { status: dictationStatus, startRecording, stopRecording } = useDictation({
    onTranscriptionReady: (text) => {
      setInput((prev) => prev + (prev ? ' ' : '') + text)
    },
  })

  const { status: realtimeStatus, toggle: toggleRealtime } = useRealtimeVoice({
    onStart: () => {
      console.log('Real-time Audio gestartet')
    },
    onStop: () => {
      console.log('Real-time Audio gestoppt')
    },
  })

  const isMicrophoneActive = dictationStatus === 'recording' || dictationStatus === 'transcribing' || realtimeStatus === 'live'

  const threadStorageKey = (threadId: string) => `aklow_thread_${threadId}`

  const loadMessages = useCallback((threadId: string) => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(threadStorageKey(threadId))
      if (!raw) return []
      const parsed = JSON.parse(raw) as ChatMessage[]
      if (!Array.isArray(parsed)) return []
      return parsed
    } catch {
      return []
    }
  }, [])

  const saveMessages = useCallback((threadId: string, list: ChatMessage[]) => {
    try {
      localStorage.setItem(threadStorageKey(threadId), JSON.stringify(list))
    } catch (e) {
      console.warn('Konnte Messages nicht speichern', e)
    }
  }, [])

  const makeTitle = (text: string) => {
    const clean = text.replace(/\s+/g, ' ').trim()
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean)
    const firstTwo = sentences.slice(0, 2).join(' ')
    const base = firstTwo || clean
    return base.length > 80 ? base.slice(0, 77) + '…' : base || 'Neuer Chat'
  }

  // Thread-Selektion / Neuer Chat
  useEffect(() => {
    const handleSelect = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string } | undefined
      if (!detail?.threadId) return
      currentThreadRef.current = detail.threadId
      const loaded = loadMessages(detail.threadId)
      setMessages(loaded)
      setInput('')
      inputRef.current?.focus()
    }
    const handleNew = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threadId?: string } | undefined
      const newId = detail?.threadId || `thread-${Date.now()}`
      currentThreadRef.current = newId
      const loaded = loadMessages(newId)
      setMessages(loaded)
      setInput('')
      inputRef.current?.focus()
    }
    window.addEventListener('aklow-select-thread', handleSelect as EventListener)
    window.addEventListener('aklow-new-chat', handleNew as EventListener)
    return () => {
      window.removeEventListener('aklow-select-thread', handleSelect as EventListener)
      window.removeEventListener('aklow-new-chat', handleNew as EventListener)
    }
  }, [loadMessages])

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user'
    const maxWidth = isUser ? '60%' : '80%'

    if (isUser) {
      return (
        <div key={message.id} className="flex justify-end" style={{ marginLeft: 'auto', maxWidth: '60%' }}>
          <div
            className="flex flex-col gap-2"
            style={{ alignItems: 'flex-end', width: '100%' }}
          >
            <div
              className="whitespace-pre-wrap leading-relaxed rounded-2xl px-3 py-2 shadow-sm"
              style={{
                fontSize: '19px',
                color: 'var(--ak-color-text-primary)',
                textAlign: 'right',
                backgroundColor: 'var(--ak-color-bg-surface-muted)',
                border: '1px solid var(--ak-color-border-subtle)',
              }}
            >
              {message.text}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={message.id} className="flex justify-start">
        <div
          className="flex flex-col gap-3"
          style={{ maxWidth, alignItems: 'flex-start' }}
        >
          <div
            className="prose prose-slate max-w-none leading-relaxed"
            style={{ 
              color: 'var(--ak-color-text-primary)',
              fontSize: '21px',
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '0' }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p style={{ marginBottom: '0.75rem', marginTop: '0', lineHeight: '1.6', fontSize: '21px' }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul style={{ marginBottom: '0.75rem', marginTop: '0', paddingLeft: '1.5rem' }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ marginBottom: '0.75rem', marginTop: '0', paddingLeft: '1.5rem' }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '0.25rem' }}>
                    {children}
                  </li>
                ),
                table: ({ children }) => (
                  <div style={{ overflowX: 'auto', marginBottom: '1rem', marginTop: '0.5rem' }}>
                    <table style={{ 
                      borderCollapse: 'collapse', 
                      width: '100%',
                      border: '1px solid var(--ak-color-border-subtle)',
                      borderRadius: '8px',
                    }}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead style={{ backgroundColor: 'var(--ak-color-bg-surface-muted)' }}>
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody>
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr style={{ borderBottom: '1px solid var(--ak-color-border-subtle)' }}>
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th style={{ 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    fontWeight: '600',
                    fontSize: '22px',
                  }}>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td style={{ 
                    padding: '0.75rem',
                    fontSize: '22px',
                  }}>
                    {children}
                  </td>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code style={{ 
                      backgroundColor: 'var(--ak-color-bg-surface-muted)',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '4px',
                      fontSize: '22px',
                      fontFamily: 'monospace',
                    }}>
                      {children}
                    </code>
                  ) : (
                    <code className={className} style={{ fontSize: '22px' }}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre style={{ 
                    backgroundColor: 'var(--ak-color-bg-surface-muted)',
                    padding: '1rem',
                    borderRadius: '8px',
                    overflowX: 'auto',
                    marginBottom: '0.75rem',
                    fontSize: '22px',
                  }}>
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote style={{ 
                    borderLeft: '4px solid var(--ak-color-accent)',
                    paddingLeft: '1rem',
                    marginLeft: '0',
                    marginBottom: '0.75rem',
                    fontStyle: 'italic',
                  }}>
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 'bold' }}>
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em style={{ fontStyle: 'italic' }}>
                    {children}
                  </em>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          {message.uiMessages && message.uiMessages.length > 0 ? (
            <pre className="whitespace-pre-wrap text-[11px] text-[var(--ak-color-text-muted)]">
              {JSON.stringify(message.uiMessages, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    )
  }

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isSending) return
    const threadId = currentThreadRef.current || 'thread-default'

    const userMessage: ChatMessage = {
      id: String(Date.now()) + '-user',
      role: 'user',
      text: trimmed,
    }

    setMessages((prev) => {
      const next = [...prev, userMessage]
      saveMessages(threadId, next)
      return next
    })
    setInput('')
    setIsSending(true)
    setQuickHint('') // Hinweis zurücksetzen beim Senden

    // Erstelle eine temporäre Assistant-Nachricht für Streaming
    const assistantMessageId = String(Date.now()) + '-assistant'
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      uiMessages: [],
    }

    // Füge leere Assistant-Nachricht hinzu
    setMessages((prev) => {
      const next = [...prev, assistantMessage]
      saveMessages(threadId, next)
      return next
    })

    try {
      let fullContent = ''
      setThinkingSteps([])
      setThinkingNote(null)
      
      await sendChatMessageStream(
        {
          tenantId,
          sessionId: threadId,
          channel: 'web_chat',
          message: trimmed,
        },
        {
          onStart: (data) => {
            const steps = (data.steps ?? []) as ThinkingStep[]
            setThinkingSteps(steps)
            setThinkingNote('Denke nach …')
          },
          onStepUpdate: (data) => {
            setThinkingSteps((prev) =>
              prev.map((s) =>
                s.id === data.stepId ? { ...s, status: data.status as ThinkingStep["status"] } : s
              )
            )
          },
          onChunk: (data) => {
            // Füge Chunk zum Inhalt hinzu
            fullContent += data.content || ''
            setThinkingNote('Antwort wird erstellt …')
            
            // Aktualisiere die Nachricht mit dem neuen Inhalt
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, text: fullContent }
                  : msg
              )
              saveMessages(threadId, updated)
              return updated
            })
          },
          onEnd: (data) => {
            // Finalisiere die Nachricht mit vollständigem Inhalt und UI-Messages
            const finalContent = data.content || fullContent
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      text: finalContent,
                      uiMessages: data.uiMessages,
                    }
                  : msg
              )
              saveMessages(threadId, updated)
              return updated
            })

            // Preview-Update an Sidebar
            if (typeof window !== 'undefined') {
              const title = makeTitle(trimmed)
              window.dispatchEvent(
                new CustomEvent('aklow-thread-preview', {
                  detail: {
                    threadId,
                    title,
                    preview: finalContent.slice(0, 120) || trimmed,
                    lastMessageAt: Date.now(),
                  },
                })
              )
            }
            setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })))
            setThinkingNote(null)
            setIsSending(false)
          },
          onError: (error) => {
            const errorText = error.message || 'Unbekannter Fehler im Chat'
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      text: 'Fehler beim Senden: ' + errorText,
                    }
                  : msg
              )
              saveMessages(threadId, updated)
              return updated
            })
            setThinkingSteps([])
            setThinkingNote('Fehler beim Streamen')
            setIsSending(false)
          },
        }
      )
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Unbekannter Fehler im Chat'
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                text: 'Fehler beim Senden: ' + errorText,
              }
            : msg
        )
        saveMessages(threadId, updated)
        return updated
      })
      setThinkingSteps([])
      setThinkingNote('Fehler beim Streamen')
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-transparent bg-white/15 backdrop-blur-2xl px-4 pt-4 pb-2">

      <div className="flex-1 overflow-y-auto space-y-6 px-[5%] py-2 pb-28">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="font-bold text-[var(--ak-color-text-primary)]" style={{ fontSize: '40px' }}>
              Was kann ich für dich tun?
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
      </div>

      {(thinkingSteps.length > 0 || thinkingNote) && (
        <div className="px-[5%] -mb-1 text-[11px] text-[var(--ak-color-text-muted)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[10px] uppercase tracking-wide">Denke nach …</span>
            {thinkingSteps.map((step) => {
              const state =
                step.status === "done" ? "✓" :
                step.status === "active" ? "…" : "•"
              return (
                <span key={step.id} className="inline-flex items-center gap-1">
                  <span className="text-[10px]">{state}</span>
                  <span>{step.label}</span>
                </span>
              )
            })}
            {thinkingNote ? <span>{thinkingNote}</span> : null}
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="px-[5%]">
        <div 
          className="relative flex items-center gap-2 rounded-full border border-gray-300/70 bg-white/70 px-4 py-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-200 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.28)]"
          style={{ borderWidth: '1px', transform: 'translateY(0)' }}
        >
          {quickHint ? (
            <div className="absolute left-2 -top-1 translate-y-[-70%] text-[10px] font-semibold text-green-600 flex items-center gap-1">
              <span>{quickHint}</span>
              <button
                type="button"
                onClick={() => setQuickHint('')}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-green-600 hover:bg-green-50"
                aria-label="Hinweis schließen"
              >
                ×
              </button>
            </div>
          ) : null}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-150"
              aria-label="Menü öffnen"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {isPlusMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setIsPlusMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 z-[9999] mb-2 w-64 origin-bottom-left rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        fileInputRef.current?.click()
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Datei oder Foto hochladen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        setQuickHint('Intensive Internetsuche aktiviert')
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Intensive Internetsuche
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        // TODO: Bild generieren
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Bild generieren
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        // TODO: Lernmodus
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
            placeholder="Stelle irgendeine Frage"
            ref={inputRef}
            className="flex-1 border-none bg-transparent text-[15px] text-gray-900 placeholder:text-gray-500 focus-visible:outline-none"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              isLongPressRef.current = false
              longPressTimerRef.current = setTimeout(() => {
                isLongPressRef.current = true
                // Real-time Audio starten
                if (realtimeStatus === 'idle' || realtimeStatus === 'error') {
                  toggleRealtime()
                }
              }, 3000) // 3 Sekunden
            }}
            onMouseUp={(e) => {
              e.preventDefault()
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
              }
              
              if (!isLongPressRef.current) {
                // Kurzer Klick: Recording toggle
                if (realtimeStatus === 'live') {
                  // Wenn Real-time läuft, stoppe es
                  toggleRealtime()
                } else if (dictationStatus === 'recording') {
                  stopRecording()
                } else if (dictationStatus === 'idle' || dictationStatus === 'error') {
                  startRecording()
                }
              }
              isLongPressRef.current = false
            }}
            onMouseLeave={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              isLongPressRef.current = false
              longPressTimerRef.current = setTimeout(() => {
                isLongPressRef.current = true
                // Real-time Audio starten
                if (realtimeStatus === 'idle' || realtimeStatus === 'error') {
                  toggleRealtime()
                }
              }, 3000) // 3 Sekunden
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
              }
              
              if (!isLongPressRef.current) {
                // Kurzer Klick: Recording toggle
                if (realtimeStatus === 'live') {
                  // Wenn Real-time läuft, stoppe es
                  toggleRealtime()
                } else if (dictationStatus === 'recording') {
                  stopRecording()
                } else if (dictationStatus === 'idle' || dictationStatus === 'error') {
                  startRecording()
                }
              }
              isLongPressRef.current = false
            }}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[0px]",
              isMicrophoneActive && "ring-2 ring-red-500 ring-offset-2"
            )}
            aria-label="Mikrofon"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
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
              "inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[0px]",
              input.trim()
                ? "bg-green-500 border-black border-opacity-20"
                : "bg-white border-black border-opacity-30",
              "hover:opacity-90 disabled:opacity-60"
            )}
            style={{ borderWidth: '1px' }}
            aria-label="Senden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={clsx(
                "h-4 w-4",
                input.trim() ? "text-white" : "text-black"
              )}
            >
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
            const file = e.target.files?.[0]
            if (file) {
              setInput((prev) => prev ? `${prev} [Upload: ${file.name}]` : `[Upload: ${file.name}]`)
            }
            e.target.value = ''
          }}
        />
      </form>
    </div>
  )
}
