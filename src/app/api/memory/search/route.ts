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
    body = {};
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { tenantId, query, limit, filters } = body as Record<string, unknown>;

  if (typeof tenantId !== "string" || !tenantId) {
    return NextResponse.json({ error: "Missing or invalid tenantId" }, { status: 400 });
  }
  // Query kann leer sein (für "alle Items" Suche)
  const searchQuery = typeof query === "string" ? query.trim() : "";

  // Extrahiere types aus filters, falls vorhanden
  const filtersObj = filters && typeof filters === "object" ? filters as Record<string, unknown> : {};
  const memoryTypes = filtersObj.types && Array.isArray(filtersObj.types) && filtersObj.types.length > 0
    ? (filtersObj.types as string[])
    : undefined;

  const payload: Record<string, unknown> = {
    tenant_id: tenantId,
    query: searchQuery,
    limit: typeof limit === "number" && Number.isFinite(limit) ? limit : 20,
  };

  // Füge filters hinzu, falls types vorhanden
  if (memoryTypes) {
    payload.filters = {
      types: memoryTypes,
    };
  }

  const targetUrl = `${normalizeBaseUrl(AGENT_BACKEND_URL)}/memory/search`;
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
