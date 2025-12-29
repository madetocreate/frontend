/**
 * Server-Side Tenant Utilities (Next.js API Routes)
 * 
 * Extrahiert tenantId aus Request (JWT Token, Headers, etc.)
 * 
 * SECURITY: JWT tokens are verified with HS256 and AUTH_SECRET before extracting tenantId.
 * Only verified tokens are trusted as source of truth.
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * Verifies JWT token and extracts tenantId from verified payload.
 * 
 * Uses HS256 algorithm with AUTH_SECRET (same as Node backend).
 * 
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns tenantId from verified token, or null if verification fails
 */
function verifyAndExtractTenantIdFromAuthHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  try {
    // Remove "Bearer " prefix if present
    const cleanToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
    
    const authSecret = process.env.AUTH_SECRET
    
    // In production: fail closed if AUTH_SECRET is missing
    if (!authSecret) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Tenant] AUTH_SECRET missing in production - cannot verify JWT')
        return null
      }
      // In dev: automatically allow unverified decode if AUTH_SECRET is missing
      // (can be disabled with ALLOW_UNVERIFIED_JWT_DEV=false)
      if (process.env.ALLOW_UNVERIFIED_JWT_DEV === 'false') {
        console.warn('[Tenant] AUTH_SECRET missing and ALLOW_UNVERIFIED_JWT_DEV=false - skipping unverified decode')
        return null
      }
      // Dev fallback: decode without verification (with warning)
      console.warn('[Tenant] DEV ONLY: AUTH_SECRET missing, decoding JWT without verification')
      const parts = cleanToken.split('.')
      if (parts.length < 2) return null
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      const padded = payload + '==='.slice((payload.length + 3) % 4)
      const decoded = Buffer.from(padded, 'base64').toString('utf8')
      const parsed = JSON.parse(decoded)
      return parsed.tenantId || parsed.tenant_id || null
    }
    
    // Verify token with HS256 (hardcoded algorithm, not from header)
    const decoded = jwt.verify(cleanToken, authSecret, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload
    
    // Extract tenantId from verified payload
    const tenantId = decoded.tenantId || decoded.tenant_id
    if (typeof tenantId === 'string' && tenantId.length > 0) {
      return tenantId
    }
    
    return null
  } catch (error) {
    // Verification failed - log server-side but don't expose to client
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Tenant] JWT verification failed:', error instanceof Error ? error.message : 'unknown error')
    }
    return null
  }
}

/**
 * Gets tenant ID from Next.js request.
 * 
 * Priority (SECURITY-HARDENED):
 * 1. Authorization header (JWT token) - VERIFIED with HS256/AUTH_SECRET - PRIMARY SOURCE OF TRUTH
 * 2. x-tenant-id header (only for internal/admin requests)
 * 3. Query parameter (DEV ONLY - requires explicit flag)
 * 4. ENV (dev only - requires explicit flag)
 * 
 * SECURITY: Tenant-ID should NEVER come from unverified sources in production.
 * Only verified JWT tokens or internal service-to-service headers are trusted.
 * 
 * @param request - Next.js request
 * @returns tenantId or null
 */
export function getTenantIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  // 1. Try Authorization header (JWT token) - VERIFIED - PRIMARY SOURCE OF TRUTH
  const tenantFromToken = verifyAndExtractTenantIdFromAuthHeader(authHeader)
  if (tenantFromToken) {
    return tenantFromToken
  }

  // 2. Try x-tenant-id header (only for internal/admin requests)
  // Check if this is an internal request (admin session present)
  const tenantHeader = request.headers.get('x-tenant-id')
  if (tenantHeader) {
    // Import requireAdminSession dynamically to avoid circular deps
    try {
      const { requireAdminSession } = require('./adminSession')
      const adminGate = requireAdminSession(request)
      // If requireAdminSession returns null, it means admin session is valid (internal request)
      if (adminGate === null) {
        return tenantHeader
      }
      // Not an internal request - ignore x-tenant-id (security: don't trust external headers)
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Tenant] x-tenant-id header ignored - not an internal/admin request')
      }
    } catch (error) {
      // If adminSession module not available, fail closed (don't trust x-tenant-id)
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Tenant] Cannot verify admin session - ignoring x-tenant-id header')
      }
    }
  }

  // 3. Query parameter (DEV ONLY - requires explicit flag)
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_QUERY_TENANT_ID_DEV === 'true' &&
    !authHeader
  ) {
    const queryTenant = request.nextUrl.searchParams.get('tenantId') || 
                       request.nextUrl.searchParams.get('tenant_id')
    if (queryTenant) {
      console.warn('[Tenant] Using query parameter for tenantId (DEV ONLY - ALLOW_QUERY_TENANT_ID_DEV=true)')
      return queryTenant
    }
  }

  // 4. ENV (dev only - requires explicit flag)
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_ENV_TENANT_FALLBACK_DEV === 'true'
  ) {
    const envTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID
    if (envTenant) {
      console.warn('[Tenant] Using ENV fallback for tenantId (DEV ONLY - ALLOW_ENV_TENANT_FALLBACK_DEV=true)')
      return envTenant
    }
  }

  return null
}

/**
 * Gets tenant ID from request with fallback (for backwards compatibility).
 * 
 * WARNING: Only use during migration. Prefer getTenantIdFromRequest() and handle null.
 */
export function getTenantIdFromRequestWithFallback(
  request: NextRequest,
  fallback: string
): string {
  const tenantId = getTenantIdFromRequest(request)
  if (tenantId) {
    return tenantId
  }
  
  // Log warning in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Tenant] No tenantId found in request, using fallback: ${fallback}. This should be fixed.`)
  }
  
  return fallback
}

/**
 * Requires tenant ID from request - returns error response if not available
 * 
 * In development mode, falls back to 'aklow-main' to allow testing without full auth setup.
 */
export function requireTenantIdFromRequest(request: NextRequest): string | NextResponse {
  const tenantId = getTenantIdFromRequest(request)
  if (!tenantId) {
    // In development: fallback to default tenant for easier testing
    if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_TENANT_FALLBACK !== 'false') {
      console.warn('[Tenant] No tenantId found in request, using dev fallback: aklow-main')
      return 'aklow-main'
    }
    return NextResponse.json(
      { error: 'missing_tenant', message: 'Tenant ID is required but not available. Please login or select workspace.' },
      { status: 401 }
    )
  }
  return tenantId
}

/**
 * Gets Internal API Key header for service-to-service calls to Python backend.
 * 
 * SECURITY: Only available server-side (process.env.INTERNAL_API_KEY).
 * Never exposed to client.
 * 
 * @returns Headers object with x-internal-api-key, or empty object if not configured
 */
export function getInternalApiKeyHeader(): Record<string, string> {
  const internalApiKey = process.env.INTERNAL_API_KEY
  if (!internalApiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Tenant] INTERNAL_API_KEY not configured in production')
    }
    return {}
  }
  return { 'x-internal-api-key': internalApiKey }
}

