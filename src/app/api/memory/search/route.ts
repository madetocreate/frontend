import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATOR_API_URL = process.env.ORCHESTRATOR_API_URL;
const ORCHESTRATOR_TENANT_ID = process.env.ORCHESTRATOR_TENANT_ID;
const ORCHESTRATOR_API_TOKEN = process.env.ORCHESTRATOR_API_TOKEN;

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!ORCHESTRATOR_API_URL || !ORCHESTRATOR_TENANT_ID) {
    return NextResponse.json(
      { error: "Orchestrator backend is not configured" },
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

  const { query, limit, offset, filters } = body as Record<string, unknown>;

  if (typeof query !== "string" || !query) {
    return NextResponse.json({ error: "Missing or invalid query" }, { status: 400 });
  }

  const payload = {
    tenantId: ORCHESTRATOR_TENANT_ID,
    query,
    limit: typeof limit === "number" && Number.isFinite(limit) ? limit : 20,
    offset: typeof offset === "number" && Number.isFinite(offset) ? offset : 0,
    filters: filters && typeof filters === "object" ? filters : undefined,
  };

  const targetUrl = `${normalizeBaseUrl(ORCHESTRATOR_API_URL)}/memory/search`;

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (ORCHESTRATOR_API_TOKEN) {
    headers["authorization"] = `Bearer ${ORCHESTRATOR_API_TOKEN}`;
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
