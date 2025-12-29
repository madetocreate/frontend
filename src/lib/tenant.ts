/**
 * Zentrale Tenant/Workspace Utilities
 * 
 * Security: Keine hardcoded tenantIds mehr im produktiven Code.
 * Source of Truth: JWT Token > localStorage.user > localStorage.tenant_id > ENV > Error/Redirect
 */

/**
 * Browser-safe base64url decode (ohne Buffer dependency)
 */
function base64UrlDecode(payload: string): string {
  try {
    // Base64url to base64 conversion
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    // Add padding if needed
    const padded = base64 + '==='.slice((base64.length + 3) % 4)
    
    // Browser-safe decode using atob
    if (typeof window !== 'undefined' && typeof atob !== 'undefined') {
      const binaryString = atob(padded)
      // Convert binary string to UTF-8
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    }
    
    // Fallback: Node.js environment (server-side)
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf8')
    }
    
    // Last resort: manual decode (basic ASCII only)
    // Note: atob should be available here since we checked above, but double-check
    if (typeof atob !== 'undefined') {
      try {
        return decodeURIComponent(escape(atob(padded)))
      } catch {
        return ''
      }
    }
    return ''
  } catch {
    return ''
  }
}

/**
 * Extrahiert tenantId aus JWT Token (falls vorhanden)
 */
function extractTenantIdFromToken(token: string | null): string | null {
  if (!token) return null
  
  try {
    // JWT Format: header.payload.signature
    const parts = token.split('.')
    if (parts.length < 2) return null
    
    // Decode payload (base64url)
    const decoded = base64UrlDecode(parts[1])
    if (!decoded) return null
    
    const parsed = JSON.parse(decoded)
    
    return parsed.tenantId || parsed.tenant_id || null
  } catch {
    return null
  }
}

/**
 * Gets tenant ID from authenticated context.
 * 
 * Priority:
 * 1. JWT Token (if available and valid)
 * 2. localStorage.user (JSON object with tenantId/tenant_id)
 * 3. localStorage 'tenant_id'
 * 4. ENV NEXT_PUBLIC_DEFAULT_TENANT_ID (dev only)
 * 5. null (should trigger login/workspace picker)
 * 
 * @returns tenantId or null (never hardcoded fallback in production)
 */
export function getTenantId(): string | null {
  if (typeof window === 'undefined') {
    // Server-side: should come from request/session
    // For now, return null to force explicit handling
    return process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || null
  }

  // 1. Try to extract from JWT token
  const token = localStorage.getItem('auth_token')
  const tenantFromToken = extractTenantIdFromToken(token)
  if (tenantFromToken) {
    return tenantFromToken
  }

  // 2. Try localStorage.user (JSON object set during login)
  try {
    const userDataStr = localStorage.getItem('user')
    if (userDataStr) {
      const userData = JSON.parse(userDataStr)
      const tenantFromUser = userData?.tenantId || userData?.tenant_id
      if (tenantFromUser) {
        return tenantFromUser
      }
    }
  } catch {
    // Invalid JSON, ignore
  }

  // 3. Try localStorage 'tenant_id' (legacy)
  const stored = localStorage.getItem('tenant_id')
  if (stored) {
    return stored
  }

  // 4. ENV (dev only - should not be used in production)
  if (process.env.NODE_ENV !== 'production') {
    const envTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID
    if (envTenant) {
      return envTenant
    }
  }

  // 5. No tenant found - should trigger login/workspace picker
  return null
}

// Track if we already warned about missing tenant (avoid console spam)
let warnedAboutMissingTenant = false

/**
 * Gets tenant ID with fallback for development.
 * 
 * DEPRECATED: Use getTenantId() and handle null case explicitly.
 * This function is kept for backwards compatibility but should not be used in new code.
 * 
 * @param fallback - Fallback value for development (should not be used in production)
 * @returns tenantId or fallback
 */
export function getTenantIdWithFallback(fallback: string): string {
  const tenantId = getTenantId()
  if (tenantId) {
    return tenantId
  }
  
  // In development with no ENV set: Use fallback silently (expected during dev)
  // In production: Warn once (this should be fixed)
  if (process.env.NODE_ENV === 'production' && !warnedAboutMissingTenant) {
    warnedAboutMissingTenant = true
    console.warn(`[Tenant] No tenantId found in production, using fallback: ${fallback}. This should be fixed - ensure JWT token contains tenantId.`)
  }
  
  // Only allow fallback in development
  if (process.env.NODE_ENV === 'development') {
    return fallback
  }
  
  // In production, throw error instead of using fallback
  throw new Error('Tenant ID is required but not available. User must login.')
}

/**
 * Sets tenant ID in localStorage (should be called after login/workspace selection)
 */
export function setTenantId(tenantId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('tenant_id', tenantId)
}

/**
 * Gets workspace ID (currently same as tenantId, but may differ in future)
 */
export function getWorkspaceId(): string | null {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || null
  }

  const stored = localStorage.getItem('workspace_id')
  if (stored) {
    return stored
  }

  // Fallback to tenantId
  return getTenantId()
}

/**
 * Sets workspace ID in localStorage
 */
export function setWorkspaceId(workspaceId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('workspace_id', workspaceId)
}

/**
 * Checks if tenant/workspace is available
 */
export function hasTenantContext(): boolean {
  return getTenantId() !== null
}

/**
 * Requires tenant context - throws error if not available
 * Use this in functions that absolutely need tenantId
 */
export function requireTenantId(): string {
  const tenantId = getTenantId()
  if (!tenantId) {
    throw new Error('Tenant ID is required but not available. User must login or select workspace.')
  }
  return tenantId
}

// Legacy export for backwards compatibility (DEPRECATED - do not use)
// Will be removed in future versions
export const DEFAULT_TENANT_ID =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? null;
