import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminSession } from './adminGate'

export const ADMIN_COOKIE_NAME = 'ak_admin_session'

function authHeaderToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.*)$/i)
  return match ? match[1] : null
}

/**
 * Checks if the request has a valid admin session cookie.
 * 
 * SECURITY: Nutzt kryptografische Verifikation (isValidAdminSession).
 * Ein beliebiger Cookie-Wert wird NICHT mehr als Admin akzeptiert.
 */
export function hasAdminSession(request: NextRequest): boolean {
  return isValidAdminSession(request)
}

/**
 * Requires admin session. Returns 401 response if missing, null if valid.
 * Allows Bearer token fallback for dev and internal service-to-service calls.
 * 
 * SECURITY:
 * - MEMORY_API_SECRET: Service-to-service (immer erlaubt)
 * - Dev-Bearer: Nur in dev, aber NICHT aus NEXT_PUBLIC_AUTH_TOKEN (server-only: AUTH_DEV_BEARER_TOKEN)
 * - In production: Nur gültige Admin-Session zählt
 */
export function requireAdminSession(request: NextRequest): NextResponse | null {
  const token = authHeaderToken(request)
  const memorySecret = process.env.MEMORY_API_SECRET
  const isDev = process.env.NODE_ENV !== 'production'

  if (token) {
    // Allow internal service calls via MEMORY_API_SECRET
    if (memorySecret && token === memorySecret) {
      return null
    }
    // Allow dev bearer token (server-only env, nicht aus NEXT_PUBLIC_*)
    // Nur in dev, nicht in production
    if (isDev) {
      const devBearerToken = process.env.AUTH_DEV_BEARER_TOKEN || process.env.DEV_BEARER_TOKEN
      if (devBearerToken && token === devBearerToken) {
        return null
      }
    }
  }

  // In production: Nur gültige Admin-Session zählt
  // In dev: Auch gültige Admin-Session zählt (aber Dev-Bearer ist auch ok)
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

