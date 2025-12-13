'use client'

import type { ReactNode } from 'react'

type InlineCodeProps = {
  children?: ReactNode
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] px-1 py-0.5 rounded font-mono text-sm">
      {children}
    </code>
  )
}
