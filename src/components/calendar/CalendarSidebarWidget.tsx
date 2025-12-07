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

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
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

  const handleClickAklow = () => {
    if (onOpenDetails) {
      onOpenDetails()
    }
  }


  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-[var(--ak-color-bg-surface)]/90 p-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-sm">
          <span>AK</span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Kalender
          </p>
          <p className="text-xs font-semibold text-slate-900">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleGotoToday}
            className="inline-flex h-7 items-center justify-center rounded-full border border-slate-200 bg-slate-900 px-3 text-[11px] font-medium text-slate-50 shadow-sm hover:bg-slate-800"
          >
            Heute
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Nächster Monat"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <div className="flex justify-between text-[11px] text-slate-400">
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
                        'inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition-colors',
                        isSelected
                          ? 'bg-slate-900 text-slate-50 shadow-sm'
                          : isToday
                            ? 'border border-slate-900/20 bg-slate-900/5 text-slate-900'
                            : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50',
                        isMuted &&
                          !isSelected &&
                          !isToday &&
                          'text-slate-300 hover:bg-transparent hover:border-transparent',
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

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <button
              type="button"
              onClick={handleClickNewEntry}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-50 shadow-sm hover:bg-slate-800"
            >
              <PlusIcon className="mr-1.5 h-3 w-3" />
              Neuer Eintrag
            </button>
            <p className="text-[11px] text-slate-500">
              Erstelle einen neuen Termin oder eine Erinnerung.
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-sky-50 px-3 py-1.5 text-[11px] font-medium text-sky-700 shadow-sm hover:bg-sky-100"
            >
              Aklow
            </button>
            <p className="text-[11px] text-slate-500">
              Aklow schlägt dir passende Events und Fokusblöcke vor.
            </p>
          </div>
        </div>
        {selectedDateText ? (
          <p className="mt-3 text-[11px] text-slate-400">
            Ausgewählt:{' '}
            <span className="font-medium text-slate-700">{selectedDateText}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}