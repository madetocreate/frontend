"use client";

import type { UIContext, UIMessage } from "../../lib/chatClient";
import { WidgetCard } from "../ui/WidgetCard";
import { ChatMarkdown } from "./markdown/ChatMarkdown";
import { emitQuickAction } from "@/lib/quickActionsBus";

type WidgetRendererProps = {
  message: UIMessage;
};

type MaybePayload = {
  markdown?: unknown;
  content?: unknown;
  text?: unknown;
  uiContext?: unknown;
};

function pickMarkdown(message: UIMessage): string | null {
  const m = message as unknown as MaybePayload;
  if (typeof m.markdown === "string" && m.markdown.trim().length > 0) return m.markdown;
  if (typeof m.content === "string" && m.content.trim().length > 0) return m.content;
  if (typeof m.text === "string" && m.text.trim().length > 0) return m.text;
  return null;
}

export function WidgetRenderer({ message }: WidgetRendererProps) {
  const uiContext = (message as unknown as { uiContext?: UIContext }).uiContext;
  const markdown = pickMarkdown(message);

  if (!uiContext && markdown) {
    return (
      <div className="widget widget-text max-w-none">
        <ChatMarkdown content={markdown} />
      </div>
    );
  }

  if (uiContext) {
    const mode = uiContext.mode;
    const title = uiContext.title ?? "";
    const description = uiContext.description ?? "";

    if (mode === "wizard" || mode === "card" || mode === "minimal_text") {
      return (
        <WidgetCard
          title={title || "Assistant"}
          subtitle={description || undefined}
          padding="md"
          shadow
        >
          <div className="space-y-2 text-sm">
            {markdown ? (
              <div className="max-w-none">
                <ChatMarkdown content={markdown} />
              </div>
            ) : null}

            {Array.isArray(uiContext.fields) && uiContext.fields.length > 0 ? (
              <div className="mt-2 space-y-1 text-xs">
                {uiContext.fields.map((field) => (
                  <div key={field.id}>
                    <strong>{field.label}</strong>
                    {field.placeholder ? ` – ${field.placeholder}` : null}
                  </div>
                ))}
              </div>
            ) : null}

            {Array.isArray(uiContext.actions) && uiContext.actions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {uiContext.actions.map((action) => {
                  const handleClick = () => {
                    // P0 Fix: Action Buttons klickbar machen
                    if (action.href) {
                      // Externe Links: öffne in neuem Tab
                      window.open(action.href, '_blank', 'noopener,noreferrer')
                    } else {
                      // Interne Actions: über QuickAction-System
                      const actionId = action.onClick || action.id
                      const source = 'chat' // uiContext hat kein module field
                      
                      try {
                        emitQuickAction({
                          id: actionId,
                          source,
                        })
                      } catch (error) {
                        console.warn(`Failed to emit quick action ${actionId}:`, error)
                        // Fail-closed: zeige Toast oder console.warn, aber keine Crash
                      }
                    }
                  }
                  
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={handleClick}
                      className="rounded-md border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1 text-xs text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-hover)]"
                    >
                      {action.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        </WidgetCard>
      );
    }
  }

  return (
    <div className="widget widget-unknown">
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
        {JSON.stringify(message, null, 2)}
      </pre>
    </div>
  );
}
