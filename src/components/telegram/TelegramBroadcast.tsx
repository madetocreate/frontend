'use client'

import { useState, useEffect } from 'react'
import {
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import {
  appleCardStyle,
  appleSectionTitle,
  appleSubTitle,
  appleGroupedList,
  appleListItem,
  appleInputStyle,
  appleButtonStyle,
  appleAnimationFadeInUp
} from '@/lib/appleDesign'

interface BroadcastHistory {
  id: string
  message: string
  sentAt: string
  sent: number
  failed: number
  status: 'completed' | 'failed' | 'scheduled'
}

export function TelegramBroadcast() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<BroadcastHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    void loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/integrations/telegram/broadcasts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data.broadcasts || [])
      } else {
        throw new Error('Fehler beim Laden der Historie')
      }
    } catch (error) {
      console.error('Failed to load broadcast history:', error)
      setHistory([])
    }
    setLoadingHistory(false)
  }

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Bitte Nachricht eingeben')
      return
    }

    if (!confirm(`Möchten Sie diese Nachricht wirklich an alle Telegram Chats senden?\n\n"${message}"`)) {
      return
    }

    setSending(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/integrations/telegram/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Broadcast erfolgreich!\n\n✅ Gesendet: ${data.sent}\n❌ Fehlgeschlagen: ${data.failed}`)
        setMessage('')
        void loadHistory()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert('Broadcast fehlgeschlagen: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Fehler beim Broadcast: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
    setSending(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`space-y-8 ${appleAnimationFadeInUp}`}>
      {/* Header */}
      <div>
        <h2 className={appleSectionTitle}>
          Broadcasts
        </h2>
        <p className={`${appleSubTitle} mt-1`}>
          Senden Sie Nachrichten an alle Ihre Telegram-Kontakte
        </p>
      </div>

      {/* Send Broadcast */}
      <div className={`${appleCardStyle} p-6 space-y-6`}>
        <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
          Neue Broadcast-Nachricht
        </h3>

        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
            Nachricht
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Geben Sie Ihre Broadcast-Nachricht ein..."
            rows={6}
            className={`${appleInputStyle} min-h-[160px] resize-none`}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-[var(--ak-color-text-muted)]">
              Markdown wird unterstützt
            </p>
            <p className="text-xs text-[var(--ak-color-text-muted)]">
              {message.length} / 4096 Zeichen
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setMessage('')}
            disabled={!message || sending}
            className={appleButtonStyle.ghost}
          >
            Zurücksetzen
          </button>
          <button
            onClick={() => void handleSend()}
            disabled={!message.trim() || sending}
            className={`${appleButtonStyle.primary} flex items-center gap-2`}
          >
            {sending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ak-color-text-inverted)] border-t-transparent" />
                Sende...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5" />
                Broadcast senden
              </>
            )}
          </button>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Broadcast-Historie
          </h3>
          <button
            onClick={() => void loadHistory()}
            className="text-sm font-medium text-[var(--ak-color-accent)] hover:underline"
          >
            Aktualisieren
          </button>
        </div>

        <div className={appleGroupedList}>
          {loadingHistory ? (
            <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">
              Lade Historie...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">
              Noch keine Broadcasts gesendet
            </div>
          ) : (
            history.map((broadcast) => (
              <div
                key={broadcast.id}
                className={appleListItem}
              >
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
                      {formatTime(broadcast.sentAt)}
                    </span>
                    {broadcast.status === 'completed' ? (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] text-[10px] font-medium border border-[var(--ak-semantic-success-soft)]">
                        ERFOLGREICH
                      </span>
                    ) : broadcast.status === 'failed' ? (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] text-[10px] font-medium border border-[var(--ak-semantic-danger-soft)]">
                        FEHLGESCHLAGEN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)] text-[10px] font-medium border border-[var(--ak-semantic-warning-soft)]">
                        GEPLANT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--ak-color-text-primary)] line-clamp-2 leading-relaxed">
                    {broadcast.message}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)] px-2 py-1 rounded-md">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-[var(--ak-semantic-success)]" />
                    {broadcast.sent}
                  </div>
                  {broadcast.failed > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ak-semantic-danger)] bg-[var(--ak-semantic-danger-soft)] px-2 py-1 rounded-md">
                      <XCircleIcon className="h-3.5 w-3.5 text-[var(--ak-semantic-danger)]" />
                      {broadcast.failed}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className={`${appleCardStyle} border-[var(--ak-semantic-info-soft)]/30 bg-[var(--ak-semantic-info-soft)]/30 p-5 flex gap-4`}>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--ak-color-bg-surface)]/60 flex items-center justify-center text-[var(--ak-color-text-inverted)] font-bold">
            💡
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">
            Tipps für erfolgreiche Broadcasts
          </h4>
          <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
            Halten Sie Nachrichten kurz und prägnant. Vermeiden Sie zu häufige Broadcasts (max. 1-2 pro Woche), um die Nutzer nicht zu stören. Nutzen Sie klare Handlungsaufforderungen (Call-to-Action).
          </p>
        </div>
      </div>
    </div>
  )
}

