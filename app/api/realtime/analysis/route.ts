import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.ORCHESTRATOR_API_URL;

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "BACKEND_URL is not configured" },
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

  const { tenantId, sessionId, message, role } = body as Record<string, unknown>;

  if (typeof tenantId !== "string" || !tenantId) {
    return NextResponse.json({ error: "Missing or invalid tenantId" }, { status: 400 });
  }
  if (typeof sessionId !== "string" || !sessionId) {
    return NextResponse.json({ error: "Missing or invalid sessionId" }, { status: 400 });
  }
  if (typeof message !== "string" || !message) {
    return NextResponse.json({ error: "Missing or invalid message" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    tenantId,
    sessionId,
    message,
  };

  if (role && typeof role === "string") {
    payload.role = role;
  }

  const targetUrl = `${normalizeBaseUrl(BACKEND_URL)}/realtime/tools/analysis`;

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

