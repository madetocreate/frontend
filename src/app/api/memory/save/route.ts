import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest } from "@/lib/server/tenant";

// Fallback: Wenn AGENT_BACKEND_URL nicht gesetzt ist, verwende Standard
const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || "http://127.0.0.1:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Security: Tenant-ID comes from auth context, not request body
  // User-level access (kein requireAdminSession mehr)
  const tenantId = getTenantIdFromRequest(req);
  if (!tenantId) {
    return NextResponse.json(
      { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
      { status: 401 }
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

  // Extract other fields from body (tenantId is ignored, comes from auth)
  const { threadId, role, content, timestamp, kind, tags, summarize } = body as Record<string, unknown>;

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

  // Nutze memory_compat/save (Summarizer-Pipeline) statt /memory/write
  const payload = {
    tenant_id: tenantId,
    thread_id: threadId,
    role: role,
    content: content,
    timestamp: timestamp,
    kind: typeof kind === "string" ? kind : "conversation_message", // MemoryItemType
    tags: Array.isArray(tags) ? tags : undefined,
    summarize: typeof summarize === "boolean" ? summarize : true,
  };

  const targetUrl = `${normalizeBaseUrl(AGENT_BACKEND_URL)}/memory_compat/save`;

  // PHASE A: Service-to-service headers (NO User-Auth forwarding)
  // Set explicit service headers for Python backend
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Primary: x-internal-api-key (canonical)
  if (INTERNAL_API_KEY) {
    headers["x-internal-api-key"] = INTERNAL_API_KEY;
  }
  
  // Optional legacy fallback: MEMORY_API_SECRET (only if INTERNAL_API_KEY not set)
  const memoryApiSecret = process.env.MEMORY_API_SECRET;
  if (!INTERNAL_API_KEY && memoryApiSecret) {
    headers["Authorization"] = `Bearer ${memoryApiSecret}`;
  }
  
  // CRITICAL: Never forward User-Auth headers (req.headers.get("authorization"))
  // This is service-to-service communication, not user-to-service

  try {
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

    if (!response.ok) {
      console.error("Memory save API error:", {
        status: response.status,
        statusText: response.statusText,
        url: targetUrl,
        payload,
        result
      });
      return NextResponse.json(
        { 
          error: `Memory save failed: ${response.status} ${response.statusText}`,
          details: result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result ?? {}, { status: response.status });
  } catch (error) {
    console.error("Memory save fetch error:", error);
    return NextResponse.json(
      { 
        error: "Failed to call memory save API",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
