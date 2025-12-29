'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { decodeToken, getToken } from '@/lib/auth'

interface User {
  id: string
  email: string
  name?: string
  picture?: string
  isDeveloper?: boolean
  provider: 'email' | 'google' | 'microsoft' | 'apple'
  tenantId?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, userData: User, refreshToken?: string) => void
  logout: () => void
  isAuthenticated: boolean
  tenantId: string | null
  role: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'

// Dev token generated from backend - valid for 24h
// Run: curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123456"}'
const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjAyMzc4NzZlLWRjYjQtNGIwNy1hYzNjLWQyZWE2OTIwNTFiMSIsInVzZXJJZCI6IjAyMzc4NzZlLWRjYjQtNGIwNy1hYzNjLWQyZWE2OTIwNTFiMSIsInJvbGUiOiJ0ZW5hbnRfYWRtaW4iLCJraW5kIjoiYWNjZXNzIiwiaWF0IjoxNzY2OTYwNzA5LCJleHAiOjE3NjcwNDcxMDl9.UxF51YAdxjieEP3uEn8wZq2dnQ1FOL4FzKrDk5Ey5l0'

const MOCK_USER: User = {
  id: '0237876e-dcb4-4b07-ac3c-d2ea692051b1',
  email: 'test@example.com',
  name: 'Test User',
  isDeveloper: process.env.NEXT_PUBLIC_AKLOW_DEV_MODE === 'true',
  provider: 'email',
  tenantId: '0237876e-dcb4-4b07-ac3c-d2ea692051b1',
  role: 'tenant_admin'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(AUTH_BYPASS ? MOCK_USER : null)
  const [loading, setLoading] = useState(!AUTH_BYPASS)
  const router = useRouter()

  useEffect(() => {
    if (user?.isDeveloper) {
      (window as any).__AKLOW_DEV_MODE__ = true
    } else {
      (window as any).__AKLOW_DEV_MODE__ = process.env.NEXT_PUBLIC_AKLOW_DEV_MODE === 'true'
    }
  }, [user])

  useEffect(() => {
    if (AUTH_BYPASS) {
      // Inject dev token into localStorage so authedFetch can use it
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', DEV_TOKEN)
        localStorage.setItem('user', JSON.stringify(MOCK_USER))
      }
      setLoading(false)
      return
    }

    // Check for stored auth
    const token = getToken()
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Extract tenantId and role from token (source of truth)
        const payload = decodeToken(token)
        if (payload) {
          parsedUser.tenantId = payload.tenantId
          parsedUser.role = payload.role
        }
        setUser(parsedUser)
      } catch {
        // Invalid user data, clear storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = (token: string, userData: User, refreshToken?: string) => {
    localStorage.setItem('auth_token', token)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
    // Extract tenantId and role from token (source of truth)
    const payload = decodeToken(token)
    if (payload) {
      userData.tenantId = payload.tenantId
      userData.role = payload.role
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
    setUser(null)
    router.push('/auth/login')
  }

  // Extract tenantId and role from token (source of truth)
  const token = getToken()
  const payload = decodeToken(token)
  const tenantId = payload?.tenantId || user?.tenantId || null
  const role = payload?.role || user?.role || null

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        tenantId,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
