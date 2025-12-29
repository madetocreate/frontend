'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  PhoneIcon,
  PauseIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'

type TelephonyMessage = {
  id: string
  from: 'bot' | 'anrufer'
  text: string
  time: string
}

type TelephonyInfo = {
  hours: Array<{ day: string; time: string }>
  address: string[]
  contacts: {
    phone: string
    email: string
    web: string
  }
}

type TelephonyHistoryItem = {
  id: string
  datetime: string
  nameOrNumber: string
  mode: 'reservierung' | 'termine' | 'support' | 'mailbox'
  summary: string
  status: 'Abgeschlossen' | 'Abgebrochen' | 'Weitergeleitet'
}

type TelephonyItem = {
  id: string
  mode?: string
  caller?: string
  title?: string
  duration?: string
}

type TelephonyDetailPanelProps = {
  item: TelephonyItem | null
}

const MODE_COLORS = {
  reservierung: 'ak-badge-info',
  termine: 'ak-badge-success',
  support: 'ak-badge-warning',
  mailbox: 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] border-[var(--ak-color-border-subtle)]',
} as const

const MODE_LABELS = {
  reservierung: 'Reservierung',
  termine: 'Termine',
  support: 'Support',
  mailbox: 'Mailbox',
} as const

const STATUS_COLORS = {
  Abgeschlossen: 'ak-badge-success',
  Abgebrochen: 'ak-badge-danger',
  Weitergeleitet: 'ak-badge-info',
} as const

const MOCK_MESSAGES: TelephonyMessage[] = [
  {
    id: 'm1',
    from: 'bot',
    text: 'Guten Tag! Sie sprechen mit dem Telefon‑Bot. Wie kann ich Ihnen helfen?',
    time: '10:11',
  },
  {
    id: 'm2',
    from: 'anrufer',
    text: 'Hallo, ich möchte für Samstagabend einen Tisch reservieren.',
    time: '10:11',
  },
  {
    id: 'm3',
    from: 'bot',
    text: 'Sehr gern. Für wie viele Personen und um welche Uhrzeit?',
    time: '10:11',
  },
  {
    id: 'm4',
    from: 'anrufer',
    text: 'Für 4 Personen gegen 19:30 Uhr.',
    time: '10:12',
  },
  {
    id: 'm5',
    from: 'bot',
    text: 'Danke! Ich prüfe die Verfügbarkeit für Samstag, 19:30 Uhr.',
    time: '10:12',
  },
]

const MOCK_INFO: TelephonyInfo = {
  hours: [
    { day: 'Montag–Freitag', time: '09:00–18:00' },
    { day: 'Samstag', time: '10:00–14:00' },
    { day: 'Sonntag', time: 'Geschlossen' },
  ],
  address: ['Musterstraße 12', '10115 Berlin', 'Deutschland'],
  contacts: {
    phone: '+49 30 9876543',
    email: 'info@beispielpraxis.de',
    web: 'www.beispielpraxis.de',
  },
}

const MOCK_HISTORY: TelephonyHistoryItem[] = [
  {
    id: 'c1',
    datetime: '09.12.2025 09:40',
    nameOrNumber: 'Paul Krüger',
    mode: 'termine',
    summary: 'Anfrage für Rückruf am Nachmittag.',
    status: 'Abgeschlossen',
  },
  {
    id: 'c2',
    datetime: '09.12.2025 08:15',
    nameOrNumber: '+49 171 5556677',
    mode: 'support',
    summary: 'Technisches Problem mit Zugangscode.',
    status: 'Weitergeleitet',
  },
  {
    id: 'c3',
    datetime: '08.12.2025 17:02',
    nameOrNumber: 'Mailbox',
    mode: 'mailbox',
    summary: 'Sprachnachricht: Bitte Angebot zusenden.',
    status: 'Abgeschlossen',
  },
  {
    id: 'c4',
    datetime: '08.12.2025 11:27',
    nameOrNumber: '+49 30 445566',
    mode: 'reservierung',
    summary: 'Reservierung für 2 Personen, 12.12., 18 Uhr.',
    status: 'Abgebrochen',
  },
]

