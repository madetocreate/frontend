import { NextRequest, NextResponse } from 'next/server';
import * as crypto from "crypto";

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:4051';
const ADMIN_KEY = process.env.CONTROL_PLANE_ADMIN_KEY || process.env.AI_SHIELD_ADMIN_KEY || '';
const COOKIE_NAME = "ak_admin_session";

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function isAdminRequest(request: NextRequest): boolean {
  const secret = process.env.ADMIN_GATE_SECRET || process.env.AI_SHIELD_ADMIN_SECRET || "";
  if (!secret) return false;
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [tsStr, sig] = raw.split(".");
  const ts = Number(tsStr);
  if (!tsStr || !sig || !Number.isFinite(ts)) return false;
  // 8h TTL
  const now = Math.floor(Date.now() / 1000);
  if (now - ts > 60 * 60 * 8) return false;
  const expected = sign(tsStr, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

function isAllowed(method: string, pathParts: string[]): boolean {
  const p = pathParts.join("/");
  // Minimal allowlist (expand consciously):
  if (method === "GET" && p === "health") return true;
  if (method === "GET" && p === "v1/mcp/registry") return true;
  if (method === "GET" && (p === "v1/integrations" || p === "v1/integrations/")) return true;
  // integrations connect/disconnect
  if (method === "POST" && /^v1\/integrations\/[^/]+\/connect$/.test(p)) return true;
  if (method === "POST" && /^v1\/integrations\/[^/]+\/disconnect$/.test(p)) return true;
  return false;
}

async function proxy(request: NextRequest, method: "GET" | "POST", pathParts: string[]) {
  const path = pathParts.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${CONTROL_PLANE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  if (!ADMIN_KEY) {
    return NextResponse.json({ error: "Server admin key not configured" }, { status: 500 });
  }

  const headers: Record<string, string> = {
    'x-ai-shield-admin-key': ADMIN_KEY,
    'Content-Type': 'application/json',
  };

  const tenant = request.headers.get("x-tenant-id");
  if (tenant) headers["x-tenant-id"] = tenant;

  let body: unknown = undefined;
  if (method === "POST") {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    ...(method === "POST" ? { body: JSON.stringify(body ?? {}) } : {}),
  });

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
  const text = await res.text();
  return new NextResponse(text, { status: res.status });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const pathParts = (await params).path;
  if (!isAllowed("GET", pathParts)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  if (pathParts.join("/") !== "health" && !isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await proxy(request, "GET", pathParts);
  } catch (error) {
    console.error('Shield API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Control Plane' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const pathParts = (await params).path;
  if (!isAllowed("POST", pathParts)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await proxy(request, "POST", pathParts);
  } catch (error) {
    console.error('Shield API Error:', error);
    return NextResponse.json({ error: 'Failed to post to Control Plane' }, { status: 500 });
  }
}
