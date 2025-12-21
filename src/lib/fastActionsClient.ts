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

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) return token;
  }
  return process.env.NEXT_PUBLIC_AUTH_TOKEN || null;
}

export async function fetchFastActions(payload: FastActionsRequest): Promise<FastActionsResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(FAST_ACTIONS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  // If 404, try without /api prefix (fallback for different server configs)
  if (response.status === 404 && FAST_ACTIONS_URL.includes("/api/fast-actions")) {
    const fallbackUrl = FAST_ACTIONS_URL.replace("/api/fast-actions", "/fast-actions");
    response = await fetch(fallbackUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    // Don't throw error for 404 - just return empty suggestions
    if (response.status === 404) {
      console.warn(`Fast Actions endpoint not available (404): ${FAST_ACTIONS_URL}`);
      return {
        suggestions: [],
        meta: {
          surface: payload.surface || "unknown",
          max_actions: payload.max_actions || 5,
          signals: [],
          generated_at: new Date().toISOString(),
        },
      };
    }
    throw new Error(`fast-actions ${response.status} ${text}`);
  }

  return (await response.json()) as FastActionsResponse;
}
