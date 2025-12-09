'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

type CalendarCell = {
  id: string
  date: Date
  label: string
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
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

function buildCalendarWeeks(viewDate: Date, selectedDate: Date | null): CalendarWeek[] {
  const firstOfMonth = startOfMonth(viewDate)
  const today = new Date()

  const month = firstOfMonth.getMonth()
  const year = firstOfMonth.getFullYear()

  const firstDayOfWeek = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - firstDayOfWeek)

  const weeks: CalendarWeek[] = []
  const current = new Date(gridStart)

  // Nur einen Monat zeigen (4-5 Wochen statt 6)
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();
  const weeksNeeded = Math.ceil((firstDayOfWeek + totalDaysInMonth) / 7);
  
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

      const id = cellDate.toISOString().slice(0, 10)

      week.push({
        id,
        date: cellDate,
        label: String(cellDate.getDate()),
        inMonth,
        isToday,
        isSelected,
      })

      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

type CalendarSidebarWidgetProps = {
  onOpenDetails?: () => void
}

export function CalendarSidebarWidget({ onOpenDetails }: CalendarSidebarWidgetProps) {
  const [viewDate, setViewDate] = useState<Date>(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date())

  const { monthLabel, weeks, selectedDateText } = useMemo(() => {
    return {
      monthLabel: formatMonthLabel(viewDate),
      weeks: buildCalendarWeeks(viewDate, selectedDate),
      selectedDateText: formatSelectedDate(selectedDate),
    }
  }, [viewDate, selectedDate])

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

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/90 p-3 shadow-[var(--ak-shadow-soft)] backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--ak-color-accent)] text-xs font-semibold text-white shadow-sm">
          <span>AK</span>
        </div>
        <div className="flex-1">
          <p className="ak-caption font-medium uppercase tracking-wide text-[var(--ak-color-text-muted)]">
            Kalender
          </p>
          <p className="ak-body font-semibold text-[var(--ak-color-text-primary)]">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] ak-caption text-[var(--ak-color-text-primary)] shadow-none transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-surface-muted)]"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleGotoToday}
            className="inline-flex h-7 items-center justify-center rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-accent)] px-3 ak-caption font-medium text-white shadow-sm transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-accent)]/90"
          >
            Heute
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] ak-caption text-[var(--ak-color-text-primary)] shadow-none transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-surface-muted)]"
            aria-label="Nächster Monat"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <div className="flex justify-between ak-caption text-[var(--ak-color-text-muted)]">
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
                        'inline-flex h-7 w-7 items-center justify-center rounded-full ak-caption transition-colors',
                        isSelected
                          ? 'bg-[var(--ak-color-accent)] text-white shadow-sm'
                          : isToday
                            ? 'border border-[var(--ak-color-accent)]/30 bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-text-primary)]'
                            : 'border border-transparent text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-surface-muted)]',
                        isMuted &&
                          !isSelected &&
                          !isToday &&
                          'text-[var(--ak-color-text-muted)] opacity-50 hover:bg-transparent hover:border-transparent',
                      )}
                    >
                      {cell.label}
                    </button>
                    <div className="h-1 w-1 rounded-full bg-transparent" />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 border-t border-[var(--ak-color-border-subtle)] pt-3">
        {/* Was steht heute an? */}
        <div className="mb-3">
          <h3 className="ak-subheading mb-2 font-semibold text-[var(--ak-color-text-primary)]">
            Was steht heute an?
          </h3>
          <div className="space-y-2">
            {/* Mock-Termine für heute */}
            <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="ak-body font-medium text-[var(--ak-color-text-primary)]">
                    Team-Meeting
                  </p>
                  <p className="ak-caption text-[var(--ak-color-text-secondary)]">
                    10:00 - 11:30 Uhr
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="ak-body font-medium text-[var(--ak-color-text-primary)]">
                    Projekt-Review
                  </p>
                  <p className="ak-caption text-[var(--ak-color-text-secondary)]">
                    14:00 - 15:00 Uhr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <button
              type="button"
              onClick={handleClickNewEntry}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--ak-color-accent)] px-3 py-1.5 ak-caption font-medium text-white shadow-sm transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-accent)]/90"
            >
              <PlusIcon className="mr-1.5 h-3 w-3" />
              Neuer Eintrag
            </button>
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">
              Erstelle einen neuen Termin oder eine Erinnerung.
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-accent-soft)] px-3 py-1.5 ak-caption font-medium text-[var(--ak-color-accent)] shadow-none transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-accent-strong)]"
            >
              Aklow
            </button>
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">
              Aklow schlägt dir passende Events und Fokusblöcke vor.
            </p>
          </div>
        </div>
        {selectedDateText ? (
          <p className="mt-3 ak-caption text-[var(--ak-color-text-muted)]">
            Ausgewählt:{' '}
            <span className="font-medium text-[var(--ak-color-text-primary)]">{selectedDateText}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}