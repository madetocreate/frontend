import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

const COOKIE_NAME = "ak_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8h

function getSecret(): string {
  return process.env.ADMIN_GATE_SECRET || process.env.AI_SHIELD_ADMIN_SECRET || "";
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function makeToken(secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = `${now}`;
  const sig = sign(payload, secret);
  return `${payload}.${sig}`;
}

export async function POST(request: NextRequest) {
  const secret = getSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_GATE_SECRET fehlt (server-only env)" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";

  const expected = process.env.ADMIN_GATE_PASSWORD || process.env.AI_SHIELD_ADMIN_PASSWORD || "";
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_GATE_PASSWORD fehlt (server-only env)" },
      { status: 500 }
    );
  }

  // SECURITY: Timing-safe password comparison
  try {
    const passwordBuffer = Buffer.from(password, 'utf-8')
    const expectedBuffer = Buffer.from(expected, 'utf-8')
    if (passwordBuffer.length !== expectedBuffer.length) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!crypto.timingSafeEqual(passwordBuffer, expectedBuffer)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  } catch {
    // Fail-closed bei Fehlern
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = makeToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}


