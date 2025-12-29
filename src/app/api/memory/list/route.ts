import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest } from "@/lib/server/tenant";

// Fallback: Wenn AGENT_BACKEND_URL nicht gesetzt ist, verwende Standard
const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || "http://127.0.0.1:8000";
const MEMORY_API_SECRET = process.env.MEMORY_API_SECRET;

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Security: Tenant-ID comes from auth context, not request body
  const tenantId = getTenantIdFromRequest(req);
  if (!tenantId) {
    return NextResponse.json(
      { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "active";
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const memoryKind = searchParams.get("memory_kind");
  const sourceType = searchParams.get("source_type");

  const targetUrl = `${normalizeBaseUrl(AGENT_BACKEND_URL)}/memory/list`;
  const url = new URL(targetUrl);
  url.searchParams.set("tenant_id", tenantId);
  url.searchParams.set("status", status);
  url.searchParams.set("sort", sort);
  url.searchParams.set("order", order);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("offset", offset.toString());
  if (memoryKind) {
    url.searchParams.set("memory_kind", memoryKind);
  }
  if (sourceType) {
    url.searchParams.set("source_type", sourceType);
  }

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
  if (!internalApiKey && MEMORY_API_SECRET) {
    headers["Authorization"] = `Bearer ${MEMORY_API_SECRET}`;
  }
  
  // CRITICAL: Never forward User-Auth headers (req.headers.get("authorization"))
  // This is service-to-service communication, not user-to-service

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
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
      console.error("Memory list API error:", {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        result
      });
      return NextResponse.json(
        { 
          error: `Memory list failed: ${response.status} ${response.statusText}`,
          details: result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result ?? {}, { status: response.status });
  } catch (error) {
    console.error("Memory list fetch error:", error);
    return NextResponse.json(
      { 
        error: "Failed to call memory list API",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

