const FAST_ACTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_FAST_ACTIONS_URL ??
  process.env.NEXT_PUBLIC_CHAT_API_URL ??
  process.env.NEXT_PUBLIC_AGENT_BACKEND_URL ??
  (process.env.NEXT_PUBLIC_BACKEND_URL?.includes("8000") ? process.env.NEXT_PUBLIC_BACKEND_URL : "http://127.0.0.1:8000");

const FAST_ACTIONS_URL = `${FAST_ACTIONS_BASE_URL}/api/fast-actions`;

export type FastActionSuggestion = {
  id: string;
  label: string;
  handler: string;
  payload?: Record<string, unknown>;
  risk?: Record<string, unknown>;
  confidence?: number;
  why_this?: string;
};

export type FastActionsResponse = {
  suggestions: FastActionSuggestion[];
  meta: {
    surface: string;
    max_actions: number;
    signals: string[];
    generated_at: string;
  };
};

export type FastActionsRequest = {
  surface?: string;
  channel?: string;
  thread_id?: string;
  message_id?: string;
  language?: string;
  last_user_message?: string;
  last_assistant_message?: string;
  conversation_summary?: string;
  max_actions?: number;
  allowed_action_ids?: string[];
};

export async function fetchFastActions(payload: FastActionsRequest): Promise<FastActionsResponse> {
  const response = await fetch(FAST_ACTIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`fast-actions ${response.status} ${text}`);
  }

  return (await response.json()) as FastActionsResponse;
}
