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
    if (status === 'listening') return 'bg-green-500'
    if (status === 'thinking') return 'bg-amber-500'
    if (status === 'error') return 'bg-red-500'
    return 'bg-gray-800'
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
        className={`${bg} text-white px-4 py-3 rounded-full shadow-lg active:scale-95 transition-transform`}
      >
        {label}
      </button>
      <div className="text-xs text-gray-500 bg-white/80 rounded px-2 py-1 shadow">
        {status === 'listening' && 'Halten & sprechen'}
        {status === 'thinking' && 'Verarbeite…'}
        {status === 'error' && (error || 'Fehler')}
        {status === 'idle' && 'Bereit'}
        {status === 'speaking' && 'Assistant spricht'}
      </div>
    </div>
  )
}

