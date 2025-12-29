/**
 * Security Guards - Canonical Authentication & Authorization Helpers for Next.js API Routes
 * 
 * PURPOSE:
 * - Enforce tenant isolation: tenantId ONLY from verified JWT, never from client input
 * - Protect internal API key: never expose, never trust client-provided keys
 * - Fail-closed in production: no defaults, no fallbacks
 * 
 * USAGE:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   // 1. Enforce user authentication & extract tenant
 *   const tenantId = requireUserTenant(request)
 *   if (tenantId instanceof NextResponse) return tenantId // 401 if no auth
 * 
 *   // 2. Build headers for backend call
 *   const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true })
 *   
 *   // 3. Forward user auth context
 *   const forwardHeaders = buildUserForwardHeaders(request)
 * 
 *   const response = await fetch(`${backendUrl}/endpoint`, {
 *     headers: { ...headers, ...forwardHeaders },
 *     // ...
 *   })
 * }
 * ```
 * 
 * @module securityGuards
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantIdFromRequest } from './tenant'
import { v4 as uuidv4 } from 'uuid'

// ══════════════════════════════════════════════════════════════
// TENANT EXTRACTION & ENFORCEMENT
// ══════════════════════════════════════════════════════════════

/**
 * Requires authenticated user and extracts tenant ID from verified JWT.
 * 
 * SECURITY:
 * - In production: NO fallbacks, NO defaults. Must have valid JWT with tenantId.
 * - In development: Optional fallback to env var ONLY if ALLOW_ENV_TENANT_FALLBACK_DEV=true
 * - Returns 401 if no authenticated tenant available
 * 
 * @param request - Next.js request
 * @returns tenantId string OR NextResponse (401) if authentication missing/invalid
 * 
 * @example
 * ```typescript
 * const tenantId = requireUserTenant(request)
 * if (tenantId instanceof NextResponse) return tenantId
 * // tenantId is guaranteed string here
 * ```
 */
export function requireUserTenant(request: NextRequest): string | NextResponse {
  const tenantId = getTenantIdFromRequest(request)
  
  if (tenantId) {
    return tenantId
  }
  
  // Production: Fail closed, no defaults
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { 
        error: 'authentication_required', 
        message: 'Valid authentication with tenant context is required' 
      },
      { status: 401 }
    )
  }
  
  // Development: Optional fallback ONLY if explicitly enabled
  if (process.env.ALLOW_ENV_TENANT_FALLBACK_DEV === 'true') {
    const fallback = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID
    if (fallback) {
      console.warn(
        '[SecurityGuards] DEV MODE: Using fallback tenant from env. ' +
        'This would be BLOCKED in production. Set up proper authentication.'
      )
      return fallback
    }
  }
  
  // Dev mode without fallback enabled
  return NextResponse.json(
    { 
      error: 'authentication_required', 
      message: 'Authentication required. Enable ALLOW_ENV_TENANT_FALLBACK_DEV=true for dev fallback, or set up proper auth.',
      hint: 'Set authorization header with JWT token, or enable dev fallback in .env'
    },
    { status: 401 }
  )
}

/**
 * Requires admin session and allows tenant override via x-tenant-id header.
 * 
 * USE CASE: Admin endpoints that need to act on behalf of a different tenant.
 * 
 * SECURITY:
 * - ONLY allows x-tenant-id override if requireAdminSession(request) passes
 * - Falls back to user's own tenant if no override provided
 * - Returns 403 if admin session check fails
 * 
 * @param request - Next.js request
 * @returns tenantId string OR NextResponse (401/403) if not authorized
 */
export function requireAdminTenantOverride(request: NextRequest): string | NextResponse {
  try {
    const { requireAdminSession } = require('./adminSession')
    const adminGate = requireAdminSession(request)
    
    // requireAdminSession returns null if admin session valid, NextResponse if not
    if (adminGate !== null) {
      return adminGate // 401/403 response
    }
    
    // Admin session valid - allow x-tenant-id override
    const overrideTenant = request.headers.get('x-tenant-id')
    if (overrideTenant) {
      console.info(`[SecurityGuards] Admin override: acting as tenant ${overrideTenant}`)
      return overrideTenant
    }
    
    // No override - use admin's own tenant
    const ownTenant = getTenantIdFromRequest(request)
    if (ownTenant) {
      return ownTenant
    }
    
    // Admin session valid but no tenant context (edge case)
    return NextResponse.json(
      { error: 'tenant_required', message: 'Admin session valid but no tenant context available' },
      { status: 400 }
    )
  } catch (error) {
    // adminSession module not available or error
    console.error('[SecurityGuards] Admin session check failed:', error)
    return NextResponse.json(
      { error: 'authorization_failed', message: 'Cannot verify admin privileges' },
      { status: 500 }
    )
  }
}

