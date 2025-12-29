'use client'

import { useMemo } from 'react'
import { usePushToTalkVoice } from '../hooks/usePushToTalkVoice'

type Props = {
  label?: string
  className?: string
  onAssistantText?: (text: string) => void
  onUserText?: (text: string) => void
  threadId?: string
  tenantId?: string
}

/**
 * Minimal PTT-Button (press-and-hold). Default position is fixed bottom-right.
 */
export function PushToTalkButton({ label = 'PTT', className = '', onAssistantText, onUserText, threadId, tenantId }: Props) {
  const { status, error, startPress, stopPress } = usePushToTalkVoice({ onAssistantText, onUserText, threadId, tenantId })

  const bg = useMemo(() => {
    if (status === 'listening') return 'bg-[var(--ak-semantic-success)]'
    if (status === 'thinking') return 'bg-[var(--ak-semantic-warning)]'
    if (status === 'error') return 'bg-[var(--ak-semantic-danger)]'
    return 'bg-[var(--ak-color-graphite-surface)]'
  }, [status])

  return (
    <div
      className={`fixed bottom-24 right-4 z-40 flex flex-col items-end space-y-1 ${className}`}
    >
      <button
        type="button"
        onMouseDown={startPress}
        onMouseUp={stopPress}
        onMouseLeave={stopPress}
        onTouchStart={(e) => {
          e.preventDefault()
          startPress()
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          stopPress()
        }}
        className={`${bg} px-4 py-3 rounded-full shadow-lg active:scale-95 transition-transform`}
        style={{ color: 'var(--ak-text-primary-dark)' }}
      >
        {label}
      </button>
      <div className="text-xs ak-text-muted ak-bg-glass rounded px-2 py-1 shadow">
        {status === 'listening' && 'Halten & sprechen'}
        {status === 'thinking' && 'Verarbeite…'}
        {status === 'error' && (error || 'Fehler')}
        {status === 'idle' && 'Bereit'}
        {status === 'speaking' && 'Assistant spricht'}
      </div>
    </div>
  )
}

