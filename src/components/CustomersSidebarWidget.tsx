'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

import { AkButton } from '@/components/ui/AkButton'
import { AkChip } from '@/components/ui/AkChip'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkSearchField } from '@/components/ui/AkSearchField'

export type CustomerItem = {
  id: string
  name: string
  tag: string
  context: string
  updatedAt: string
  status?: 'active' | 'cold' | 'vip'
}

type CustomersSidebarWidgetProps = {
  onCustomerClick?: (customer: CustomerItem) => void
  onOverviewClick?: () => void
  onOpenDetail?: (customer: CustomerItem) => void
}

const SEGMENTS: Array<{ key: 'all' | 'active' | 'cold' | 'vip'; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'active', label: 'Aktiv' },
  { key: 'vip', label: 'VIP' },
  { key: 'cold', label: 'Kalt' },
]

export function CustomersSidebarWidget({ onCustomerClick }: CustomersSidebarWidgetProps) {
  const [items, setItems] = useState<CustomerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [segment, setSegment] = useState<'all' | 'active' | 'cold' | 'vip'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([
        {
          id: 'cust-001',
          name: 'Muster GmbH',
          tag: 'Warm',
          context: 'Interessiert an Pro-Plan',
          updatedAt: 'vor 2 Tagen',
          status: 'active',
        },
        {
          id: 'cust-002',
          name: 'Alpha & Co',
          tag: 'Hot',
          context: 'Support-Fall offen',
          updatedAt: 'vor 6 Std',
          status: 'vip',
        },
        {
          id: 'cust-003',
          name: 'Beispiel AG',
          tag: 'Kalt',
          context: 'Kein Interesse momentan',
          updatedAt: 'vor 3 Mon',
          status: 'cold',
        },
      ])
      setIsLoading(false)
      setHasError(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const filteredItems = useMemo(() => {
    let result = items
    if (segment !== 'all') {
      result = result.filter((c) => c.status === segment)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((c) => {
        return c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q) || c.context.toLowerCase().includes(q)
      })
    }
    return result
  }, [items, segment, query])

  const handleCustomerClick = (customer: CustomerItem) => {
    setSelectedId(customer.id)
    onCustomerClick?.(customer)
  }

  const handleReload = () => {
    setHasError(false)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 600)
  }

  return (
    <div className="flex h-full flex-col" style={{ padding: 'var(--ak-space-3)' }}>
      <div style={{ marginBottom: 'var(--ak-space-3)' }}>
        <AkSearchField
          value={query}
          onValueChange={setQuery}
          placeholder="Kunden suchen..."
          accent="customers"
          aria-label="Kunden suchen"
        />
      </div>

      <div className="flex flex-wrap gap-2" style={{ marginBottom: 'var(--ak-space-3)' }}>
        <AkChip onClick={(e) => e.stopPropagation()}>
          <SparklesIcon className="h-3 w-3" aria-hidden="true" />
          Segment
        </AkChip>

        <AkChip onClick={(e) => e.stopPropagation()}>
          <PlusIcon className="h-3 w-3" aria-hidden="true" />
          Neu
        </AkChip>

        <AkChip onClick={(e) => e.stopPropagation()}>
          <ArrowDownTrayIcon className="h-3 w-3" aria-hidden="true" />
          Import
        </AkChip>

        <AkChip onClick={(e) => e.stopPropagation()}>
          Mehr...
          <EllipsisHorizontalIcon className="h-3 w-3" aria-hidden="true" />
        </AkChip>
      </div>

      <div className="flex flex-wrap gap-2" style={{ marginBottom: 'var(--ak-space-3)' }}>
        {SEGMENTS.map((s) => (
          <AkChip key={s.key} pressed={segment === s.key} onClick={() => setSegment(s.key)}>
            {s.label}
          </AkChip>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar" style={{ paddingRight: 'var(--ak-space-1)' }}>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3">
                <div className="h-3 w-1/2 rounded bg-[var(--ak-color-bg-muted)]" />
                <div className="mt-2 h-2 w-full rounded bg-[var(--ak-color-bg-muted)] opacity-60" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3">
            <p className="ak-caption text-[var(--ak-color-text-muted)]">Konnte Kunden nicht laden. Bitte neu versuchen.</p>
            <div className="mt-3">
              <AkButton size="sm" variant="secondary" accent="customers" onClick={handleReload}>
                Neu laden
              </AkButton>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3">
            <p className="ak-caption text-[var(--ak-color-text-muted)]">Keine Treffer.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredItems.map((customer) => {
              const tagCls =
                customer.tag === 'VIP'
                  ? 'bg-purple-500/15 text-purple-200 ring-1 ring-purple-500/30'
                  : customer.tag === 'Neu'
                    ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30'
                    : 'bg-white/5 text-[var(--ak-color-text-muted)] ring-1 ring-white/10'

              return (
                <div key={customer.id}>
                  <AkListRow
                    accent="customers"
                    selected={selectedId === customer.id}
                    onClick={() => handleCustomerClick(customer)}
                    leading={
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--ak-color-bg-muted)]">
                        {customer.status === 'vip' ? (
                          <UserGroupIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" aria-hidden="true" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" aria-hidden="true" />
                        )}
                      </div>
                    }
                    title={
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="min-w-0 truncate ak-body font-medium text-[var(--ak-color-text-primary)]">{customer.name}</span>
                        <span className="shrink-0 text-xs text-[var(--ak-color-text-muted)]">{customer.updatedAt}</span>
                      </div>
                    }
                    subtitle={<p className="truncate ak-caption text-[var(--ak-color-text-muted)]">{customer.context}</p>}
                    trailing={
                      <div className="flex items-center gap-2">
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${tagCls}`}>{customer.tag}</span>
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <AkIconButton aria-label="Mehr" onClick={(e) => e.stopPropagation()} className="rounded-md bg-transparent border-transparent hover:bg-[var(--ak-color-bg-hover)]">
                            <EllipsisHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                          </AkIconButton>
                        </div>
                      </div>
                    }
                  />
                  <div className="mx-3 h-px bg-[var(--ak-color-border-subtle)]/50" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

