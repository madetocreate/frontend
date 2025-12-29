'use client'

import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '../../i18n'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

type CalendarCell = {
  id: string
  date: Date
  label: string
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
  eventCount?: number
}

type CalendarWeek = CalendarCell[]

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  })
}

function formatSelectedDate(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function buildCalendarWeeks(
  viewDate: Date, 
  selectedDate: Date | null,
  events: Array<{ start_time: string }> = []
): CalendarWeek[] {
  const firstOfMonth = startOfMonth(viewDate)
  const today = new Date()

  const month = firstOfMonth.getMonth()
  const year = firstOfMonth.getFullYear()

  const firstDayOfWeek = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - firstDayOfWeek)

  const weeks: CalendarWeek[] = []
  const current = new Date(gridStart)

  const lastDayOfMonth = new Date(year, month + 1, 0)
  const totalDaysInMonth = lastDayOfMonth.getDate()
  const weeksNeeded = Math.ceil((firstDayOfWeek + totalDaysInMonth) / 7)
  
  for (let weekIndex = 0; weekIndex < weeksNeeded; weekIndex += 1) {
    const week: CalendarWeek = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const cellDate = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
      )
      const inMonth = cellDate.getMonth() === month
      const isToday = isSameDate(cellDate, today)
      const isSelected = selectedDate ? isSameDate(cellDate, selectedDate) : false
      
      // Count events for this day
      const dateStr = cellDate.toISOString().split('T')[0]
      const eventCount = events.filter(e => e.start_time.startsWith(dateStr)).length

      const id = cellDate.toISOString().slice(0, 10)

      week.push({
        id,
        date: cellDate,
        label: String(cellDate.getDate()),
        inMonth,
        isToday,
        isSelected,
        eventCount,
      })

      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

type CalendarSidebarWidgetProps = {
  onOpenDetails?: () => void
  onNLPSchedule?: () => void
}

export function CalendarSidebarWidget({ onOpenDetails, onNLPSchedule }: CalendarSidebarWidgetProps) {
  const { t } = useTranslation()
  const [viewDate, setViewDate] = useState<Date>(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date())
  const [events] = useState<Array<{ start_time: string }>>([])
  const [todayEvents, setTodayEvents] = useState<Array<{ title: string; start_time: string; end_time: string; location?: string }>>([])

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { authedFetch } = await import('@/lib/api/authedFetch')
        const response = await authedFetch('/api/calendar/events')
        if (response.ok) {
          const data = await response.json()
          const loadedEvents = data.events || []
          // Load today's events
          const today = new Date().toISOString().split('T')[0]
          const todayEventsList = loadedEvents.filter((e: { start_time: string }) => e.start_time.startsWith(today))
          setTodayEvents(todayEventsList as Array<{ title: string; start_time: string; end_time: string; location?: string }>)
        } else {
          setTodayEvents([])
        }
      } catch (error) {
        console.error('Failed to load events:', error)
        setTodayEvents([])
      }
    }
    loadEvents()
  }, [viewDate])

  const { monthLabel, weeks, selectedDateText } = useMemo(() => {
    return {
      monthLabel: formatMonthLabel(viewDate),
      weeks: buildCalendarWeeks(viewDate, selectedDate, events),
      selectedDateText: formatSelectedDate(selectedDate),
    }
  }, [viewDate, selectedDate, events])

  const handlePrevMonth = () => {
    setViewDate((prev) => addMonths(prev, -1))
  }

  const handleNextMonth = () => {
    setViewDate((prev) => addMonths(prev, 1))
  }

  const handleGotoToday = () => {
    const today = new Date()
    setViewDate(today)
    setSelectedDate(today)
  }

  const handleSelectDate = (cell: CalendarCell) => {
    setSelectedDate(cell.date)
    setViewDate(cell.date)
  }
  
  const handleClickNewEntry = () => {
    if (onOpenDetails) {
      onOpenDetails()
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border ak-border-default ak-bg-glass p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] text-xs font-semibold shadow-lg" style={{ color: 'var(--ak-text-primary-dark)' }}>
          <span>AK</span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide ak-text-muted">
            Kalender
          </p>
          <p className="text-sm font-semibold ak-text-primary">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border ak-border-default ak-bg-surface-1 ak-text-secondary shadow-sm transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleGotoToday}
            className="inline-flex h-7 items-center justify-center rounded-full border ak-border-default bg-[var(--ak-accent-inbox)] px-3 text-xs font-medium shadow-sm transition-all hover:brightness-110"
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            {t('calendar.today')}
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border ak-border-default ak-bg-surface-1 ak-text-secondary shadow-sm transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            aria-label="Nächster Monat"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <div className="flex justify-between text-[10px] ak-text-secondary font-medium">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="flex h-6 w-8 items-center justify-center">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-1 space-y-1.5">
          {weeks.map((week) => (
            <div key={week[0]?.id} className="flex justify-between">
              {week.map((cell) => {
                const isMuted = !cell.inMonth
                const isSelected = cell.isSelected
                const isToday = cell.isToday

                return (
                  <div key={cell.id} className="flex w-8 flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSelectDate(cell)}
                      className={clsx(
                        'relative inline-flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-200',
                        isSelected
                          ? 'bg-gradient-to-br from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] shadow-lg'
                          : isToday
                            ? 'border-2 border-[var(--ak-accent-inbox)] bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)] font-semibold'
                            : 'border border-transparent ak-text-secondary hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-hover)]',
                        isMuted &&
                          !isSelected &&
                          !isToday &&
                          'ak-text-muted opacity-50 hover:bg-transparent hover:border-transparent',
                      )}
                    >
                      {cell.label}
                      {cell.eventCount && cell.eventCount > 0 && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--ak-accent-inbox)]" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 border-t ak-border-default pt-3">
        {/* Today's Events */}
        <div className="mb-3">
          <h3 className="text-xs font-semibold ak-text-primary mb-2">
            {t('calendar.whatsOnToday')}
          </h3>
          <div className="space-y-2">
            {todayEvents.length === 0 ? (
              <p className="text-xs ak-text-secondary">{t('calendar.noEventsToday')}</p>
            ) : (
              todayEvents.slice(0, 2).map((event, idx) => (
                <div key={idx} className="rounded-lg border ak-border-default ak-bg-glass p-2 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${
                      idx === 0 ? 'bg-[var(--ak-accent-inbox)]' : 'bg-[var(--ak-semantic-success)]'
                    }`} />
                    <div className="flex-1">
                      <p className="text-xs font-medium ak-text-primary truncate">
                        {event.title}
                      </p>
                      <p className="text-[10px] ak-text-secondary flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <button
              type="button"
              onClick={handleClickNewEntry}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--ak-accent-inbox)] px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:brightness-110"
              style={{ color: 'var(--ak-text-primary-dark)' }}
            >
              <PlusIcon className="mr-1.5 h-3 w-3" />
              {t('calendar.newEntry')}
            </button>
            <p className="text-[10px] ak-text-secondary">
              {t('calendar.createNewAppointment')}
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <button
              type="button"
              onClick={onNLPSchedule}
              className="inline-flex items-center justify-center rounded-xl border ak-border-default bg-gradient-to-r from-[var(--ak-accent-inbox-soft)] to-[var(--ak-accent-documents-soft)] px-3 py-1.5 text-xs font-medium text-[var(--ak-accent-inbox)] shadow-sm transition-all hover:brightness-110"
            >
              <SparklesIcon className="mr-1.5 h-3 w-3" />
              {t('calendar.aiPlan')}
            </button>
            <p className="text-[10px] ak-text-secondary">
              {t('calendar.aklowSuggests')}
            </p>
          </div>
        </div>
        {selectedDateText && (
          <p className="mt-3 text-[10px] ak-text-secondary">
            {t('calendar.selected')}:{' '}
            <span className="font-medium ak-text-primary">{selectedDateText}</span>
          </p>
        )}
      </div>
    </div>
  )
}
