'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n'
import { 
  PlusIcon,
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  description?: string
  location?: string
  attendees: string[]
  organizer?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'confirmed' | 'tentative' | 'cancelled' | 'completed'
  source?: string
  metadata?: Record<string, unknown>
  recurrence?: string
  reminders: number[]
}

// interface DaySummary {
//   date: string
//   total_events: number
//   total_duration_minutes: number
//   utilization_percent: number
//   events: CalendarEvent[]
//   focus_time_available: number
// }

type ViewMode = 'day' | 'week' | 'month' | 'agenda'

export function CalendarSystem() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showNLPModal, setShowNLPModal] = useState(false)
  const [nlpInput, setNlpInput] = useState('')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)

  // Load events
  useEffect(() => {
    loadEvents()
  }, [currentDate])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/calendar/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        // Fallback to empty array if API fails
        console.warn('Failed to load calendar events, using empty array')
        setEvents([])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleNLPSubmit = async () => {
    if (!nlpInput.trim()) return

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/calendar/schedule/natural-language', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     text: nlpInput,
      //     organizer: 'user',
      //     account_id: accountId
      //   })
      // })
      // const data = await response.json()
      
      // Mock response
      const newEvent: CalendarEvent = {
        id: `event_${Date.now()}`,
        title: nlpInput,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 30 * 60000).toISOString(),
        attendees: [],
        priority: 'medium',
        status: 'confirmed',
        reminders: []
      }
      
      setEvents(prev => [...prev, newEvent])
      setNlpInput('')
      setShowNLPModal(false)
    } catch (error) {
      console.error('Failed to schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.start_time.startsWith(dateStr))
  }

  const getWeekDays = () => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Monday
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    // const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1) // Monday
    
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-[var(--ak-color-bg-surface-muted)] ak-text-secondary',
      medium: 'ak-badge-info',
      high: 'ak-badge-warning',
      urgent: 'ak-badge-danger'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'ak-badge-success',
      tentative: 'ak-badge-warning',
      cancelled: 'ak-badge-danger',
      completed: 'bg-[var(--ak-color-bg-surface-muted)] ak-text-secondary'
    }
    return colors[status as keyof typeof colors] || colors.confirmed
  }

  return (
    <div className="h-full w-full flex flex-col ak-bg-glass">
      {/* Header */}
      <div className="sticky top-0 z-10 ak-bg-glass border-b ak-border-default p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:ak-bg-hover rounded-xl transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold ak-text-primary min-w-[200px]">
              {viewMode === 'day' && currentDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {viewMode === 'week' && `${t('calendar.week')} ${currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`}
              {viewMode === 'month' && currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              {viewMode === 'agenda' && t('calendar.agenda')}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:ak-bg-hover rounded-xl transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-[var(--ak-accent-inbox)] rounded-xl hover:brightness-110 transition-colors text-sm font-medium"
              style={{ color: 'var(--ak-text-primary-dark)' }}
            >
              {t('calendar.today')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex gap-1 bg-[var(--ak-color-bg-surface-muted)] rounded-xl p-1">
              {(['day', 'week', 'month', 'agenda'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'ak-bg-surface-1 ak-accent-icon shadow-sm'
                      : 'ak-text-secondary hover:ak-text-primary'
                  }`}
                  style={viewMode === mode ? { '--ak-color-accent': 'var(--ak-accent-inbox)' } as React.CSSProperties : undefined}
                >
                  {mode === 'day' ? t('calendar.day') : mode === 'week' ? t('calendar.week') : mode === 'month' ? t('calendar.month') : t('calendar.agenda')}
                </button>
              ))}
            </div>

            {/* NLP Scheduling Button */}
            <button
              onClick={() => setShowNLPModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] rounded-xl hover:brightness-110 transition-all shadow-lg ak-shadow-color-accent-inbox-30"
              style={{ color: 'var(--ak-text-primary-dark)' }}
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="font-medium">{t('calendar.aiPlan')}</span>
            </button>

            {/* New Event Button */}
            <button
              onClick={() => setShowNLPModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--ak-accent-inbox)] rounded-xl hover:brightness-110 transition-colors"
              style={{ color: 'var(--ak-text-primary-dark)' }}
            >
              <PlusIcon className="h-5 w-5" />
              {t('calendar.newEvent')}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-2 h-full">
            {getWeekDays().map((day, idx) => {
              const dayEvents = getEventsForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={idx}
                  className={`flex flex-col border border-[var(--ak-color-border-subtle)] rounded-2xl p-3 ${
                    isToday ? 'bg-[var(--ak-accent-inbox-soft)] border-[var(--ak-accent-inbox)]/35' : 'ak-bg-glass'
                  }`}
                >
                  <div className="mb-2">
                    <div className="text-xs ak-text-secondary uppercase font-medium">
                      {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-[var(--ak-accent-inbox)]' : 'ak-text-primary'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="p-2 bg-gradient-to-r from-[var(--ak-accent-inbox-soft)] to-[var(--ak-accent-documents-soft)] rounded-lg border border-[var(--ak-accent-inbox)]/25 cursor-pointer hover:shadow-md transition-all text-xs"
                      >
                        <div className="font-medium ak-text-primary truncate">{event.title}</div>
                        <div className="ak-text-secondary text-[10px]">
                          {new Date(event.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-semibold ak-text-secondary">
                {day}
              </div>
            ))}
            {getMonthDays().map((day, idx) => {
              const dayEvents = getEventsForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              
              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border border-[var(--ak-color-border-subtle)] rounded-xl p-2 ${
                    isToday ? 'bg-[var(--ak-accent-inbox-soft)] border-[var(--ak-accent-inbox)]/35' : 'ak-bg-glass'
                  } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[var(--ak-accent-inbox)]' : 'ak-text-primary'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="p-1.5 bg-[var(--ak-accent-inbox-soft)] rounded text-xs truncate cursor-pointer hover:bg-[var(--ak-accent-inbox-soft)] transition-colors"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs ak-text-secondary">+{dayEvents.length - 3} mehr</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {viewMode === 'agenda' && (
          <div className="space-y-4">
            {events
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 bg-[var(--ak-color-bg-surface)]/60 backdrop-blur-xl rounded-2xl border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)]/50 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className="text-sm font-bold ak-text-primary">
                        {new Date(event.start_time).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-xs ak-text-secondary">
                        {new Date(event.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold ak-text-primary">{event.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-[var(--ak-color-text-secondary)] mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs ak-text-secondary">
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <UserGroupIcon className="h-3 w-3" />
                            <span>{event.attendees.length} Teilnehmer</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* NLP Scheduling Modal */}
      {showNLPModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ak-bg-glass rounded-3xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SparklesIcon className="h-6 w-6 ak-accent-icon" style={{ '--ak-color-accent': 'var(--ak-accent-inbox)' } as React.CSSProperties} />
                <h3 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">AI Terminplanung</h3>
              </div>
              <button
                onClick={() => {
                  setShowNLPModal(false)
                  setNlpInput('')
                }}
                className="p-2 hover:ak-bg-hover rounded-xl transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium ak-text-secondary mb-2">
                  {t('calendar.describeAppointment')}
                </label>
                <textarea
                  value={nlpInput}
                  onChange={(e) => setNlpInput(e.target.value)}
                  placeholder={`${t('calendar.example1')} oder ${t('calendar.example2')}`}
                  rows={4}
                  className="w-full px-4 py-3 border ak-border-default rounded-xl ak-focus-ring transition-all"
                />
              </div>

              <div className="bg-[var(--ak-accent-inbox-soft)] rounded-xl p-4 border border-[var(--ak-accent-inbox)]/25">
                <div className="flex items-start gap-2">
                  <SparklesIcon className="h-5 w-5 text-[var(--ak-accent-inbox)] mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium ak-text-primary mb-1">Beispiele:</div>
                    <ul className="text-xs ak-text-secondary space-y-1">
                      <li>• &quot;Termin mit Max morgen um 14 Uhr&quot;</li>
                      <li>• &quot;30 Minuten für Projekt-Review nächsten Montag&quot;</li>
                      <li>• &quot;Meeting mit Team nächste Woche Dienstag um 10 Uhr in Raum 5&quot;</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleNLPSubmit}
                  disabled={!nlpInput.trim() || loading}
                  className="flex-1 px-4 py-3 bg-[var(--ak-accent-inbox)] rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  style={{ color: 'var(--ak-text-primary-dark)' }}
                >
                  {loading ? t('calendar.scheduling') : t('calendar.createAppointment')}
                </button>
                <button
                  onClick={() => {
                    setShowNLPModal(false)
                    setNlpInput('')
                  }}
                  className="px-4 py-3 ak-bg-surface-1 border ak-border-default rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                >
                  {t('calendar.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-[var(--ak-color-graphite-base)]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ak-bg-glass rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:ak-bg-hover rounded-xl transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--ak-accent-inbox-soft)] rounded-xl border border-[var(--ak-accent-inbox)]/25">
                  <div className="text-xs ak-text-secondary mb-1">{t('calendar.start')}</div>
                  <div className="font-semibold ak-text-primary">
                    {new Date(selectedEvent.start_time).toLocaleString('de-DE')}
                  </div>
                </div>
                <div className="p-4 bg-[var(--ak-accent-documents-soft)] rounded-xl border border-[var(--ak-accent-documents)]/25">
                  <div className="text-xs ak-text-secondary mb-1">{t('calendar.end')}</div>
                  <div className="font-semibold ak-text-primary">
                    {new Date(selectedEvent.end_time).toLocaleString('de-DE')}
                  </div>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <label className="text-sm font-medium ak-text-secondary mb-1 block">Beschreibung</label>
                  <p className="ak-text-primary">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 ak-text-muted" />
                  <span className="ak-text-primary">{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.attendees.length > 0 && (
                <div>
                  <label className="text-sm font-medium ak-text-secondary mb-2 block">Teilnehmer</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.attendees.map((attendee, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[var(--ak-color-bg-surface-muted)] rounded-lg text-sm">
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t ak-border-default">
                <button className="flex-1 px-4 py-3 bg-[var(--ak-accent-inbox)] rounded-xl hover:brightness-110 transition-colors font-medium" style={{ color: 'var(--ak-text-primary-dark)' }}>
                  {t('calendar.edit')}
                </button>
                <button className="px-4 py-3 bg-[var(--ak-semantic-danger)] rounded-xl hover:brightness-110 transition-colors" style={{ color: 'var(--ak-text-primary-dark)' }}>
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

