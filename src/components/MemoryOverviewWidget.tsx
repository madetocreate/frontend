'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
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
        badgeBg: 'bg-violet-50',
        badgeFg: 'text-violet-700',
        dot: 'bg-violet-400',
      }
    case 'Konversationen':
      return {
        badgeBg: 'bg-sky-50',
        badgeFg: 'text-sky-700',
        dot: 'bg-sky-400',
      }
    case 'Posteingang & Nachrichten':
      return {
        badgeBg: 'bg-amber-50',
        badgeFg: 'text-amber-800',
        dot: 'bg-amber-400',
      }
    case 'Dokumente & Website':
      return {
        badgeBg: 'bg-emerald-50',
        badgeFg: 'text-emerald-700',
        dot: 'bg-emerald-400',
      }
    case 'Feedback & Reviews':
      return {
        badgeBg: 'bg-rose-50',
        badgeFg: 'text-rose-700',
        dot: 'bg-rose-400',
      }
    case 'Persönlich':
    default:
      return {
        badgeBg: 'bg-slate-100',
        badgeFg: 'text-slate-700',
        dot: 'bg-slate-400',
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
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {header.title}
          </p>
          <p className="text-xs text-slate-600">{header.subtitle}</p>
        </div>
        {header.showCount ? (
          <div className="rounded-xl bg-slate-900 px-3 py-1.5 text-right text-[11px] text-slate-50 shadow-sm">
            <p className="font-semibold">
              {visibleCount} / {totalCount}
            </p>
            <p className="text-[10px] text-slate-200">{header.countLabel}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-700 focus-within:ring-1 focus-within:ring-sky-500">
            <MagnifyingGlassIcon className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Memories durchsuchen..."
              className="h-6 flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] text-slate-600"
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
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px]',
                activeFilter === filter.value
                  ? 'bg-slate-900 text-slate-50'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex-1 min-h-0 px-4 pb-4">
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/90">
          {filteredItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4 text-[11px] text-slate-500">
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
                      className="flex w-full items-start gap-3 px-3.5 py-3 text-left text-xs hover:bg-slate-50/80"
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
                                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
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
                              <span className="text-[11px] text-slate-400">
                                {item.source}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {item.time}
                          </span>
                        </div>

                        <div>
                          <p className="truncate text-xs font-medium text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                            {item.summary}
                          </p>
                        </div>

                        {item.tags.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className={clsx(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px]',
                                  item.important
                                    ? 'bg-slate-900 text-slate-50'
                                    : 'bg-slate-100/80 text-slate-600',
                                )}
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

          <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[11px] text-slate-600"
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
