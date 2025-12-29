'use client'

import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '../../i18n'
import { useAuth } from '@/contexts/AuthContext'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'
import { AkButton } from '@/components/ui/AkButton'
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

  const { tenantId } = useAuth()

  useEffect(() => {
    loadTodayEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId])

  const loadTodayEvents = async () => {
    setLoading(true)
    try {
      if (!tenantId) {
        console.warn('Cannot load calendar events: tenantId required')
        setLoading(false)
        return
      }
      const accountId = tenantId
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
      <div className="flex flex-1 flex-col rounded-2xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-6 text-sm">
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
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] px-4 py-2 text-xs font-semibold shadow-lg" style={{ color: 'var(--ak-text-primary-dark)' }}>
            <span className={`mr-2 h-2 w-2 rounded-full ${
              dayLoadInfo.tone === 'low' ? 'bg-[var(--ak-semantic-success)]' :
              dayLoadInfo.tone === 'medium' ? 'bg-[var(--ak-semantic-warning)]' :
              'bg-[var(--ak-semantic-danger)]'
            }`} />
            <span>Auslastung: {dayLoadInfo.label}</span>
          </div>
        </div>

        {/* Stats Widget */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/30 p-4">
            <p className="ak-caption text-[var(--ak-accent-inbox)] mb-1 font-semibold">Termine</p>
            <p className="ak-heading text-2xl font-bold text-[var(--ak-accent-inbox)]">{events.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/30 p-4">
            <p className="ak-caption text-[var(--ak-accent-documents)] mb-1 font-semibold">Fokuszeit</p>
            <p className="ak-heading text-2xl font-bold text-[var(--ak-accent-documents)]">
              {focusSlots.reduce((sum, s) => sum + s.durationMinutes, 0)} Min
            </p>
          </div>
          <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/30 p-4">
            <p className="ak-caption text-[var(--ak-semantic-success)] mb-1 font-semibold">Auslastung</p>
            <p className="ak-heading text-2xl font-bold text-[var(--ak-semantic-success)]">{dayLoadInfo.label}</p>
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
            <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/30 p-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-7 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-purple-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="truncate text-sm font-medium ak-text-primary">
                      {nextEvent.title}
                    </p>
                    {nextEvent.priority && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        nextEvent.priority === 'high' ? 'ak-badge-warning' :
                        nextEvent.priority === 'urgent' ? 'ak-badge-danger' :
                        'ak-badge-info'
                      }`}>
                        {nextEvent.priority}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2 text-[11px] text-[var(--ak-color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {nextEvent.timeRange || `${formatTime(nextEvent.start_time)}–${formatTime(nextEvent.end_time)}`}
                    </span>
                    {nextEvent.source && (
                      <span className="truncate ak-text-muted">
                        · {nextEvent.source}
                      </span>
                    )}
                  </div>
                  {nextEvent.location && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] ak-text-secondary">
                      <MapPinIcon className="h-3 w-3" />
                      <span>{nextEvent.location}</span>
                    </div>
                  )}
                  {nextEvent.attendees && nextEvent.attendees.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] ak-text-secondary">
                      <UserGroupIcon className="h-3 w-3" />
                      <span>{nextEvent.attendees.length} Teilnehmer</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs ak-text-secondary">{t('calendar.noAppointments')}</p>
          )}

          {upcomingEvents.length > 0 && (
            <div className="space-y-2">
              {upcomingEvents.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3 text-sm hover:bg-[var(--ak-color-bg-hover)] transition-all cursor-pointer"
                >
                  <div className="mt-0.5 h-5 w-1 rounded-full bg-gradient-to-b from-[var(--ak-color-border-subtle)] to-[var(--ak-color-border-strong)]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-medium ak-text-primary">
                        {item.title}
                      </p>
                      {item.priority && item.priority !== 'medium' && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.priority === 'high' ? 'ak-badge-warning' :
                          item.priority === 'urgent' ? 'ak-badge-danger' :
                          'bg-[var(--ak-color-bg-surface-muted)] ak-text-secondary'
                        }`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-2 text-[11px] text-[var(--ak-color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {item.timeRange || `${formatTime(item.start_time)}–${formatTime(item.end_time)}`}
                      </span>
                      {item.source && (
                        <span className="truncate ak-text-muted">
                          · {item.source}
                        </span>
                      )}
                    </div>
                    {item.location && (
                      <p className="mt-0.5 text-[11px] ak-text-secondary flex items-center gap-1">
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
              <span className="text-[10px] ak-text-secondary">
                {Math.floor(daySummary.focus_time_available)} {t('calendar.focusTimeAvailable')}
              </span>
            )}
          </div>

          {focusSlots.length === 0 ? (
            <p className="mt-2 text-xs ak-text-secondary">
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
                        ? 'border-[var(--ak-accent-inbox)] bg-gradient-to-r from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] shadow-lg'
                        : 'ak-border-default ak-bg-glass hover:border-[var(--ak-accent-inbox)]/35 hover:bg-[var(--ak-accent-inbox-soft)]',
                    )}
                  >
                    <div
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        isSelected ? 'bg-[var(--ak-surface-1)]/20' : 'bg-[var(--ak-accent-inbox-soft)]',
                      )}
                    >
                      <BoltIcon
                        className={clsx(
                          'h-4 w-4',
                          isSelected ? '' : 'text-[var(--ak-accent-inbox)]',
                        )}
                        style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span
                        className={clsx(
                          'text-[11px] font-medium',
                          isSelected ? '' : 'ak-text-primary',
                        )}
                        style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                      >
                        Fokusblock · {slot.label}
                      </span>
                      <span
                        className={clsx(
                          'text-[11px]',
                          isSelected ? '' : 'ak-text-secondary',
                        )}
                        style={isSelected ? { color: 'var(--ak-text-primary-dark)', opacity: 0.8 } : undefined}
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
            <AkButton
              variant="primary"
              className="flex-1"
            >
              <SparklesIcon className="h-4 w-4" />
              {t('calendar.aiPlan')}
            </AkButton>
            <AkButton
              variant="secondary"
              disabled={!selectedFocusSlot}
              className="flex-1"
            >
              <CalendarIcon className="h-4 w-4" />
              {t('calendar.planFocusBlock')}
            </AkButton>
          </div>
          
          {/* Quick Actions Widget */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-4 text-left hover:bg-[var(--ak-color-bg-hover)] transition-all"
            >
              <ChartBarIcon className="h-5 w-5 text-[var(--ak-accent-inbox)] mb-2" />
              <p className="ak-body text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">Analytics</p>
              <p className="ak-caption text-xs text-[var(--ak-color-text-secondary)]">Kalender-Statistiken</p>
            </button>
            <button
              type="button"
              className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-4 text-left hover:bg-[var(--ak-color-bg-hover)] transition-all"
            >
              <SparklesIcon className="h-5 w-5 text-[var(--ak-accent-documents)] mb-2" />
              <p className="ak-body text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">KI-Optimierung</p>
              <p className="ak-caption text-xs text-[var(--ak-color-text-secondary)]">Terminplan optimieren</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
