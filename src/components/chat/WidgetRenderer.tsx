"use client";

import type { UIContext, UIMessage } from "../../lib/chatClient";
import { WidgetCard } from "../ui/WidgetCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type WidgetRendererProps = {
  message: UIMessage;
};

export function WidgetRenderer({ message }: WidgetRendererProps) {
  const typedMessage = message as UIMessage & { uiContext?: UIContext };
  const uiContext = typedMessage.uiContext;

  if (
    typedMessage.type === "text" &&
    typeof (typedMessage as { markdown?: string }).markdown === "string"
  ) {
    const markdown = (typedMessage as { markdown: string }).markdown;
    return (
      <div className="widget widget-text prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
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
            {typeof typedMessage.content === "string" &&
            typedMessage.content.trim().length > 0 ? (
              <p className="whitespace-pre-wrap">{typedMessage.content}</p>
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
                {uiContext.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="rounded-md border px-3 py-1 text-xs"
                  >
                    {action.label}
                  </button>
                ))}
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
