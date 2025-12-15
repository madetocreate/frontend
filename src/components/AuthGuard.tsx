'use client'

// Auth temporarily disabled for development
export function AuthGuard({ children }: { children: React.ReactNode }) {
  // Always allow access - auth is disabled
  return <>{children}</>
}
