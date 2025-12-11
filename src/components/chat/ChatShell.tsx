"use client";

import React, { useState, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { sendChatMessage, UIMessage } from "../../lib/chatClient";
import { WidgetRenderer } from "./WidgetRenderer";
import { MicrophoneButton } from "../MicrophoneButton";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  uiMessages?: UIMessage[];
};

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) {
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      text: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage({
        tenantId: 'demo-tenant',
        sessionId: 'demo-session',
        channel: 'web_chat',
        message: trimmed,
      })

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        text: res.content,
        uiMessages: res.uiMessages,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : 'Unbekannter Fehler beim Aufruf des Backends'

      const errorMessage: ChatMessage = {
        role: 'assistant',
        text: 'Fehler beim Backend-Aufruf: ' + errorText,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-shell flex max-h-[100vh] flex-col gap-3 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/90 p-3 shadow-[var(--ak-shadow-soft)] backdrop-blur-md">
      <div className="chat-messages flex-1 space-y-4 overflow-y-auto rounded-xl bg-[var(--ak-color-bg-surface-muted)]/70 px-3 py-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={clsx(
              'chat-message flex max-w-[82%] flex-col gap-1',
              m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
            )}
          >
            <div
              className={clsx(
                'chat-message-text rounded-2xl px-3 py-2 text-[14px] leading-relaxed shadow-sm transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                m.role === 'user'
                  ? 'bg-[var(--ak-color-accent)] text-white shadow-[0_12px_36px_-18px_var(--ak-color-accent)]'
                  : 'bg-[var(--ak-color-chat-assistant-bg)] text-[var(--ak-color-text-primary)] border border-[var(--ak-color-border-subtle)]'
              )}
            >
              <ReactMarkdown
                className="prose prose-invert prose-sm max-w-none"
                remarkPlugins={[remarkGfm]}
              >
                {m.text}
              </ReactMarkdown>
            </div>

            {m.uiMessages && m.uiMessages.length > 0 ? (
              <div className="chat-message-widgets w-full space-y-1.5 text-[11px] text-[var(--ak-color-text-muted)]">
                {m.uiMessages.map((ui, uiIdx) => (
                  <WidgetRenderer key={uiIdx} message={ui} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="chat-input-row flex items-center gap-2 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Schreib mir etwas..."
          className="flex-1 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/80 px-3 py-2 text-[14px] text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] placeholder:text-[var(--ak-color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
        />
        <MicrophoneButton disabled={loading} />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className={clsx(
            'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/30 focus-visible:ring-offset-1',
            loading
              ? 'bg-[var(--ak-color-text-muted)] text-white opacity-80'
              : 'bg-[var(--ak-color-accent)] text-white shadow-[0_12px_32px_-16px_var(--ak-color-accent)] hover:shadow-[0_14px_40px_-16px_var(--ak-color-accent)]'
          )}
        >
          {loading ? '...' : 'Senden'}
        </button>
      </div>
    </div>
  )
}
