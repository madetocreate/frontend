'use client'

import { useAuth as useAuthContext } from '@/contexts/AuthContext'
import { useCallback } from 'react'

/**
 * DEPRECATED: Control-Plane Auth wird in Beta nicht mehr verwendet.
 * 
 * Diese Datei nutzt noch Control-Plane für refresh/logout.
 * In Beta wird Auth komplett über Node-Backend gehandhabt.
 * 
 * TODO: Refactor zu Node-Backend Auth-Endpoints:
 * - refreshToken: POST /auth/refresh (noch nicht implementiert)
 * - logout: Kann lokal bleiben (Token wird nur gelöscht)
 * 
 * @deprecated Für Beta: Nutze AuthContext direkt, keine Control-Plane Calls
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

export function useAuth() {
  const auth = useAuthContext()

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        // Refresh token expired or invalid
        if (response.status === 401) {
          auth.logout()
        }
        return false
      }

      const data = await response.json()
      localStorage.setItem('auth_token', data.access_token)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }, [auth])

  const logout = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    
    // Try to logout on server
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        // Ignore errors, logout locally anyway
        console.error('Logout request failed:', error)
      }
    }

    // Clear local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // Call context logout
    auth.logout()
  }, [auth])

  const fetchWithAuth = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = localStorage.getItem('auth_token')
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // If 401, try to refresh token
    if (response.status === 401 && token) {
      const refreshed = await refreshToken()
      if (refreshed) {
        // Retry request with new token
        const newToken = localStorage.getItem('auth_token')
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        })
      }
    }

    return response
  }, [refreshToken])

  return {
    ...auth,
    refreshToken,
    logout,
    fetchWithAuth,
  }
}