// ══════════════════════════════════════════════════════════════
// INTERNAL API KEY HANDLING
// ══════════════════════════════════════════════════════════════

/**
 * Gets internal API key from environment (server-side only).
 * 
 * SECURITY:
 * - NEVER expose this to client
 * - NEVER accept internal api key from request headers/body
 * - Production: Throws error if missing (fail-closed)
 * - Development: Warns but allows (optional)
 * 
 * @param options - Configuration options
 * @param options.required - If true, throws in production when key missing (default: true)
 * @returns Internal API key or null
 * @throws Error in production if key missing and required=true
 */
export function requireInternalApiKey(options: { required?: boolean } = {}): string | null {
  const { required = true } = options
  const internalApiKey = process.env.INTERNAL_API_KEY
  
  if (!internalApiKey) {
    if (process.env.NODE_ENV === 'production' && required) {
      // Fail closed in production
      throw new Error(
        '[SecurityGuards] INTERNAL_API_KEY not configured in production. ' +
        'Service-to-service authentication is required.'
      )
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[SecurityGuards] INTERNAL_API_KEY not configured. ' +
        'Service-to-service calls will fail. Set INTERNAL_API_KEY in .env'
      )
    }
    
    return null
  }
  
  return internalApiKey
}

// ══════════════════════════════════════════════════════════════
// HEADER BUILDERS FOR BACKEND COMMUNICATION
// ══════════════════════════════════════════════════════════════

/**
 * Builds headers for service-to-service backend calls.
 * 
 * SECURITY:
 * - tenantId: MUST come from requireUserTenant(), never from client input
 * - x-internal-api-key: ONLY from process.env, never from request
 * - Sets x-tenant-id for backend to enforce tenant context
 * 
 * @param options - Header configuration
 * @param options.tenantId - Tenant ID (from requireUserTenant)
 * @param options.includeInternalKey - Whether to include x-internal-api-key (default: true)
 * @param options.contentType - Content-Type header (default: 'application/json')
 * @returns Headers object for fetch()
 * 
 * @example
 * ```typescript
 * const tenantId = requireUserTenant(request)
 * if (tenantId instanceof NextResponse) return tenantId
 * 
 * const headers = buildServiceToServiceHeaders({ tenantId })
 * await fetch(backendUrl, { headers })
 * ```
 */
export function buildServiceToServiceHeaders(options: {
  tenantId: string
  includeInternalKey?: boolean
  contentType?: string
}): Record<string, string> {
  const { 
    tenantId, 
    includeInternalKey = true, 
    contentType = 'application/json' 
  } = options
  
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'x-tenant-id': tenantId,
  }
  
  if (includeInternalKey) {
    const internalKey = requireInternalApiKey({ required: false })
    if (internalKey) {
      headers['x-internal-api-key'] = internalKey
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('[SecurityGuards] Internal API key not available - backend call may be rejected')
    }
  }
  
  return headers
}

/**
 * Builds headers for forwarding user authentication context to backend.
 * 
 * SECURITY:
 * - Forwards authorization header from user request
 * - Adds correlation/request IDs for tracing
 * - NEVER forwards x-tenant-id from client (tenant comes from JWT)
 * - Generates new request ID if none present
 * 
 * @param request - Next.js request
 * @param options - Configuration options
 * @param options.includeCookies - Whether to forward cookies (default: false for security)
 * @returns Headers object for fetch()
 * 
 * @example
 * ```typescript
 * const forwardHeaders = buildUserForwardHeaders(request)
 * await fetch(backendUrl, { 
 *   headers: { 
 *     ...buildServiceToServiceHeaders({ tenantId }),
 *     ...forwardHeaders 
 *   }
 * })
 * ```
 */
