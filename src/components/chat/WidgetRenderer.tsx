"use client";

import type { UIMessage } from "../../lib/chatClient";

type WidgetRendererProps = {
  message: UIMessage;
};

export function WidgetRenderer({ message }: WidgetRendererProps) {
  if (message.type === "text") {
    return (
      <div className="widget widget-text">
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          {message.markdown}
        </pre>
      </div>
    );
  }

  return (
    <div className="widget widget-unknown">
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
        {JSON.stringify(message, null, 2)}
      </pre>
    </div>
  );
}
