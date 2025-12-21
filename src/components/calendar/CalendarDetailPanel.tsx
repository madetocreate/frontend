'use client'

import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '../../i18n'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'
import { 
  BoltIcon, 
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon
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
  const [loading, setLoading] = useState(false)
  const [focusSlots, setFocusSlots] = useState<FocusSlot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [daySummary] = useState<DaySummary | null>(null)

  useEffect(() => {
    loadTodayEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTodayEvents = async () => {
    setLoading(true)
    try {
      const accountId = 'default' // TODO: Get from auth context
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/calendar/events?account_id=${accountId}&start_date=${today}&end_date=${today}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        // Fallback to mock data if API fails
        setEvents([
          {
            id: 'e1',
            title: 'Weekly Sync mit Team',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 3600000).toISOString(),
            timeRange: '10:00 - 11:00',
            source: 'Google Calendar',
          },
        ])
      }
      
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
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="apple-card flex flex-1 flex-col rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-6 text-sm shadow-[var(--ak-shadow-sm)]">
        {loading && (
          <div className="mb-3 text-xs text-[var(--ak-color-text-secondary)]">
            {t('calendar.loading', 'Lade Termine…')}
          </div>
        )}
        {/* AI Actions & Quick Actions - direkt unter Header */}
        <div className="mb-4 space-y-2">
          <AIActions context="calendar" />
          <QuickActions context="calendar" />
        </div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="ak-caption text-[var(--ak-color-text-secondary)] uppercase tracking-wide mb-1">
              Heute
            </p>
            <p className="ak-heading text-lg text-[var(--ak-color-text-primary)]">{dayLabel}</p>
          </div>
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">
            <span className={`mr-2 h-2 w-2 rounded-full ${
              dayLoadInfo.tone === 'low' ? 'bg-emerald-300' :
              dayLoadInfo.tone === 'medium' ? 'bg-amber-300' :
              'bg-red-300'
            }`} />
            <span>Auslastung: {dayLoadInfo.label}</span>
          </div>
        </div>

        {/* Stats Widget */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
            <p className="ak-caption text-blue-600 mb-1 font-semibold">Termine</p>
            <p className="ak-heading text-2xl font-bold text-blue-900">{events.length}</p>
          </div>
          <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
            <p className="ak-caption text-purple-600 mb-1 font-semibold">Fokuszeit</p>
            <p className="ak-heading text-2xl font-bold text-purple-900">
              {focusSlots.reduce((sum, s) => sum + s.durationMinutes, 0)} Min
            </p>
          </div>
          <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-green-50 to-green-100/50 p-4">
            <p className="ak-caption text-green-600 mb-1 font-semibold">Auslastung</p>
            <p className="ak-heading text-2xl font-bold text-green-900">{dayLoadInfo.label}</p>
          </div>
        </div>

        <div className="border-t border-[var(--ak-color-border-subtle)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="ak-heading text-base text-[var(--ak-color-text-primary)] flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
              Nächste Termine
            </p>
            {events.length > 0 && (
              <span className="ak-caption text-[var(--ak-color-text-secondary)]">
                {events.length} {events.length === 1 ? 'Termin' : 'Termine'}
              </span>
            )}
          </div>

          {nextEvent ? (
            <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-r from-blue-50 to-purple-50 p-4 shadow-[var(--ak-shadow-sm)] mb-3">
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
            <div className="space-y-2">
              {upcomingEvents.map((item) => (
                <div
                  key={item.id}
                  className="apple-card flex items-start gap-3 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3 text-sm shadow-[var(--ak-shadow-sm)] hover:shadow-[var(--ak-shadow-md)] transition-all cursor-pointer"
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

        {/* AI Suggestions & Quick Actions - in der Mitte */}
        <div className="my-4 flex flex-col gap-3 px-3 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
          <AIActions context="calendar" />
          <QuickActions context="calendar" />
        </div>

        <div className="mt-6 border-t border-[var(--ak-color-border-subtle)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="ak-heading text-base text-[var(--ak-color-text-primary)] flex items-center gap-2">
              <BoltIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
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

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="apple-button-primary flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <SparklesIcon className="h-4 w-4" />
              {t('calendar.aiPlan')}
            </button>
            <button
              type="button"
              disabled={!selectedFocusSlot}
              className={clsx(
                'apple-button-secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                selectedFocusSlot
                  ? 'hover:shadow-md active:scale-[0.98]'
                  : 'opacity-50 cursor-not-allowed',
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {t('calendar.planFocusBlock')}
            </button>
          </div>
          
          {/* Quick Actions Widget */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-4 text-left hover:shadow-md transition-all active:scale-[0.98]"
            >
              <ChartBarIcon className="h-5 w-5 text-blue-600 mb-2" />
              <p className="ak-body text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">Analytics</p>
              <p className="ak-caption text-xs text-[var(--ak-color-text-secondary)]">Kalender-Statistiken</p>
            </button>
            <button
              type="button"
              className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-4 text-left hover:shadow-md transition-all active:scale-[0.98]"
            >
              <SparklesIcon className="h-5 w-5 text-purple-600 mb-2" />
              <p className="ak-body text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">KI-Optimierung</p>
              <p className="ak-caption text-xs text-[var(--ak-color-text-secondary)]">Terminplan optimieren</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
