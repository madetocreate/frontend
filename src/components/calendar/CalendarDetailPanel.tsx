'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { BoltIcon } from '@heroicons/react/24/outline'

type CalendarEvent = {
  id: string
  title: string
  timeRange: string
  source?: string
  location?: string
}

type FocusSlot = {
  id: string
  label: string
  startTime: string
  endTime: string
  durationMinutes: number
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Weekly Sync mit Team',
    timeRange: '09:30–10:00',
    source: 'Google Kalender',
    location: 'Zoom',
  },
  {
    id: 'e2',
    title: 'Deep Work: Aklow Roadmap',
    timeRange: '10:30–12:00',
    source: 'Kalender · Fokus',
  },
  {
    id: 'e3',
    title: 'Kundencall: Launch-Kampagne',
    timeRange: '15:00–16:00',
    source: 'CRM Kalender',
    location: 'Google Meet',
  },
]

const MOCK_FOCUS_SLOTS: FocusSlot[] = [
  {
    id: 'fs1',
    label: 'Morgen',
    startTime: '08:30',
    endTime: '10:00',
    durationMinutes: 90,
  },
  {
    id: 'fs2',
    label: 'Mittag',
    startTime: '11:00',
    endTime: '12:30',
    durationMinutes: 90,
  },
  {
    id: 'fs3',
    label: 'Später Nachmittag',
    startTime: '16:00',
    endTime: '18:00',
    durationMinutes: 120,
  },
]

function computeDayLoadLabel(events: CalendarEvent[]): { label: string; tone: 'low' | 'medium' | 'high' } {
  if (events.length <= 1) {
    return { label: 'Leicht', tone: 'low' }
  }
  if (events.length === 2) {
    return { label: 'Mittel', tone: 'medium' }
  }
  return { label: 'Voll', tone: 'high' }
}

function getDayLabel(): string {
  const today = new Date()
  return today.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function CalendarDetailPanel() {
  const [events] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [focusSlots] = useState<FocusSlot[]>(MOCK_FOCUS_SLOTS)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const dayLabel = useMemo(() => getDayLabel(), [])
  const dayLoadInfo = useMemo(() => computeDayLoadLabel(events), [events])

  const nextEvent = events[0] ?? null
  const upcomingEvents = events.slice(1)

  const selectedFocusSlot = focusSlots.find((slot) => slot.id === selectedSlotId) ?? null

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200/80 bg-[var(--ak-color-bg-surface)]/90 p-4 text-sm text-slate-700 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Heute
            </p>
            <p className="text-xs font-semibold text-slate-900">{dayLabel}</p>
          </div>
          <div className="ml-auto inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-50 shadow-sm">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Auslastung: {dayLoadInfo.label}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Nächste Termine
          </p>

          {nextEvent ? (
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-7 w-1.5 rounded-full bg-sky-400" />
                <div className="flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {nextEvent.title}
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-2 text-[11px] text-slate-500">
                    <span>{nextEvent.timeRange}</span>
                    {nextEvent.source ? (
                      <span className="truncate text-slate-400">
                        · {nextEvent.source}
                      </span>
                    ) : null}
                  </div>
                  {nextEvent.location ? (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {nextEvent.location}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Keine Termine anstehend.</p>
          )}

          {upcomingEvents.length > 0 ? (
            <div className="mt-3 space-y-2">
              {upcomingEvents.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/80 p-2.5 text-[11px] shadow-sm"
                >
                  <div className="mt-0.5 h-5 w-1 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <p className="truncate text-xs font-medium text-slate-900">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex items-baseline gap-2 text-[11px] text-slate-500">
                      <span>{item.timeRange}</span>
                      {item.source ? (
                        <span className="truncate text-slate-400">
                          · {item.source}
                        </span>
                      ) : null}
                    </div>
                    {item.location ? (
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {item.location}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Fokus-Zeiten
          </p>

          {focusSlots.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              Heute ist kaum Zeit für Fokusarbeit.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {focusSlots.map((slot) => {
                const isSelected = selectedFocusSlot && selectedFocusSlot.id === slot.id

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={clsx(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-[11px] transition-colors',
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-slate-50 shadow-sm'
                        : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <div
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        isSelected ? 'bg-slate-50/10' : 'bg-slate-900/5',
                      )}
                    >
                      <BoltIcon
                        className={clsx(
                          'h-4 w-4',
                          isSelected ? 'text-slate-50' : 'text-slate-700',
                        )}
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span
                        className={clsx(
                          'text-[11px] font-medium',
                          isSelected ? 'text-slate-50' : 'text-slate-900',
                        )}
                      >
                        Fokusblock · {slot.label}
                      </span>
                      <span
                        className={clsx(
                          'text-[11px]',
                          isSelected ? 'text-slate-200' : 'text-slate-500',
                        )}
                      >
                        {slot.startTime}–{slot.endTime} · {slot.durationMinutes} Min
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              disabled={!selectedFocusSlot}
              className={clsx(
                'inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-medium shadow-sm',
                selectedFocusSlot
                  ? 'bg-slate-900 text-slate-50 hover:bg-slate-800'
                  : 'cursor-not-allowed bg-slate-100 text-slate-400',
              )}
            >
              Fokusblock planen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
