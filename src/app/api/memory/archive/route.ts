import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest } from "@/lib/server/tenant";

// Fallback: Wenn AGENT_BACKEND_URL nicht gesetzt ist, verwende Standard
const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || "http://127.0.0.1:8000";

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Security: Tenant-ID comes from auth context, not request body
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

  // Extract memoryId from body (tenantId is ignored, comes from auth)
  const { memoryId } = body as Record<string, unknown>;

  if (typeof memoryId !== "string" || !memoryId) {
    return NextResponse.json({ error: "Missing or invalid memoryId" }, { status: 400 });
  }

  const payload = {
    tenant_id: tenantId,
    memory_id: memoryId,
  };

  const targetUrl = `${normalizeBaseUrl(AGENT_BACKEND_URL)}/memory/archive`;
  
  // PHASE A: Service-to-service headers (NO User-Auth forwarding)
  // Set explicit service headers for Python backend
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Primary: x-internal-api-key (canonical)
  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (internalApiKey) {
    headers["x-internal-api-key"] = internalApiKey;
  }
  
  // Optional legacy fallback: MEMORY_API_SECRET (only if INTERNAL_API_KEY not set)
  const memoryApiSecret = process.env.MEMORY_API_SECRET;
  if (!internalApiKey && memoryApiSecret) {
    headers["Authorization"] = `Bearer ${memoryApiSecret}`;
  }
  
  // CRITICAL: Never forward User-Auth headers (req.headers.get("authorization"))
  // This is service-to-service communication, not user-to-service

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

