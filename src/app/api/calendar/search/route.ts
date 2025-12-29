import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl } from '@/app/api/_utils/proxyAuth';

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const BACKEND_URL = getGatewayUrl();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { tenantId, query } = body as Record<string, unknown>;

  if (typeof tenantId !== "string" || !tenantId) {
    return NextResponse.json({ error: "Missing or invalid tenantId" }, { status: 400 });
  }
  if (typeof query !== "string" || !query) {
    return NextResponse.json({ error: "Missing or invalid query" }, { status: 400 });
  }

  const payload = {
    tenantId,
    query,
  };

  const targetUrl = `${normalizeBaseUrl(BACKEND_URL)}/realtime/tools/calendar-search`;

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

