import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.ORCHESTRATOR_API_URL;

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

  const parsedBody = (body && typeof body === "object" ? (body as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  const tool = parsedBody.tool;
  const args = parsedBody.args;
  const threadId = parsedBody.threadId;
  const tenantId = parsedBody.tenantId;
  if (!tool || typeof tool !== "string") {
    return NextResponse.json({ error: "Missing tool name" }, { status: 400 });
  }

  const target = `${BACKEND_URL}/realtime/tools/${encodeURIComponent(tool)}`;
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        threadId,
        tenantId,
        ...(args && typeof args === "object" ? (args as Record<string, unknown>) : {}),
      }),
    });
    const txt = await res.text();
    let json: unknown = null;
    if (txt) {
      try {
        json = JSON.parse(txt);
      } catch {
        json = { raw: txt };
      }
    }
    return NextResponse.json(json ?? {}, { status: res.status });
  } catch (error) {
    console.error("realtime tools proxy error", error);
    return NextResponse.json(
      { error: "tools proxy failed" },
      { status: 502 }
    );
  }
}

