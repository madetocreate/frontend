'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
const TOKEN_EXPIRY_BUFFER = 60 * 1000 // 1 minute before expiry

export function AuthTokenRefresh() {
  const { isAuthenticated, refreshToken } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Function to check and refresh token
    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      try {
        // Decode token to check expiry (without verification for client-side check)
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expiry = payload.exp * 1000 // Convert to milliseconds
        const now = Date.now()
        const timeUntilExpiry = expiry - now

        // Refresh if token expires within buffer time
        if (timeUntilExpiry < TOKEN_EXPIRY_BUFFER) {
          await refreshToken()
        }
      } catch (error) {
        // If token is invalid, try to refresh anyway
        console.error('Token check failed:', error)
        await refreshToken()
      }
    }

    // Check immediately
    checkAndRefreshToken()

    // Set up interval
    intervalRef.current = setInterval(checkAndRefreshToken, TOKEN_REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated, refreshToken])

  return null // This component doesn't render anything
}
