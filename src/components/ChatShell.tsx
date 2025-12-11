"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendChatMessage, ChatResponse } from "../lib/chatClient";
import { useDictation } from "../hooks/useDictation";
import { useRealtimeVoice } from "../hooks/useRealtimeVoice";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  uiMessages?: ChatResponse["uiMessages"];
};

function createSessionId(): string {
  return "web-session-" + Math.random().toString(36).slice(2);
}

export function ChatShell() {
  const [sessionId] = useState<string>(() => createSessionId())
  const [tenantId] = useState<string>('demo-tenant')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false)
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)

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

    const userMessage: ChatMessage = {
      id: String(Date.now()) + '-user',
      role: 'user',
      text: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    try {
      const res = await sendChatMessage({
        tenantId,
        sessionId,
        channel: 'web_chat',
        message: trimmed,
      })

      const assistantMessage: ChatMessage = {
        id: String(Date.now()) + '-assistant',
        role: 'assistant',
        text: res.content,
        uiMessages: res.uiMessages,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Unbekannter Fehler im Chat'
      const errorMessage: ChatMessage = {
        id: String(Date.now()) + '-error',
        role: 'assistant',
        text: 'Fehler beim Senden: ' + errorText,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/90 p-4 shadow-[var(--ak-shadow-soft)] backdrop-blur-md">
      <div className="flex-1 overflow-y-auto space-y-6 px-[5%] py-2">
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

      <form onSubmit={handleSend} className="px-[5%]">
        <div 
          className="relative flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors duration-150"
          style={{ borderWidth: '1px' }}
        >
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
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPlusMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 z-50 mb-2 w-64 origin-bottom-left rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        // TODO: Datei oder Foto hochladen
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Datei oder Foto hochladen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        // TODO: Intensive Internetsuche
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
              "inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-150",
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
              "inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-150",
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
      </form>
    </div>
  )
}
