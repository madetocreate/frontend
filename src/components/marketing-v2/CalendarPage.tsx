'use client';

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { appleCardStyle, appleSectionTitle, appleAnimationFadeInUp } from '@/lib/appleDesign';

const DEMO_EVENTS = [
  { id: 1, title: 'Produkt Launch Post', date: '2025-01-15', type: 'linkedin', status: 'scheduled' },
  { id: 2, title: 'Weekly Update', date: '2025-01-18', type: 'twitter', status: 'draft' },
  { id: 3, title: 'Team Spotlight', date: '2025-01-22', type: 'instagram', status: 'scheduled' },
];

export function CalendarPage() {
  const currentMonth = 'Januar 2025';

  return (
    <div className={`space-y-6 ${appleAnimationFadeInUp}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={appleSectionTitle}>Content Kalender</h2>
          <p className="text-[var(--ak-color-text-secondary)]">
            Behalte den Überblick über deine geplanten Aktivitäten.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] border border-[var(--ak-color-border-subtle)]">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="flex items-center px-4 font-medium">{currentMonth}</span>
          <button className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] border border-[var(--ak-color-border-subtle)]">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={`${appleCardStyle} p-6`}>
        {/* Simple Month View Mock */}
        <div className="grid grid-cols-7 gap-px bg-[var(--ak-color-border-fine)] rounded-lg overflow-hidden border border-[var(--ak-color-border-fine)]">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="p-4 bg-[var(--ak-color-bg-surface-muted)] text-center font-medium text-sm">
              {day}
            </div>
          ))}
          {/* Calendar Days */}
          {Array.from({ length: 31 }).map((_, i) => {
            const day = i + 1;
            const event = DEMO_EVENTS.find(e => e.date === `2025-01-${day.toString().padStart(2, '0')}`);
            return (
              <div key={i} className="min-h-[120px] p-2 bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-colors relative group cursor-pointer">
                <span className={`text-sm ${event ? 'font-bold' : 'text-[var(--ak-color-text-muted)]'}`}>{day}</span>
                {event && (
                  <div className={`mt-2 p-2 rounded text-xs border-l-2 truncate shadow-sm transition-colors ${
                    event.type === 'linkedin'
                      ? 'bg-[var(--ak-semantic-info-soft)] border-[var(--ak-semantic-info)] text-[var(--ak-semantic-info-strong)]'
                      : event.type === 'twitter'
                      ? 'bg-[var(--ak-color-accent-soft)] border-[var(--ak-color-accent)] text-[var(--ak-color-accent-strong)]'
                      : 'bg-[var(--ak-semantic-warning-soft)] border-[var(--ak-semantic-warning)] text-[var(--ak-semantic-warning-strong)]'
                    }`}>
                    {event.title}
                  </div>
                )}
                {/* Add Button on Hover */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1 rounded-full bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-md">
                    <CalendarIcon className="h-3 w-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