export function TelephonyDetailPanel({ item }: TelephonyDetailPanelProps) {
  const [messages] = useState<TelephonyMessage[]>(MOCK_MESSAGES)
  const [info] = useState<TelephonyInfo>(MOCK_INFO)
  const [history] = useState<TelephonyHistoryItem[]>(MOCK_HISTORY)
  const [isLive] = useState(true)
  const [isReplay] = useState(false)

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-sm text-[var(--ak-color-text-muted)]">
          <p className="font-medium text-[var(--ak-color-text-secondary)]">
            Wähle einen Anruf aus
          </p>
          <p className="mt-1">Klicke auf einen Anruf in der linken Sidebar.</p>
        </div>
      </div>
    )
  }

  const mode = (item.mode || 'support') as keyof typeof MODE_COLORS
  const modeColor = MODE_COLORS[mode]
  const modeLabel = MODE_LABELS[mode]

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      {/* Status Card */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/95 p-4 ak-shadow-soft backdrop-blur-xl">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <PhoneIcon className="h-4 w-4 text-[var(--ak-color-accent)]" />
          <span className="ak-caption font-medium text-[var(--ak-color-text-primary)]">
            {isLive ? 'Live-Anruf' : 'Archiviert'}
          </span>
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="ak-heading truncate">{item.caller || item.title}</h2>
              <span
                className={clsx(
                  'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2 py-0.5 text-[11px] font-medium',
                  modeColor,
                )}
              >
                {modeLabel}
              </span>
              {isReplay && (
                <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-color-text-secondary)]">
                  Archiviert
                </span>
              )}
            </div>
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">
              Dauer: {item.duration || '00:02:18'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isReplay}
              onClick={async () => {
                try {
                  const { authedFetch } = await import('@/lib/api/authedFetch')
                  const response = await authedFetch('/api/telephony/calls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'takeover',
                      call_id: item.id,
                      tenant_id: 'default-tenant',
                    }),
                  })
                  if (response.ok) {
                    window.dispatchEvent(
                      new CustomEvent('aklow-notification', {
                        detail: { type: 'success', message: 'Gespräch übernommen' }
                      })
                    )
                  }
                } catch (_error) {
                  console.error('Telephony action error', _error)
                  window.dispatchEvent(
                    new CustomEvent('aklow-notification', {
                      detail: { type: 'error', message: 'Fehler beim Übernehmen' }
                    })
                  )
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:ak-shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PhoneIcon className="h-3.5 w-3.5" />
              Gespräch übernehmen
            </button>
            <button
              type="button"
              disabled={isReplay}
              onClick={async () => {
                try {
                  const { authedFetch } = await import('@/lib/api/authedFetch')
                  const response = await authedFetch('/api/telephony/calls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'pause-bot',
                      call_id: item.id,
                      tenant_id: 'default-tenant',
                    }),
                  })
                  if (response.ok) {
                    window.dispatchEvent(
                      new CustomEvent('aklow-notification', {
                        detail: { type: 'success', message: 'Bot pausiert' }
                      })
                    )
                  }
                } catch (_error) {
                  console.error('Telephony action error', _error)
                  window.dispatchEvent(
                    new CustomEvent('aklow-notification', {
                      detail: { type: 'error', message: 'Fehler beim Pausieren' }
                    })
                  )
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ak-semantic-warning)]/25 bg-[var(--ak-semantic-warning-soft)] px-3 py-1.5 text-[12px] font-medium text-[var(--ak-semantic-warning)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-semantic-warning)]/35 hover:bg-[var(--ak-semantic-warning-soft)] hover:ak-shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PauseIcon className="h-3.5 w-3.5" />
              Bot pausieren
            </button>
            <button
              type="button"
              disabled={isReplay}
              onClick={async () => {
                if (confirm('Anruf wirklich beenden?')) {
                  try {
                    const { authedFetch } = await import('@/lib/api/authedFetch')
                  const response = await authedFetch('/api/telephony/calls', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'end-call',
                        call_id: item.id,
                        tenant_id: 'default-tenant',
                      }),
                    })
                    if (response.ok) {
                      window.dispatchEvent(
                        new CustomEvent('aklow-notification', {
                          detail: { type: 'success', message: 'Anruf beendet' }
                        })
                      )
                    }
                  } catch (_error) {
                    console.error('Telephony action error', _error)
                    window.dispatchEvent(
                      new CustomEvent('aklow-notification', {
                        detail: { type: 'error', message: 'Fehler beim Beenden' }
                      })
                    )
                  }
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ak-semantic-danger)]/25 bg-[var(--ak-semantic-danger-soft)] px-3 py-1.5 text-[12px] font-medium text-[var(--ak-semantic-danger)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-semantic-danger)]/35 hover:bg-[var(--ak-semantic-danger-soft)] hover:ak-shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Call beenden
            </button>
          </div>
        </div>

        <div className="h-px bg-[var(--ak-color-border-subtle)]" />

        {/* AI Suggestions & Quick Actions - in der Mitte */}
        <div className="flex flex-col gap-3 px-3 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
          <AIActions context="telephony" />
          <QuickActions context="telephony" />
        </div>

        {/* Messages */}
        <div className="max-h-[320px] overflow-y-auto rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-2">
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex',
                  msg.from === 'bot' ? 'justify-start' : 'justify-end',
                )}
              >
                <div
                  className={clsx(
                    'flex max-w-[75%] flex-col gap-1',
                    msg.from === 'bot' ? 'items-start' : 'items-end',
                  )}
                >
                  <div
                    className={clsx(
                      'rounded-lg border border-[var(--ak-color-border-subtle)] p-2',
                      msg.from === 'bot'
                        ? 'bg-[var(--ak-color-bg-surface)]'
                        : 'bg-[var(--ak-color-bg-surface-muted)]',
                    )}
                  >
                    <p className="ak-body text-[var(--ak-color-text-primary)]">{msg.text}</p>
                  </div>
                  <p className="ak-caption text-[var(--ak-color-text-muted)]">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-[var(--ak-color-border-subtle)]" />

        {/* Info Box */}
        <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-3">
          <div className="mb-3 flex items-center gap-2">
            <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-accent)]" />
            <h3 className="ak-heading">Öffnungszeiten & Büro-Info</h3>
          </div>

          <div className="flex flex-col gap-3">
            {/* Öffnungszeiten */}
            <div className="flex flex-col gap-1">
              <p className="ak-body font-semibold text-[var(--ak-color-text-primary)]">
                Öffnungszeiten
              </p>
              {info.hours.map((h) => (
                <div key={h.day} className="flex items-center justify-between">
                  <p className="ak-caption text-[var(--ak-color-text-secondary)]">{h.day}</p>
                  <p className="ak-caption text-[var(--ak-color-text-secondary)]">{h.time}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-[var(--ak-color-border-subtle)]" />

            {/* Anschrift */}
            <div className="flex flex-col gap-1">
              <p className="ak-body font-semibold text-[var(--ak-color-text-primary)]">
                Anschrift
              </p>
              {info.address.map((line, idx) => (
                <p key={idx} className="ak-body text-[var(--ak-color-text-secondary)]">
                  {line}
                </p>
              ))}
            </div>

            <div className="h-px bg-[var(--ak-color-border-subtle)]" />

            {/* Kontakt */}
            <div className="flex flex-col gap-1">
              <p className="ak-body font-semibold text-[var(--ak-color-text-primary)]">Kontakt</p>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                <p className="ak-body text-[var(--ak-color-text-primary)]">{info.contacts.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                <p className="ak-body text-[var(--ak-color-text-primary)]">{info.contacts.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                <p className="ak-body text-[var(--ak-color-text-primary)]">{info.contacts.web}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <PhoneIcon className="h-4 w-4 text-[var(--ak-color-accent)]" />
          <h3 className="ak-heading">Letzte Gespräche</h3>
        </div>
        <div className="flex flex-col gap-2">
          {history.map((hist) => (
            <button
              key={hist.id}
              type="button"
              onClick={() => {
                // Load call details
                console.log('Load call history:', hist.id)
                // TODO: Load call details and show in detail panel
              }}
              className="group flex w-full items-center gap-3 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-3 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:ak-shadow-card"
            >
              <div className="w-[140px]">
                <p className="ak-caption text-[var(--ak-color-text-secondary)]">
                  {hist.datetime}
                </p>
              </div>
              <div className="w-[160px]">
                <p className="ak-body truncate font-semibold">{hist.nameOrNumber}</p>
              </div>
              <span
                className={clsx(
                  'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2 py-0.5 text-[11px] font-medium',
                  MODE_COLORS[hist.mode],
                )}
              >
                {MODE_LABELS[hist.mode]}
              </span>
              <div className="flex-1">
                <p className="ak-body truncate text-[var(--ak-color-text-secondary)]">
                  {hist.summary}
                </p>
              </div>
              <span
                className={clsx(
                  'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2 py-0.5 text-[11px] font-medium',
                  STATUS_COLORS[hist.status],
                )}
              >
                {hist.status}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
