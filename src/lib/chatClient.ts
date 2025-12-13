// Chat API should point to the FastAPI backend (port 8000), not the Orchestrator (port 4000)
// Priority: NEXT_PUBLIC_CHAT_API_URL > NEXT_PUBLIC_AGENT_BACKEND_URL > NEXT_PUBLIC_BACKEND_URL (if port 8000) > default
// Note: AGENT_BACKEND_URL is server-side only, so we need NEXT_PUBLIC_ version for client-side
const CHAT_API_BASE_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL ??
  process.env.NEXT_PUBLIC_AGENT_BACKEND_URL ??
  (process.env.NEXT_PUBLIC_BACKEND_URL?.includes("8000") ? process.env.NEXT_PUBLIC_BACKEND_URL : "http://127.0.0.1:8000");
const CHAT_STREAM_URL =
  process.env.NEXT_PUBLIC_CHAT_STREAM_URL ?? `${CHAT_API_BASE_URL}/chat/stream`;
const CHAT_HTTP_URL =
  process.env.NEXT_PUBLIC_CHAT_HTTP_URL ?? `${CHAT_API_BASE_URL}/chat`;

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

export type UIMode =
  | "chat"
  | "form"
  | "list"
  | "card"
  | "table"
  | "custom"
  | "minimal_text"
  | "wizard"
  | "flow_graph";

export interface UIField {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  value?: string;
}

export interface UIItem {
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UIAction {
  id: string;
  label: string;
  type: "button" | "submit" | "link";
  onClick?: string;
  href?: string;
}

export interface UIContext {
  mode: UIMode;
  intent?: string;
  styleProfile?: string;
  userPreferences?: {
    language?: string;
    [key: string]: unknown;
  };
  title?: string;
  description?: string;
  fields?: UIField[];
  items?: UIItem[];
  actions?: UIAction[];
  metadata?: Record<string, unknown>;
}

export type UIMessage =
  | {
      role: "user" | "assistant" | "system";
      content: string;
      uiContext?: UIContext;
      metadata?: Record<string, unknown>;
    }
  | TextMessage;

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
  message: string,
  callbacks: ChatStreamCallbacks,
  options?: {
    tenantId?: string
    sessionId?: string
    channel?: string
  },
): Promise<void> {
  const tenantId = options?.tenantId ?? 'demo'
  const sessionId = options?.sessionId ?? 'default'
  const channel = options?.channel ?? 'default'

  const response = await fetch(CHAT_STREAM_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      tenantId,
      sessionId,
      channel,
      message,
    }),
  })

  if (!response.ok) {
    let details = ''
    try {
      details = await response.text()
    } catch {
      details = ''
    }
    throw new Error(`Chat stream request failed (${response.status}): ${details}`)
  }

  if (!response.body) {
    throw new Error('No response body for chat stream')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  let currentEvent = ''
  let currentData = ''

  const dispatch = (eventName: string, dataText: string) => {
    if (!dataText) return

    let data: Record<string, unknown> | string = dataText
    try {
      const parsed = JSON.parse(dataText)
      if (parsed && typeof parsed === 'object') {
        data = parsed as Record<string, unknown>
      } else {
        data = { content: dataText }
      }
    } catch {
      data = { content: dataText }
    }

    const effectiveEvent =
      (eventName && eventName !== 'message')
        ? eventName
        : (typeof data === 'object' && data !== null && typeof (data as Record<string, unknown>).event === 'string'
            ? (data as Record<string, unknown>).event as string
            : '')

    if (!effectiveEvent) return

    switch (effectiveEvent) {
      case 'start':
        callbacks.onStart?.(data as { steps: OrchestratorStep[] })
        return
      case 'step_update':
        callbacks.onStepUpdate?.(data as { stepId: string; status: string })
        return
      case 'chunk':
        callbacks.onChunk?.(data as { content: string })
        return
      case 'end':
        callbacks.onEnd?.(data as { content: string; steps?: OrchestratorStep[]; uiMessages?: UIMessage[] })
        return
      case 'error':
        callbacks.onError?.(data as { message: string })
        return
      default:
        return
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
          continue
        }

        if (line.startsWith('data:')) {
          const raw = line.slice(5)
          const payload = raw.startsWith(' ') ? raw.slice(1) : raw
          currentData = currentData ? `${currentData}\n${payload}` : payload
          continue
        }

        if (line.trim() === '' && currentData) {
          dispatch(currentEvent, currentData)
          currentEvent = ''
          currentData = ''
        }
      }
    }

    if (buffer) {
      const tailLines = buffer.split(/\r?\n/)
      for (const line of tailLines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
          continue
        }

        if (line.startsWith('data:')) {
          const raw = line.slice(5)
          const payload = raw.startsWith(' ') ? raw.slice(1) : raw
          currentData = currentData ? `${currentData}\n${payload}` : payload
          continue
        }

        if (line.trim() === '' && currentData) {
          dispatch(currentEvent, currentData)
          currentEvent = ''
          currentData = ''
        }
      }
    }

    if (currentData) {
      dispatch(currentEvent, currentData)
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // Ignore errors when releasing lock
    }
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
    throw new Error("Chat request failed: " + response.status + " " + response.statusText + " " + text);
  }

  const data = (await response.json()) as ChatResponse;
  return data;
}
