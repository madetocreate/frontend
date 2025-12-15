'use client'

import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '../../i18n'
import { 
  BoltIcon, 
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  timeRange?: string
  source?: string
  location?: string
  attendees?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'confirmed' | 'tentative' | 'cancelled'
}

interface FocusSlot {
  id: string
  label: string
  startTime: string
  endTime: string
  durationMinutes: number
}

interface DaySummary {
  date: string
  total_events: number
  total_duration_minutes: number
  utilization_percent: number
  events: CalendarEvent[]
  focus_time_available: number
}

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
  const { t } = useTranslation()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [focusSlots, setFocusSlots] = useState<FocusSlot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [daySummary] = useState<DaySummary | null>(null)

  useEffect(() => {
    loadTodayEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTodayEvents = async () => {
    try {
      // TODO: Replace with actual API call
      // const accountId = 'default' // TODO: Get from auth context
      // const today = new Date().toISOString().split('T')[0]
      // const response = await fetch(`/api/v1/calendar/day/${today}?account_id=${accountId}`)
      // const data = await response.json()
      // setDaySummary(data.summary)
      // setEvents(data.summary.events || [])
      
      // Calculate focus slots from day summary
      if (daySummary) {
        const slots = calculateFocusSlots(daySummary)
        setFocusSlots(slots)
      } else {
        // Mock data
        setEvents([
          {
            id: 'e1',
            title: 'Weekly Sync mit Team',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 30 * 60000).toISOString(),
            timeRange: '09:30–10:00',
            source: 'Google Kalender',
            location: 'Zoom',
            priority: 'medium',
            status: 'confirmed'
          },
          {
            id: 'e2',
            title: 'Deep Work: Aklow Roadmap',
            start_time: new Date(Date.now() + 60 * 60000).toISOString(),
            end_time: new Date(Date.now() + 150 * 60000).toISOString(),
            timeRange: '10:30–12:00',
            source: 'Kalender · Fokus',
            priority: 'high',
            status: 'confirmed'
          },
          {
            id: 'e3',
            title: 'Kundencall: Launch-Kampagne',
            start_time: new Date(Date.now() + 300 * 60000).toISOString(),
            end_time: new Date(Date.now() + 360 * 60000).toISOString(),
            timeRange: '15:00–16:00',
            source: 'CRM Kalender',
            location: 'Google Meet',
            priority: 'high',
            status: 'confirmed'
          },
        ])
        
        setFocusSlots([
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
        ])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateFocusSlots = (summary: DaySummary): FocusSlot[] => {
    // Calculate available focus time slots
    const slots: FocusSlot[] = []
    // const workStart = 9 * 60 // 9:00 in minutes
    // const workEnd = 17 * 60 // 17:00 in minutes
    
    // Simple algorithm: find gaps between events
    // This is a simplified version - real implementation would be more sophisticated
    if (summary.focus_time_available > 60) {
      slots.push({
        id: 'focus1',
        label: 'Fokuszeit verfügbar',
        startTime: '09:00',
        endTime: '17:00',
        durationMinutes: Math.floor(summary.focus_time_available),
      })
    }
    
    return slots
  }

  const dayLabel = useMemo(() => getDayLabel(), [])
  const dayLoadInfo = useMemo(() => computeDayLoadLabel(events), [events])

  const nextEvent = events[0] ?? null
  const upcomingEvents = events.slice(1)

  const selectedFocusSlot = focusSlots.find((slot) => slot.id === selectedSlotId) ?? null

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-1 flex-col rounded-2xl border border-gray-200/50 bg-white/60 backdrop-blur-2xl p-4 text-sm text-gray-700 shadow-lg">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Heute
            </p>
            <p className="text-xs font-semibold text-gray-900">{dayLabel}</p>
          </div>
          <div className="ml-auto inline-flex items-center rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              dayLoadInfo.tone === 'low' ? 'bg-emerald-400' :
              dayLoadInfo.tone === 'medium' ? 'bg-amber-400' :
              'bg-red-400'
            }`} />
            <span>Auslastung: {dayLoadInfo.label}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Nächste Termine
          </p>

          {nextEvent ? (
            <div className="mt-2 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50/80 to-white/80 p-3 text-xs shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-7 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-purple-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {nextEvent.title}
                    </p>
                    {nextEvent.priority && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        nextEvent.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                        nextEvent.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {nextEvent.priority}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {nextEvent.timeRange || `${formatTime(nextEvent.start_time)}–${formatTime(nextEvent.end_time)}`}
                    </span>
                    {nextEvent.source && (
                      <span className="truncate text-gray-400">
                        · {nextEvent.source}
                      </span>
                    )}
                  </div>
                  {nextEvent.location && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPinIcon className="h-3 w-3" />
                      <span>{nextEvent.location}</span>
                    </div>
                  )}
                  {nextEvent.attendees && nextEvent.attendees.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                      <UserGroupIcon className="h-3 w-3" />
                      <span>{nextEvent.attendees.length} Teilnehmer</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-500">{t('calendar.noAppointments')}</p>
          )}

          {upcomingEvents.length > 0 && (
            <div className="mt-3 space-y-2">
              {upcomingEvents.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white/80 p-2.5 text-[11px] shadow-sm hover:shadow-md transition-all"
                >
                  <div className="mt-0.5 h-5 w-1 rounded-full bg-gradient-to-b from-gray-300 to-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-medium text-gray-900">
                        {item.title}
                      </p>
                      {item.priority && item.priority !== 'medium' && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                          item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {item.timeRange || `${formatTime(item.start_time)}–${formatTime(item.end_time)}`}
                      </span>
                      {item.source && (
                        <span className="truncate text-gray-400">
                          · {item.source}
                        </span>
                      )}
                    </div>
                    {item.location && (
                      <p className="mt-0.5 text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {item.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {t('calendar.focusTime')}
            </p>
            {daySummary && (
              <span className="text-[10px] text-gray-500">
                {Math.floor(daySummary.focus_time_available)} {t('calendar.focusTimeAvailable')}
              </span>
            )}
          </div>

          {focusSlots.length === 0 ? (
            <p className="mt-2 text-xs text-gray-500">
              {t('calendar.noFocusTime')}
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
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-[11px] transition-all duration-200',
                      isSelected
                        ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'border-gray-200 bg-white/80 hover:border-blue-300 hover:bg-blue-50/50',
                    )}
                  >
                    <div
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        isSelected ? 'bg-white/20' : 'bg-blue-100',
                      )}
                    >
                      <BoltIcon
                        className={clsx(
                          'h-4 w-4',
                          isSelected ? 'text-white' : 'text-blue-600',
                        )}
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span
                        className={clsx(
                          'text-[11px] font-medium',
                          isSelected ? 'text-white' : 'text-gray-900',
                        )}
                      >
                        Fokusblock · {slot.label}
                      </span>
                      <span
                        className={clsx(
                          'text-[11px]',
                          isSelected ? 'text-white/80' : 'text-gray-500',
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

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <SparklesIcon className="h-3 w-3" />
              {t('calendar.aiPlan')}
            </button>
            <button
              type="button"
              disabled={!selectedFocusSlot}
              className={clsx(
                'inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-medium shadow-sm transition-all',
                selectedFocusSlot
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400',
              )}
            >
              {t('calendar.planFocusBlock')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
