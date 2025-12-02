'use client'

import { useState, FormEvent } from 'react'
import { AppShell } from '@/components/AppShell'

type MessageRole = 'user' | 'assistant'

type Message = {
  id: number
  role: MessageRole
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text) return
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-app">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-muted">
              Schreib deine erste Nachricht, um den Chat zu starten.
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xl rounded-2xl px-4 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-soft text-foreground'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-soft bg-app px-4 py-3"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Frage stellen …"
            className="flex-1 rounded-xl border border-soft bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            disabled={!input.trim()}
          >
            Senden
          </button>
        </form>
      </div>
    </AppShell>
  )
}
