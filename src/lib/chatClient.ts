const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const CHAT_STREAM_URL =
  process.env.NEXT_PUBLIC_CHAT_STREAM_URL ?? `${API_BASE_URL}/chat/stream`;
const CHAT_HTTP_URL =
  process.env.NEXT_PUBLIC_CHAT_HTTP_URL ?? `${API_BASE_URL}/chat`;

export type ChatRequestBody = {
  tenantId: string;
  sessionId: string;
  channel: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type QuickAction = {
  id: string;
  label: string;
};

export interface BaseMessage {
  quickActions?: QuickAction[];
}

export interface TextMessage extends BaseMessage {
  type: "text";
  markdown: string;
}

export type UIMessage = TextMessage;

export type OrchestratorStep = {
  id: string;
  label: string;
  status: string;
  details?: string;
};

export type ChatResponse = {
  tenantId: string;
  sessionId: string;
  channel: string;
  content: string;
  steps?: OrchestratorStep[];
  uiMessages?: UIMessage[];
};

export type ChatStreamCallbacks = {
  onStart?: (data: { steps: OrchestratorStep[] }) => void;
  onChunk?: (data: { content: string }) => void;
  onStepUpdate?: (data: { stepId: string; status: string }) => void;
  onEnd?: (data: { content: string; steps?: OrchestratorStep[]; uiMessages?: UIMessage[] }) => void;
  onError?: (error: { message: string }) => void;
};

export async function sendChatMessageStream(
  params: {
    tenantId: string;
    sessionId: string;
    channel?: string;
    message: string;
    metadata?: Record<string, unknown>;
  },
  callbacks: ChatStreamCallbacks
): Promise<void> {
  const body: ChatRequestBody = {
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    channel: params.channel ?? "web_chat",
    message: params.message,
    metadata: params.metadata
  };

  try {
    const response = await fetch(CHAT_STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Chat stream request failed: ${response.status} ${response.statusText} ${text}`
      );
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let currentEvent = "";
      let currentData = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData = line.slice(5).trim();
        } else if (line === "" && currentEvent && currentData) {
          try {
            const data = JSON.parse(currentData);
            switch (currentEvent) {
              case "start":
                callbacks.onStart?.(data);
                break;
              case "chunk":
                callbacks.onChunk?.(data);
                break;
              case "step_update":
                callbacks.onStepUpdate?.(data);
                break;
              case "end":
                callbacks.onEnd?.(data);
                break;
              case "error":
                callbacks.onError?.(data);
                break;
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e, currentData);
          }
          currentEvent = "";
          currentData = "";
        }
      }
    }

    // Process remaining buffer
    if (buffer) {
      const lines = buffer.split("\n");
      let currentEvent = "";
      let currentData = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData = line.slice(5).trim();
        } else if (line === "" && currentEvent && currentData) {
          try {
            const data = JSON.parse(currentData);
            switch (currentEvent) {
              case "start":
                callbacks.onStart?.(data);
                break;
              case "chunk":
                callbacks.onChunk?.(data);
                break;
              case "step_update":
                callbacks.onStepUpdate?.(data);
                break;
              case "end":
                callbacks.onEnd?.(data);
                break;
              case "error":
                callbacks.onError?.(data);
                break;
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e, currentData);
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError?.({
      message: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  }
}

export async function sendChatMessage(params: {
  tenantId: string;
  sessionId: string;
  channel?: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<ChatResponse> {
  const body: ChatRequestBody = {
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    channel: params.channel ?? "web_chat",
    message: params.message,
    metadata: params.metadata
  };

  const response = await fetch(CHAT_HTTP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    let text = "";
    try {
      text = await response.text();
    } catch {
    }
    throw new Error(
      "Chat request failed: " +
        response.status +
        " " +
        response.statusText +
        " " +
        text
    );
  }

  const data = (await response.json()) as ChatResponse;
  return data;
}
