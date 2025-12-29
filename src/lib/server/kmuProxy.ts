/**
 * KMU Proxy Helper - Centralized proxy for Python Backend KMU API
 * 
 * SECURITY HARDENED:
 * - Uses x-internal-api-key (not x-api-key)
 * - Tenant/User from verified JWT tokens only (no header spoofing)
 * - Fail-closed: returns 401 if tenant/user cannot be determined
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest, getInternalApiKeyHeader } from './tenant'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'

const PYTHON_BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'

/**
 * Auth context from verified JWT token
 */
interface AuthContext {
  tenantId: string
  userId: string
  userName?: string
  role?: string
}

/**
 * Extracts user ID from JWT token payload.
 * 
 * SECURITY: Only extracts from verified JWT tokens.
 * Never trusts x-user-id header directly.
 */
function getUserIdFromAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  try {
    // Import jwt dynamically to avoid circular deps
    const jwt = require('jsonwebtoken')
    const authSecret = process.env.AUTH_SECRET
    
    if (!authSecret) {
      if (process.env.NODE_ENV === 'production') {
        return null
      }
      // Dev fallback (same logic as tenant.ts)
      if (process.env.ALLOW_UNVERIFIED_JWT_DEV !== 'true') {
        return null
      }
      const cleanToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
      const parts = cleanToken.split('.')
      if (parts.length < 2) return null
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      const padded = payload + '==='.slice((payload.length + 3) % 4)
      const decoded = Buffer.from(padded, 'base64').toString('utf8')
      const parsed = JSON.parse(decoded)
      return parsed.userId || parsed.user_id || parsed.sub || null
    }
    
    const cleanToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
    const decoded = jwt.verify(cleanToken, authSecret, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload
    
    return decoded.userId || decoded.user_id || decoded.sub || null
  } catch (error) {
    return null
  }
}

/**
 * Gets user name from JWT token payload (optional).
 */
function getUserNameFromAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  try {
    const jwt = require('jsonwebtoken')
    const authSecret = process.env.AUTH_SECRET
    
    if (!authSecret) {
      if (process.env.ALLOW_UNVERIFIED_JWT_DEV === 'true' && process.env.NODE_ENV !== 'production') {
        const cleanToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
        const parts = cleanToken.split('.')
        if (parts.length < 2) return null
        const payload = parts[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/')
        const padded = payload + '==='.slice((payload.length + 3) % 4)
        const decoded = Buffer.from(padded, 'base64').toString('utf8')
        const parsed = JSON.parse(decoded)
        return parsed.userName || parsed.user_name || parsed.name || null
      }
      return null
    }
    
    const cleanToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
    const decoded = jwt.verify(cleanToken, authSecret, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload
    
    return decoded.userName || decoded.user_name || decoded.name || null
  } catch (error) {
    return null
  }
}

/**
 * Requires auth context from request (tenant + user from verified JWT).
 * 
 * SECURITY: Fail-closed - returns 401 if tenant/user cannot be determined.
 * 
 * @param request - Next.js request
 * @returns AuthContext or NextResponse with 401 error
 */
export function requireAuthContextFromRequest(request: NextRequest): AuthContext | NextResponse {
  // Get tenantId (verified from JWT)
  const tenantResult = requireTenantIdFromRequest(request)
  if (tenantResult instanceof NextResponse) {
    return tenantResult // Already 401 response
  }
  const tenantId = tenantResult
  
  // Get userId from verified JWT token
  const userId = getUserIdFromAuthToken(request)
  if (!userId) {
    return NextResponse.json(
      { error: 'missing_user', message: 'User ID is required but not available. Please login.' },
      { status: 401 }
    )
  }
  
  // Optional: userName from token
  const userName = getUserNameFromAuthToken(request) || undefined
  
  return {
    tenantId,
    userId,
    userName,
  }
}

/**
 * Builds headers for Python Backend KMU API requests.
 * 
 * SECURITY:
 * - Uses x-internal-api-key (not x-api-key)
 * - Tenant/User from verified JWT tokens only
 * 
 * @param request - Next.js request
 * @returns Headers object or NextResponse with 401 error
 */
export function buildKmuProxyHeaders(request: NextRequest): Record<string, string> | NextResponse {
  const authContext = requireAuthContextFromRequest(request)
  if (authContext instanceof NextResponse) {
    return authContext // 401 response
  }
  
  const internalApiKeyHeaders = getInternalApiKeyHeader()
  if (!internalApiKeyHeaders['x-internal-api-key']) {
    console.error('[KMU Proxy] INTERNAL_API_KEY not configured')
    return NextResponse.json(
      { error: 'configuration_error', message: 'Internal API key not configured' },
      { status: 500 }
    )
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-api-key': internalApiKeyHeaders['x-internal-api-key'], // CORRECT header name
    'x-tenant-id': authContext.tenantId,
    'x-user-id': authContext.userId,
  }
  
  if (authContext.userName) {
    headers['x-user-name'] = authContext.userName
  }
  
  return headers
}

/**
 * Proxies request to Python Backend KMU API.
 * 
 * @param request - Next.js request
 * @param endpoint - Python backend endpoint (e.g., '/kmu/notes' or '/kmu/notes/{id}')
 * @param options - Optional fetch options
 * @returns NextResponse with proxied response
 */
export async function proxyToKmuBackend(
  request: NextRequest,
  endpoint: string,
  options: {
    method?: string
    body?: BodyInit
    searchParams?: Record<string, string>
    pathParams?: Record<string, string> // For dynamic routes like {id}
  } = {}
): Promise<NextResponse> {
  const headers = buildKmuProxyHeaders(request)
  if (headers instanceof NextResponse) {
    return headers // Error response (401 or 500)
  }
  
  // Handle Request ID (Phase 3.1)
  const requestId = request.headers.get('x-request-id') || request.headers.get('x-correlation-id') || randomUUID()
  headers['x-request-id'] = requestId
  headers['x-correlation-id'] = requestId
  
  // Replace path params in endpoint (e.g., '/kmu/notes/{id}' -> '/kmu/notes/123')
  let finalEndpoint = endpoint
  if (options.pathParams) {
    for (const [key, value] of Object.entries(options.pathParams)) {
      finalEndpoint = finalEndpoint.replace(`{${key}}`, value)
    }
  }
  
  const url = new URL(`${PYTHON_BACKEND}${finalEndpoint}`)
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value) {
        url.searchParams.set(key, value)
      }
    }
  }
  
  try {
    const res = await fetch(url.toString(), {
      method: options.method || request.method,
      headers,
      body: options.body,
    })
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    let data: any
    
    if (contentType && contentType.includes('application/json')) {
      data = await res.json()
      
      // Inject requestId into body (optional as per Phase 3.1)
      if (typeof data === 'object' && data !== null) {
        data.requestId = requestId
      }
    } else {
      data = { message: await res.text(), requestId }
    }
    
    // Return response with x-request-id header (Phase 3.1)
    return NextResponse.json(data, { 
      status: res.status,
      headers: {
        'x-request-id': requestId,
        'x-correlation-id': requestId
      }
    })
  } catch (error) {
    console.error(`[KMU Proxy] Error proxying to ${finalEndpoint}:`, error)
    return NextResponse.json(
      { ok: false, error: 'Internal error', details: error instanceof Error ? error.message : 'unknown', requestId },
      { 
        status: 500,
        headers: {
          'x-request-id': requestId
        }
      }
    )
  }
}

