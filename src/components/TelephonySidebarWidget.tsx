'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { PhoneIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export type TelephonyItem = {
  id: string
  title: string
  preview?: string
  time?: string
  caller?: string
  mode?: 'reservierung' | 'termine' | 'support' | 'mailbox'
  duration?: string
  status?: string
}

type TelephonyMode = {
  id: 'reservierung' | 'termine' | 'support' | 'mailbox'
  title: string
  description: string
  todayCalls: number
  missed: number
  selected: boolean
}

type TelephonyCall = {
  id: string
  caller: string
  mode: 'reservierung' | 'termine' | 'support' | 'mailbox'
  duration: string
  status: 'Bot aktiv' | 'Mensch hat übernommen'
}

type TelephonySidebarWidgetProps = {
  onItemClick?: (item: TelephonyItem) => void
}

const MOCK_MODES: TelephonyMode[] = [
  {
    id: 'reservierung',
    title: 'Reservierung',
    description: 'Nimmt Reservierungen automatisch entgegen.',
    todayCalls: 12,
    missed: 2,
    selected: false,
  },
  {
    id: 'termine',
    title: 'Termine',
    description: 'Plant und ändert Termine selbstständig.',
    todayCalls: 9,
    missed: 1,
    selected: false,
  },
  {
    id: 'support',
    title: 'Support',
    description: 'Hilfe bei Kundenanfragen in Echtzeit.',
    todayCalls: 14,
    missed: 3,
    selected: true,
  },
  {
    id: 'mailbox',
    title: 'Mailbox',
    description: 'Zeichnet Sprachnachrichten zuverlässig auf.',
    todayCalls: 7,
    missed: 0,
    selected: false,
  },
]

const MOCK_CALLS: TelephonyCall[] = [
  {
    id: 'c-1001',
    caller: '+49 30 1234567',
    mode: 'support',
    duration: '00:42',
    status: 'Bot aktiv',
  },
  {
    id: 'c-1002',
    caller: 'Frau Schulz',
    mode: 'reservierung',
    duration: '02:15',
    status: 'Mensch hat übernommen',
  },
  {
    id: 'c-1003',
    caller: '+1 415 555 0198',
    mode: 'termine',
    duration: '01:03',
    status: 'Bot aktiv',
  },
]

const MODE_COLORS = {
  reservierung: 'info',
  termine: 'discovery',
  support: 'success',
  mailbox: 'secondary',
} as const

const MODE_LABELS = {
  reservierung: 'Reservierung',
  termine: 'Termine',
  support: 'Support',
  mailbox: 'Mailbox',
} as const

function getModeColor(mode: TelephonyCall['mode']): string {
  const color = MODE_COLORS[mode]
  if (color === 'info') return 'bg-blue-100 text-blue-700 border-blue-200'
  if (color === 'discovery') return 'bg-purple-100 text-purple-700 border-purple-200'
  if (color === 'success') return 'bg-green-100 text-green-700 border-green-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

export function TelephonySidebarWidget({ onItemClick }: TelephonySidebarWidgetProps) {
  const [modes, setModes] = useState<TelephonyMode[]>(MOCK_MODES)
  const [calls] = useState<TelephonyCall[]>(MOCK_CALLS)
  const [status] = useState<'online' | 'degradiert' | 'offline'>('online')
  const [defaultMode] = useState<'reservierung' | 'termine' | 'support' | 'mailbox'>('support')

  const handleModeClick = (modeId: TelephonyMode['id']) => {
    setModes((prev) =>
      prev.map((m) => ({
        ...m,
        selected: m.id === modeId,
      })),
    )
  }

  const handleCallClick = (call: TelephonyCall) => {
    if (onItemClick) {
      onItemClick({
        id: call.id,
        title: call.caller,
        caller: call.caller,
        mode: call.mode,
        duration: call.duration,
        status: call.status,
      })
    }
  }

  const statusColor =
    status === 'online'
      ? 'bg-green-100 text-green-700 border-green-200'
      : status === 'degradiert'
        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
        : 'bg-red-100 text-red-700 border-red-200'

  const statusLabel =
    status === 'online' ? 'Online' : status === 'degradiert' ? 'Degradiert' : 'Offline'

  const defaultModeLabel =
    defaultMode === 'reservierung'
      ? 'Reservierung'
      : defaultMode === 'termine'
        ? 'Termine'
        : defaultMode === 'support'
          ? 'Support'
          : 'Mailbox'

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/95 p-3 shadow-[var(--ak-shadow-soft)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="ak-heading">Telefon-Bot</h2>
        <span
          className={clsx(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
            statusColor,
          )}
        >
          {statusLabel}
        </span>
      </div>

      <p className="ak-caption text-[var(--ak-color-text-secondary)]">
        Standardmodus: {defaultModeLabel}
      </p>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Modi */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption text-[var(--ak-color-text-secondary)]">Modi</p>
        <div className="flex flex-col gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleModeClick(mode.id)}
              className={clsx(
                'group flex w-full items-start gap-3 rounded-[var(--ak-radius-card)] border bg-[var(--ak-color-bg-surface)]/80 p-3 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                mode.selected
                  ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] shadow-[var(--ak-shadow-card)]'
                  : 'border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]',
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="ak-body font-semibold">{mode.title}</p>
                  <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                </div>
                <p className="ak-caption line-clamp-1 text-[var(--ak-color-text-secondary)]">
                  {mode.description}
                </p>
                <p className="ak-caption text-[var(--ak-color-text-muted)]">
                  Heute {mode.todayCalls} Anrufe · {mode.missed} verpasst
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Aktive Anrufe */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption text-[var(--ak-color-text-secondary)]">Aktive Anrufe</p>
        <div className="flex flex-col gap-2">
          {calls.slice(0, 3).map((call) => (
            <button
              key={call.id}
              type="button"
              onClick={() => handleCallClick(call)}
              className="group flex w-full items-start gap-2 rounded-[var(--ak-radius-card)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-2 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:shadow-[var(--ak-shadow-card)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--ak-radius-control)] bg-[var(--ak-color-accent-soft)]">
                <PhoneIcon className="h-4 w-4 text-[var(--ak-color-accent)]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="ak-body truncate font-semibold">{call.caller}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                      getModeColor(call.mode),
                    )}
                  >
                    {MODE_LABELS[call.mode]}
                  </span>
                  <p className="ak-caption text-[var(--ak-color-text-muted)]">
                    Dauer {call.duration} · {call.status}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Heute Summary */}
      <div className="flex flex-col gap-1">
        <p className="ak-caption text-[var(--ak-color-text-secondary)]">Heute</p>
        {modes.map((mode) => (
          <div key={mode.id} className="flex items-center gap-2">
            <p className="ak-body text-[var(--ak-color-text-primary)]">
              {mode.title}: {mode.todayCalls}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
