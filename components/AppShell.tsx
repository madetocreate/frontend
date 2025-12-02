'use client'

import { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-full">
      {children}
    </div>
  )
}
