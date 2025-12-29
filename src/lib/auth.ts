/**
 * Auth Client - Centralized Authentication Utilities
 * 
 * Source of Truth: JWT Token from Node Backend
 * All auth operations go through Node Backend (not Control Plane)
 */

export interface AuthTokenPayload {
  userId: string
  tenantId: string
  role: string
  kind?: string
  iat?: number
  exp?: number
  [key: string]: unknown
}

export interface Session {
  user: {
    id: string
    email: string
    name?: string
    tenantId: string
    role: string
    provider?: 'email' | 'google' | 'apple'
  }
  token: string
}

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
 * Extract tenantId from JWT token (client-side decode, no verification)
 * For verification, always use server-side or verify with backend
 */
function extractTenantIdFromToken(token: string | null): string | null {
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    
    const decoded = base64UrlDecode(parts[1])
    if (!decoded) return null
    
    const parsed = JSON.parse(decoded)
    
    return parsed.tenantId || parsed.tenant_id || null
  } catch {
    return null
  }
}

/**
 * Decode JWT token payload (client-side, no verification)
 * For production, always verify tokens server-side
 */
export function decodeToken(token: string | null): AuthTokenPayload | null {
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    
    const decoded = base64UrlDecode(parts[1])
    if (!decoded) return null
    
    const parsed = JSON.parse(decoded)
    
    return parsed as AuthTokenPayload
  } catch {
    return null
  }
}

/**
 * Get auth token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Set auth token in localStorage
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
}

/**
 * Clear auth token from localStorage
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  localStorage.removeItem('refresh_token')
}

/**
 * Get current session (decoded from token)
 * Returns null if no token or invalid token
 */
export function getSession(): Session | null {
  const token = getToken()
  if (!token) return null
  
  const payload = decodeToken(token)
  if (!payload || !payload.userId || !payload.tenantId) {
    return null
  }
  
  // Try to get user data from localStorage (set during login)
  let userData: any = null
  try {
    const stored = localStorage.getItem('user')
    if (stored) {
      userData = JSON.parse(stored)
    }
  } catch {
    // Invalid user data, ignore
  }
  
  return {
    user: {
      id: payload.userId,
      email: userData?.email || '',
      name: userData?.name,
      tenantId: payload.tenantId,
      role: payload.role || 'tenant_user',
      provider: userData?.provider || 'email',
    },
    token,
  }
}

/**
 * Get tenantId from token (primary source of truth)
 */
export function getTenantIdFromToken(): string | null {
  const token = getToken()
  return extractTenantIdFromToken(token)
}

