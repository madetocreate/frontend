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

  const { tenantId, query, limit, offset, filters } = body as Record<string, unknown>;

  if (typeof tenantId !== "string" || !tenantId) {
    return NextResponse.json({ error: "Missing or invalid tenantId" }, { status: 400 });
  }
  if (typeof query !== "string" || !query) {
    return NextResponse.json({ error: "Missing or invalid query" }, { status: 400 });
  }

  const payload = {
    tenant_id: tenantId,
    query,
    limit: typeof limit === "number" && Number.isFinite(limit) ? limit : 20,
    offset: typeof offset === "number" && Number.isFinite(offset) ? offset : 0,
    filters: filters && typeof filters === "object" ? filters : undefined,
  };

  const targetUrl = `${normalizeBaseUrl(AGENT_BACKEND_URL)}/memory/search`;

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
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
