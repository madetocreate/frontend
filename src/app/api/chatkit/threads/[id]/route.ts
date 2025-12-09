import { NextRequest, NextResponse } from "next/server";

const CHATKIT_API_URL =
  process.env.CHATKIT_API_URL || "http://127.0.0.1:8000/chatkit";

async function proxyThreadRequest(req: NextRequest, id: string) {
  if (!CHATKIT_API_URL) {
    return NextResponse.json(
      { error: "CHATKIT_API_URL is not configured" },
      { status: 500 }
    );
  }

  const baseUrl = CHATKIT_API_URL.endsWith("/")
    ? CHATKIT_API_URL.slice(0, -1)
    : CHATKIT_API_URL;

  const targetUrl = `${baseUrl}/threads/${encodeURIComponent(id)}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (req.method === "PATCH") {
    const body = await req.json();
    init.body = JSON.stringify(body);
  }

  const response = await fetch(targetUrl, init);
  const text = await response.text();
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return NextResponse.json(data, {
    status: response.status,
  });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyThreadRequest(req, id);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyThreadRequest(req, id);
}
