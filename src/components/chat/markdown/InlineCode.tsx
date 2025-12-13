'use client'

import type { ReactNode } from 'react'

type InlineCodeProps = {
  children?: ReactNode
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="bg-[var(--ak-color-bg-surface-muted)] px-1 py-0.5 rounded font-mono text-sm text-[var(--ak-color-text-primary)]">
      {children}
    </code>
  )
}
