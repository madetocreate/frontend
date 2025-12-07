const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

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

  const response = await fetch(API_BASE_URL + "/chat", {
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
