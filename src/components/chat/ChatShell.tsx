"use client";

import React, { useState, KeyboardEvent } from "react";
import { sendChatMessage, UIMessage } from "../../lib/chatClient";
import { WidgetRenderer } from "./WidgetRenderer";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  uiMessages?: UIMessage[];
};

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      text: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage({
        tenantId: "demo-tenant",
        sessionId: "demo-session",
        channel: "web_chat",
        message: trimmed
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        text: res.content,
        uiMessages: res.uiMessages
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorText =
        err instanceof Error
          ? err.message
          : "Unbekannter Fehler beim Aufruf des Backends";

      const errorMessage: ChatMessage = {
        role: "assistant",
        text: "Fehler beim Backend-Aufruf: " + errorText
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-shell" style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100vh" }}>
      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={"chat-message chat-message-" + m.role}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%"
            }}
          >
            <div
              className="chat-message-text"
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.75rem",
                backgroundColor:
                  m.role === "user" ? "var(--ak-color-accent)" : "var(--ak-color-chat-assistant-bg)",
                color: m.role === "user" ? "#ffffff" : "var(--ak-color-text-primary)",
                marginBottom:
                  m.uiMessages && m.uiMessages.length > 0 ? "0.25rem" : 0
              }}
            >
              {m.text}
            </div>

            {m.uiMessages && m.uiMessages.length > 0 && (
              <div
                className="chat-message-widgets"
                style={{ marginTop: "0.25rem" }}
              >
                {m.uiMessages.map((ui, uiIdx) => (
                  <WidgetRenderer key={uiIdx} message={ui} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="chat-input-row"
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem",
          borderTop: "1px solid var(--ak-color-chat-assistant-bg)"
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Schreib mir etwas..."
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: "999px",
            border: "1px solid var(--ak-color-border-subtle)",
            outline: "none"
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: loading ? "#9ca3af" : "var(--ak-color-accent)",
            color: "#ffffff",
            cursor: loading ? "default" : "pointer"
          }}
        >
          {loading ? "..." : "Senden"}
        </button>
      </div>
    </div>
  );
}
