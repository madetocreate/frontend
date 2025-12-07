"use client";

import { useState, FormEvent } from "react";
import { sendChatMessage, ChatResponse } from "../lib/chatClient";

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
  const [sessionId] = useState<string>(() => createSessionId());
  const [tenantId] = useState<string>("demo-tenant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()) + "-user",
      role: "user",
      text: trimmed
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await sendChatMessage({
        tenantId,
        sessionId,
        channel: "web_chat",
        message: trimmed
      });

      const assistantMessage: ChatMessage = {
        id: String(Date.now()) + "-assistant",
        role: "assistant",
        text: res.content,
        uiMessages: res.uiMessages
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : "Unbekannter Fehler im Chat";
      const errorMessage: ChatMessage = {
        id: String(Date.now()) + "-error",
        role: "assistant",
        text: "Fehler beim Senden: " + errorText
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1rem",
          border: "1px solid var(--ak-color-border-subtle)",
          borderRadius: "0.5rem",
          marginBottom: "0.5rem"
        }}
      >
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              marginBottom: "0.75rem",
              textAlign: message.role === "user" ? "right" : "left"
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.75rem",
                backgroundColor:
                  message.role === "user" ? "var(--ak-color-chat-user-bg)" : "var(--ak-color-chat-assistant-bg)"
              }}
            >
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                {message.role === "user" ? "Du" : "Assistant"}
              </div>
              <div>{message.text}</div>
            </div>
            {message.uiMessages && message.uiMessages.length > 0 && (
              <pre
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  whiteSpace: "pre-wrap"
                }}
              >
                {JSON.stringify(message.uiMessages, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nachricht eingeben..."
          style={{ flex: 1, padding: "0.5rem 0.75rem" }}
        />
        <button type="submit" disabled={isSending || !input.trim()}>
          {isSending ? "Senden..." : "Senden"}
        </button>
      </form>
    </div>
  );
}
