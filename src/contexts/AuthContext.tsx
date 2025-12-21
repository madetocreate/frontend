'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  picture?: string
  provider: 'email' | 'google' | 'microsoft' | 'apple'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, userData: User, refreshToken?: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth temporarily disabled - use mock user
  const [user, setUser] = useState<User | null>({
    id: 'dev-user',
    email: 'dev@example.com',
    name: 'Dev User',
    provider: 'email'
  })
  const [loading] = useState(false)
  const router = useRouter()

  // Auth check disabled for development
  // useEffect(() => {
  //   // Check for stored auth
  //   const token = localStorage.getItem('auth_token')
  //   const userData = localStorage.getItem('user')

  //   if (token && userData) {
  //     try {
  //       const parsedUser = JSON.parse(userData)
  //       setTimeout(() => setUser(parsedUser), 0)
        
  //       // Verify token is still valid (optional: call /auth/me)
  //       // For now, we'll trust the stored token
  //     } catch {
  //       // Invalid user data, clear storage
  //       localStorage.removeItem('auth_token')
  //       localStorage.removeItem('user')
  //     }
  //   }
    
  //   setTimeout(() => setLoading(false), 0)
  // }, [])

  const login = (token: string, userData: User, refreshToken?: string) => {
    localStorage.setItem('auth_token', token)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
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

