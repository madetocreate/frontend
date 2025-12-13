'use client'

import type { ReactNode } from 'react'

type CodeBlockProps = {
  children?: ReactNode
}

export function CodeBlock({ children }: CodeBlockProps) {
  return (
    <pre className="ak-body bg-[var(--ak-color-bg-surface-muted)] p-4 rounded-lg overflow-x-auto mb-3">
      {children}
    </pre>
  )
}
