/**
 * Centralized authenticated fetch wrapper
 * 
 * P0-Blocker A Fix: All /api/* calls MUST include Authorization header
 * This wrapper ensures consistent auth propagation from browser to Next.js API routes.
 * 
 * Usage:
 *   import { authedFetch } from '@/lib/api/authedFetch'
 *   const response = await authedFetch('/api/inbox')
 *   const data = await response.json()
 */

import { getToken } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'

export interface AuthedFetchOptions extends RequestInit {
  /**
   * Skip adding Authorization header (use with caution)
   * Only for public endpoints that don't require auth
   */
  skipAuth?: boolean
  /**
   * Override tenant ID (rarely needed)
   */
  tenantId?: string
}

/**
 * Fetch wrapper that automatically adds Authorization header and x-tenant-id
 * 
 * This is the ONLY way to call /api/* routes from client components.
 * Never use raw fetch('/api/...') - it will fail in production.
 */
export async function authedFetch(
  url: string,
  options: AuthedFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, tenantId, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers)

  // Add Authorization header (unless explicitly skipped)
  if (!skipAuth) {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    } else {
      // In production, warn if no token (will likely fail)
      if (process.env.NODE_ENV === 'production') {
        console.warn(`[authedFetch] No auth token found for ${url}. Request may fail with 401.`)
      }
    }
  }

  // Add tenant ID header
  const effectiveTenantId = tenantId ?? getTenantId()
  if (effectiveTenantId) {
    headers.set('x-tenant-id', effectiveTenantId)
  }

  // Set Content-Type if not already set and body is not FormData
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Execute fetch with auth headers
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Handle 401 - clear tokens and redirect to login
  if (response.status === 401 && !skipAuth) {
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_AUTH_BYPASS) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      // Prevent infinite reload loop when we're already on an auth route.
      // (Some global providers poll /api/* and would otherwise hard-navigate repeatedly.)
      const path = window.location?.pathname || ''
      if (!path.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }
  }

  return response
}

/**
 * Convenience wrapper for JSON responses
 * Automatically parses JSON and throws on non-OK responses
 */
export async function authedFetchJson<T>(
  url: string,
  options: AuthedFetchOptions = {}
): Promise<T> {
  const response = await authedFetch(url, options)

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }

    const error = new Error(
      `API request failed: ${response.status} ${response.statusText}`
    ) as Error & { status: number; data: unknown }
    error.status = response.status
    error.data = errorData
    throw error
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

