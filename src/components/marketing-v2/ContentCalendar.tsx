'use client';

import { useState, useEffect } from 'react';
import { AkButton } from '@/components/ui/AkButton';
import { AkBadge } from '@/components/ui/AkBadge';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  event_type: string;
  content_item_id?: string;
  color?: string;
}

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/marketing/calendar/month/${year}/${month + 1}`
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events_by_day || {});
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  let firstDayWeekday = firstDayOfMonth.getDay() - 1;
  if (firstDayWeekday < 0) firstDayWeekday = 6;

  const days: Array<{
    date: number;
    isCurrentMonth: boolean;
    dateKey: string;
    isToday: boolean;
  }> = [];

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      dateKey: '',
      isToday: false,
    });
  }

  // Current month days
  const today = new Date();
  for (let date = 1; date <= daysInMonth; date++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === date;

    days.push({
      date,
      isCurrentMonth: true,
      dateKey,
      isToday,
    });
  }

  // Next month days to complete the grid
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let date = 1; date <= remainingDays; date++) {
    days.push({
      date,
      isCurrentMonth: false,
      dateKey: '',
      isToday: false,
    });
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
          {MONTH_NAMES[month]} {year}
        </h2>

        <div className="flex items-center gap-2">
          <AkButton variant="secondary" size="sm" onClick={goToToday}>
            Heute
          </AkButton>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[var(--ak-color-bg-surface)] rounded-2xl border border-[var(--ak-color-border-subtle)] overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-[var(--ak-color-border-subtle)]">
          {WEEKDAY_NAMES.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-[var(--ak-color-text-secondary)] bg-[var(--ak-color-bg-surface-muted)]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = day.dateKey ? events[day.dateKey] || [] : [];

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-[var(--ak-color-border-subtle)] transition-colors duration-200 ${
                  !day.isCurrentMonth ? 'bg-[var(--ak-color-bg-surface-muted)]/40 opacity-40' : ''
                } ${day.isToday ? 'bg-[var(--ak-color-accent-soft)]/15 ring-inset ring-1 ring-[var(--ak-color-accent-soft)]/30' : ''}`}
              >
                <div
                  className={`text-[13px] font-semibold mb-2 inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                    day.isToday
                      ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-sm ak-shadow-color-accent-soft'
                      : day.isCurrentMonth
                      ? 'text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
                      : 'text-[var(--ak-color-text-muted)]'
                  }`}
                >
                  {day.date}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                    className="text-xs p-1.5 rounded bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] truncate cursor-pointer hover:bg-[var(--ak-color-accent)] hover:text-[var(--ak-color-text-inverted)] transition-colors"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-[var(--ak-color-text-muted)] pl-1.5">
                      +{dayEvents.length - 3} mehr
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-[var(--ak-color-text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--ak-color-accent)]"></div>
          <span>Geplante Posts</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>Kampagnen & Events</span>
        </div>
      </div>
    </div>
  );
}

