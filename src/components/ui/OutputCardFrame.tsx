'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

/**
 * OutputCardFrame - Einheitlicher Wrapper für Output-Karten im Hauptbereich
 * 
 * Gold-Standard: Exakt wie ComposeCard
 * - max-w-3xl: Konsistente maximale Breite (wie Compose-Karte)
 * - mx-auto: Zentrierung im verfügbaren Content-Container
 * - w-full: Volle Breite innerhalb des max-width
 * 
 * Hinweis: px-4 wird vom Container bereitgestellt (z.B. ChatShell, Dashboard-Container)
 */
export function OutputCardFrame({ 
  children, 
  className 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={clsx(
      'mx-auto max-w-3xl w-full',
      className
    )}>
      {children}
    </div>
  )
}

