import { NextRequest, NextResponse } from "next/server";

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL;

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!AGENT_BACKEND_URL) {
    return NextResponse.json(
      { error: "AGENT_BACKEND_URL is not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { threadId, role, content, timestamp, tenantId } = body as Record<string, unknown>;

  if (typeof threadId !== "string" || !threadId) {
    return NextResponse.json({ error: "Missing or invalid threadId" }, { status: 400 });
  }
  if (typeof role !== "string" || !role) {
    return NextResponse.json({ error: "Missing or invalid role" }, { status: 400 });
  }
  if (typeof content !== "string" || !content) {
    return NextResponse.json({ error: "Missing or invalid content" }, { status: 400 });
  }
  if (typeof timestamp !== "string" || !timestamp) {
    return NextResponse.json({ error: "Missing or invalid timestamp" }, { status: 400 });
  }

  if (typeof tenantId !== "string" || !tenantId) {
    return NextResponse.json({ error: "Missing or invalid tenantId" }, { status: 400 });
  }

  // Konvertiere ChatKit-Format zu Memory-API-Format
  const memoryType = role === "user" ? "conversation_message" : "conversation_summary";
  
  const payload = {
    tenant_id: tenantId,
    type: memoryType,
    content: content,
    metadata: {
      thread_id: threadId,
      role: role,
      timestamp: timestamp,
    },
    conversation_id: threadId,
    message_id: threadId, // Kann später spezifischer sein
  };

  const targetUrl = `${normalizeBaseUrl(AGENT_BACKEND_URL)}/memory/write`;
  const memoryApiSecret = process.env.MEMORY_API_SECRET;

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (memoryApiSecret) {
    headers["Authorization"] = `Bearer ${memoryApiSecret}`;
  }

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let result: unknown = null;

  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }
  }

  return NextResponse.json(result ?? {}, { status: response.status });
}