export function buildUserForwardHeaders(
  request: NextRequest,
  options: { includeCookies?: boolean } = {}
): Record<string, string> {
  const { includeCookies = false } = options
  const headers: Record<string, string> = {}
  
  // 1. Forward authorization header (JWT token)
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['authorization'] = authHeader
  }
  
  // 2. Correlation ID propagation (for distributed tracing)
  let requestId = request.headers.get('x-request-id')
  let correlationId = request.headers.get('x-correlation-id')
  
  // Generate new request ID if none present
  if (!requestId) {
    requestId = uuidv4()
  }
  
  // Use request ID as correlation ID if none present
  if (!correlationId) {
    correlationId = requestId
  }
  
  headers['x-request-id'] = requestId
  headers['x-correlation-id'] = correlationId
  
  // 3. Optional: Forward cookies (disabled by default for security)
  if (includeCookies) {
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      headers['cookie'] = cookieHeader
    }
  }
  
  // 4. User-Agent forwarding (for analytics/logging)
  const userAgent = request.headers.get('user-agent')
  if (userAgent) {
    headers['user-agent'] = userAgent
  }
  
  // SECURITY: Explicitly DO NOT forward:
  // - x-tenant-id (tenant comes from JWT, not client headers)
  // - x-internal-api-key (client should never send this)
  // - host, origin (prevents header spoofing attacks)
  
  return headers
}

// ══════════════════════════════════════════════════════════════
// ANTI-PATTERNS & MIGRATION HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Validates that tenant ID from client matches authenticated tenant.
 * 
 * USE CASE: Defense-in-depth when client sends tenantId in body/query.
 * Instead of using client-provided tenantId, verify it matches auth context.
 * 
 * @param request - Next.js request
 * @param clientProvidedTenant - Tenant ID from request body/query
 * @returns NextResponse (403) if mismatch, null if OK
 * 
 * @example
 * ```typescript
 * const body = await request.json()
 * const tenantId = requireUserTenant(request)
 * if (tenantId instanceof NextResponse) return tenantId
 * 
 * // Defense-in-depth: verify client didn't try to spoof tenant
 * if (body.tenantId) {
 *   const mismatch = validateTenantMatch(request, body.tenantId)
 *   if (mismatch) return mismatch // 403
 * }
 * ```
 */
export function validateTenantMatch(
  request: NextRequest,
  clientProvidedTenant: string | undefined
): NextResponse | null {
  if (!clientProvidedTenant) {
    return null // No client tenant provided, nothing to validate
  }
  
  const authenticatedTenant = getTenantIdFromRequest(request)
  
  if (!authenticatedTenant) {
    // No authenticated tenant - this should have been caught by requireUserTenant
    return NextResponse.json(
      { error: 'authentication_required', message: 'No authenticated tenant context' },
      { status: 401 }
    )
  }
  
  if (clientProvidedTenant !== authenticatedTenant) {
    console.warn(
      `[SecurityGuards] Tenant mismatch: client provided '${clientProvidedTenant}', ` +
      `authenticated tenant is '${authenticatedTenant}'. Possible attack attempt.`
    )
    return NextResponse.json(
      { 
        error: 'tenant_mismatch', 
        message: 'Tenant ID in request does not match authenticated tenant context',
        hint: 'This could indicate a misconfigured client or security issue'
      },
      { status: 403 }
    )
  }
  
  return null // OK
}

/**
 * @deprecated Legacy helper - DO NOT USE in new code
 * 
 * This function exists only for backwards compatibility during migration.
 * It allows fallback tenants which is a SECURITY RISK.
 * 
 * Use requireUserTenant() instead.
 */
export function requireUserTenantWithFallback(
  request: NextRequest,
  fallback: string
): string {
  console.warn(
    '[SecurityGuards] DEPRECATED: requireUserTenantWithFallback() called. ' +
    'This function allows fallback tenants which is insecure. Use requireUserTenant() instead.'
  )
  
  const tenantId = getTenantIdFromRequest(request)
  if (tenantId) {
    return tenantId
  }
  
  console.warn(`[SecurityGuards] Using fallback tenant: ${fallback}. This should be fixed.`)
  return fallback
}

