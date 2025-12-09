"use client";

import { useState, FormEvent } from "react";
import clsx from "clsx";
import { sendChatMessage, ChatResponse } from "../lib/chatClient";
import { MicrophoneButton } from "./MicrophoneButton";

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
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/90 p-3 shadow-[var(--ak-shadow-soft)] backdrop-blur-md">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl bg-[var(--ak-color-bg-surface-muted)]/80 px-3 py-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              'flex flex-col gap-1',
              message.role === 'user' ? 'items-end text-right' : 'items-start text-left'
            )}
          >
            <div
              className="inline-block max-w-[82%] rounded-2xl px-3 py-2 text-left shadow-sm transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]"
              style={{
                backgroundColor:
                  message.role === 'user'
                    ? 'var(--ak-color-chat-user-bg)'
                    : 'var(--ak-color-chat-assistant-bg)',
              }}
            >
              <div className="text-[11px] font-medium text-[var(--ak-color-text-muted)]">
                {message.role === 'user' ? 'Du' : 'Assistant'}
              </div>
              <div className="text-[13px] text-[var(--ak-color-text-primary)]">{message.text}</div>
            </div>
            {message.uiMessages && message.uiMessages.length > 0 ? (
              <pre className="whitespace-pre-wrap text-[11px] text-[var(--ak-color-text-muted)]">
                {JSON.stringify(message.uiMessages, null, 2)}
              </pre>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nachricht eingeben..."
          className="flex-1 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/80 px-3 py-2 text-[13px] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
        />
        <MicrophoneButton disabled={isSending} />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="inline-flex items-center justify-center rounded-full bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_32px_-16px_var(--ak-color-accent)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:shadow-[0_14px_40px_-16px_var(--ak-color-accent)] disabled:opacity-70 disabled:shadow-none"
        >
          {isSending ? 'Senden...' : 'Senden'}
        </button>
      </form>
    </div>
  )
}
