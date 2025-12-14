'use client'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { AkChip } from '@/components/ui/AkChip'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { WidgetCard } from '@/components/ui/WidgetCard'

type GrowthSidebarWidgetProps = {
  onItemClick?: (itemId: string) => void
  onOverviewClick?: () => void
}

type GrowthStatus = 'Aktiv' | 'Geplant' | 'Abgeschlossen'

type GrowthItem = {
  id: string
  title: string
  subtitle: string
  status: GrowthStatus
  progress: number
  updatedLabel: string
}

const ITEMS: GrowthItem[] = [
  {
    id: 'growth_1',
    title: 'Activation Funnel',
    subtitle: 'Signup → First Value',
    status: 'Aktiv',
    progress: 62,
    updatedLabel: 'vor 1h',
  },
  {
    id: 'growth_2',
    title: 'Onboarding E-Mails',
    subtitle: 'Sequenz A/B Test',
    status: 'Aktiv',
    progress: 35,
    updatedLabel: 'vor 6h',
  },
  {
    id: 'growth_3',
    title: 'Pricing Page Refresh',
    subtitle: 'Copy + Visuals',
    status: 'Geplant',
    progress: 10,
    updatedLabel: 'morgen',
  },
  {
    id: 'growth_4',
    title: 'Referral Loop',
    subtitle: 'Invite Mechanik',
    status: 'Geplant',
    progress: 5,
    updatedLabel: 'nächste Woche',
  },
  {
    id: 'growth_5',
    title: 'Churn Rescue',
    subtitle: 'Winback Playbook',
    status: 'Abgeschlossen',
    progress: 100,
    updatedLabel: 'vor 2w',
  },
]

const STATUS_CLASSES: Record<GrowthStatus, string> = {
  Aktiv: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Geplant: 'border-amber-200 bg-amber-50 text-amber-700',
  Abgeschlossen: 'border-zinc-200 bg-zinc-50 text-zinc-700',
}

export function GrowthSidebarWidget({
  onItemClick,
  onOverviewClick,
}: GrowthSidebarWidgetProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | GrowthStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ITEMS.filter((item) => {
      const matchesFilter = filter === 'all' || item.status === filter
      if (!matchesFilter) return false
      if (!q) return true
      return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    })
  }, [filter, query])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    onItemClick?.(id)
  }

  return (
    <WidgetCard
      className="h-full border-0 shadow-none bg-transparent"
      padding="sm"
    >
      <div className="flex flex-col gap-3">
        <AkSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search..."
          accent="growth"
        />

        <div className="flex flex-wrap gap-2 items-center flex-nowrap overflow-hidden">
          <AkChip onClick={onOverviewClick}>
            Übersicht
          </AkChip>
          <AkChip
            pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Alle
          </AkChip>
          <AkChip
            pressed={filter === 'Aktiv'}
            onClick={() => setFilter('Aktiv')}
          >
            Aktiv
          </AkChip>
          <div className="ml-auto shrink-0">
             <AkChip onClick={() => {}}>
              Mehr...
            </AkChip>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="ak-body rounded-2xl border border-dashed border-[var(--ak-color-border)] p-4 text-center text-[var(--ak-color-text-muted)]">
            Keine Treffer.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={clsx(
                    'flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all',
                    'bg-white/60 backdrop-blur-sm',
                    selectedId === item.id
                      ? 'border-[var(--ak-color-accent)] ring-1 ring-[var(--ak-color-accent)]'
                      : 'border-slate-200 hover:bg-white/80'
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="ak-body font-medium text-slate-900 truncate">{item.title}</p>
                      <p className="ak-caption text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                    <span
                      className={clsx(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        STATUS_CLASSES[item.status],
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--ak-color-accent)]" 
                      style={{ width: `${item.progress}%` }} 
                    />
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <span className="text-[10px] text-slate-400">{item.updatedLabel}</span>
                    <span className="text-[10px] text-slate-400">{item.progress}%</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WidgetCard>
  )
}
