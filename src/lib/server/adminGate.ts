/**
 * Zentrale Admin-Session-Verifikation (Server-Only)
 * 
 * SECURITY: Kryptografische Verifikation von Admin-Session-Cookies.
 * Nutzt HMAC-SHA256 mit timing-safe comparison.
 * 
 * Cookie-Format: "ts.sig" (ts = Unix timestamp in seconds, sig = base64url HMAC)
 * TTL: 8 Stunden
 */

import { NextRequest } from 'next/server'
import * as crypto from 'crypto'

export const ADMIN_COOKIE_NAME = 'ak_admin_session'

/**
 * Signiert einen Payload mit HMAC-SHA256 (base64url).
 */
function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

/**
 * Verifiziert eine Admin-Session aus dem Request-Cookie.
 * 
 * SECURITY:
 * - Nutzt timing-safe comparison (crypto.timingSafeEqual)
 * - Fail-closed: Bei Fehlern/Format/TTL → false
 * - TTL: 8 Stunden
 * 
 * @param request - Next.js Request
 * @returns true wenn Cookie gültig und signiert ist, sonst false
 */
export function isValidAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_GATE_SECRET || process.env.AI_SHIELD_ADMIN_SECRET || ''
  if (!secret) {
    // Fail-closed: Kein Secret → keine gültige Session
    return false
  }

  const raw = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!raw) {
    return false
  }

  // Parse Cookie-Format: "ts.sig"
  const parts = raw.split('.')
  if (parts.length !== 2) {
    return false
  }

  const [tsStr, sig] = parts
  if (!tsStr || !sig) {
    return false
  }

  // Parse timestamp
  const ts = Number(tsStr)
  if (!Number.isFinite(ts) || ts <= 0) {
    return false
  }

  // TTL Check: 8 Stunden
  const now = Math.floor(Date.now() / 1000)
  const maxAge = 60 * 60 * 8 // 8 Stunden
  if (now - ts > maxAge) {
    return false
  }

  // Verify signature mit timing-safe comparison
  const expected = sign(tsStr, secret)
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    // Fail-closed bei Fehlern
    return false
  }
}

