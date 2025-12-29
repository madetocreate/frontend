'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { AkSearchField } from '@/components/ui/AkSearchField'
import {
  ArrowPathIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

type MemoryCategory =
  | 'Profil & Brand'
  | 'Konversationen'
  | 'Posteingang & Nachrichten'
  | 'Dokumente & Website'
  | 'Feedback & Reviews'
  | 'Persönlich'

type MemoryHeader = {
  title: string
  subtitle: string
  showCount: boolean
  countLabel: string
}

type MemoryFilterValue = MemoryCategory | 'all'

type MemoryFilter = {
  label: string
  value: MemoryFilterValue
}

type MemoryItem = {
  id: string
  category: MemoryCategory
  title: string
  summary: string
  source: string
  tags: string[]
  time: string
  important: boolean
}

type MemoryOverviewData = {
  header: MemoryHeader
  filters: MemoryFilter[]
  selectedFilter: MemoryFilterValue
  items: MemoryItem[]
}

const DEFAULT_DATA: MemoryOverviewData = {
  header: {
    title: 'Memory-Liste',
    subtitle:
      'Kuratiere und durchsuche deine gespeicherten Informationen, Kunden und Kontexte.',
    showCount: true,
    countLabel: 'Memories',
  },
  filters: [
    { label: 'Alle', value: 'all' },
    { label: 'Profil & Brand', value: 'Profil & Brand' },
    { label: 'Konversationen', value: 'Konversationen' },
    { label: 'Posteingang', value: 'Posteingang & Nachrichten' },
    { label: 'Dokumente & Website', value: 'Dokumente & Website' },
    { label: 'Feedback & Reviews', value: 'Feedback & Reviews' },
  ],
  selectedFilter: 'all',
  items: [
    {
      id: 'm1',
      category: 'Konversationen',
      title: 'VIP-Kunde: Studio Morgenrot',
      summary:
        'Marketing-Agentur aus Berlin mit Fokus auf Launch-Kampagnen. Monatlicher Retainer, mehrere parallele Projekte.',
      source: 'Chat · Letztes Gespräch',
      tags: ['VIP', 'Retainer', 'Agentur'],
      time: 'vor 2 Tagen',
      important: true,
    },
    {
      id: 'm2',
      category: 'Dokumente & Website',
      title: 'Landingpage „AI Onboarding Funnel“',
      summary:
        'Neue Landingpage mit Case Studies, Pricing-Section und mehrstufigem Onboarding-Funnel. Steht kurz vor dem Launch.',
      source: 'Dokument · Notion',
      tags: ['Landingpage', 'Onboarding', 'Conversion'],
      time: 'vor 5 Stunden',
      important: false,
    },
    {
      id: 'm3',
      category: 'Profil & Brand',
      title: 'Markenprofil Matthias',
      summary:
        'Positionierung als AI-Unternehmer mit Fokus auf produktisierte Services, Infra und persönliche Betreuung.',
      source: 'Profil · Manuell',
      tags: ['Personal Brand', 'Positionierung'],
      time: 'vor 1 Woche',
      important: false,
    },
    {
      id: 'm4',
      category: 'Posteingang & Nachrichten',
      title: 'Follow-up: Workshop-Anfrage Müller GmbH',
      summary:
        'Kunde wartet auf Rückmeldung zu einem 2-tägigen Inhouse-Workshop zu AI-Automatisierung im Vertrieb.',
      source: 'Inbox · E-Mail',
      tags: ['Workshop', 'B2B', 'Follow-up'],
      time: 'vor 3 Tagen',
      important: true,
    },
  ],
}

function getCategoryAccent(category: MemoryCategory) {
  switch (category) {
    case 'Profil & Brand':
      return {
        badgeBg: 'bg-[var(--ak-accent-documents-soft)]',
        badgeFg: 'text-[var(--ak-accent-documents)]',
        dot: 'bg-[var(--ak-accent-documents)]',
      }
    case 'Konversationen':
      return {
        badgeBg: 'bg-[var(--ak-accent-inbox-soft)]',
        badgeFg: 'text-[var(--ak-accent-inbox)]',
        dot: 'bg-[var(--ak-accent-inbox)]',
      }
    case 'Posteingang & Nachrichten':
      return {
        badgeBg: 'bg-[var(--ak-semantic-warning-soft)]',
        badgeFg: 'text-[var(--ak-semantic-warning)]',
        dot: 'bg-[var(--ak-semantic-warning)]',
      }
    case 'Dokumente & Website':
      return {
        badgeBg: 'bg-[var(--ak-semantic-success-soft)]',
        badgeFg: 'text-[var(--ak-semantic-success)]',
        dot: 'bg-[var(--ak-semantic-success)]',
      }
    case 'Feedback & Reviews':
      return {
        badgeBg: 'bg-[var(--ak-semantic-danger-soft)]',
        badgeFg: 'text-[var(--ak-semantic-danger)]',
        dot: 'bg-[var(--ak-semantic-danger)]',
      }
    case 'Persönlich':
    default:
      return {
        badgeBg: 'bg-[var(--ak-color-bg-surface-muted)]',
        badgeFg: 'text-[var(--ak-color-text-secondary)]',
        dot: 'bg-[var(--ak-color-border-subtle)]',
      }
  }
}

export function MemoryOverviewWidget() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<MemoryFilterValue>(
    DEFAULT_DATA.selectedFilter,
  )

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return DEFAULT_DATA.items.filter((item) => {
      if (activeFilter !== 'all' && item.category !== activeFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const haystack = [
        item.title,
        item.summary,
        item.source,
        item.category,
        item.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [activeFilter, query])

  const totalCount = DEFAULT_DATA.items.length
  const visibleCount = filteredItems.length
  const header = DEFAULT_DATA.header

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium uppercase tracking-wide ak-text-muted">
            {header.title}
          </p>
          <p className="text-xs ak-text-secondary">{header.subtitle}</p>
        </div>
        {header.showCount ? (
          <div className="rounded-xl bg-[var(--ak-color-graphite-surface-strong)] px-3 py-1.5 text-right text-[11px] shadow-sm" style={{ color: 'var(--ak-color-graphite-text)' }}>
            <p className="font-semibold">
              {visibleCount} / {totalCount}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--ak-color-graphite-text)', opacity: 0.8 }}>{header.countLabel}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <AkSearchField
              value={query}
              onChange={(next) => setQuery(next)}
              placeholder="Memories durchsuchen..."
              size="sm"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 rounded-[var(--ak-radius-md)] border ak-border-default ak-bg-glass px-2.5 py-1 text-[11px] ak-text-secondary"
          >
            <FunnelIcon className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {DEFAULT_DATA.filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={clsx(
                'inline-flex items-center rounded-[var(--ak-radius-md)] px-2.5 py-0.5 text-[11px]',
                activeFilter === filter.value
                  ? 'bg-[var(--ak-color-graphite-surface-strong)]'
                  : 'ak-bg-surface-muted ak-text-secondary hover:ak-bg-hover',
              )}
              style={activeFilter === filter.value ? { color: 'var(--ak-color-graphite-text)' } : undefined}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex-1 min-h-0 px-4 pb-4">
        <div className="flex h-full flex-col rounded-2xl border ak-border-default bg-[var(--ak-color-bg-surface)]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4 text-[11px] ak-text-secondary">
              Keine Memories für diesen Filter gefunden.
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
              {filteredItems.map((item) => {
                const accent = getCategoryAccent(item.category)

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 px-3.5 py-3 text-left text-xs hover:ak-bg-hover/80"
                    >
                      <div className="mt-1">
                        <span
                          className={clsx(
                            'h-1.5 w-1.5 rounded-full',
                            accent.dot,
                          )}
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={clsx(
                                'inline-flex items-center gap-1 rounded-[var(--ak-radius-md)] border px-2 py-0.5 text-[11px] font-medium',
                                accent.badgeBg,
                                accent.badgeFg,
                                'border-transparent',
                              )}
                            >
                              <span className="text-[10px] uppercase tracking-wide">
                                {item.category}
                              </span>
                            </span>
                            {item.source ? (
                              <span className="text-[11px] ak-text-muted">
                                {item.source}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] ak-text-muted">
                            {item.time}
                          </span>
                        </div>

                        <div>
                          <p className="truncate text-xs font-medium ak-text-primary">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug ak-text-secondary">
                            {item.summary}
                          </p>
                        </div>

                        {item.tags.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className={clsx(
                                  'inline-flex items-center rounded-[var(--ak-radius-md)] px-2 py-0.5 text-[10px]',
                                  item.important
                                    ? 'bg-[var(--ak-color-graphite-surface-strong)]'
                                    : 'ak-bg-surface-muted/80 ak-text-secondary',
                                )}
                                style={item.important ? { color: 'var(--ak-color-graphite-text)' } : undefined}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="border-t ak-border-hairline px-3 py-2 text-[11px] ak-text-secondary">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-[var(--ak-radius-md)] border ak-border-default ak-bg-glass px-2.5 py-0.5 text-[11px] ak-text-secondary"
            >
              <ArrowPathIcon className="h-3 w-3" />
              Mehr laden
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
