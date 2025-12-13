'use client'

import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { AkSearchField } from '@/components/ui/AkSearchField'
import {
  EllipsisHorizontalIcon,
  Square3Stack3DIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

type CustomerItem = {
  id: string
  name: string
  context: string
  tag?: string
}

type QuickAction = {
  label: string
  actionKey: string
  icon: string
}

type CustomersSidebarWidgetProps = {
  onCustomerClick?: (customerId: string) => void
  onOpenDetail?: (customerId: string) => void
  onOverviewClick?: () => void
}

// Icon-Mapping für Quick Actions
const QUICK_ACTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'square-text': Square3Stack3DIcon,
  search: MagnifyingGlassIcon,
  notebook: BookOpenIcon,
}

// Mock-Daten basierend auf dem neuen Schema
const MOCK_QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Kundendatei aufbauen',
    actionKey: 'customers_build_list',
    icon: 'square-text',
  },
  {
    label: 'Käufer finden',
    actionKey: 'customers_find_buyers',
    icon: 'search',
  },
  {
    label: 'Offene Themen',
    actionKey: 'customers_open_threads',
    icon: 'notebook',
  },
]

const MOCK_SEGMENTS = ['Alle', 'Leads', 'Aktiv', 'Schläft', 'VIP']

const MOCK_CUSTOMERS: CustomerItem[] = [
  {
    id: 'c1',
    name: 'Muster GmbH',
    context: 'Letzter Kontakt: 10. Dez 2025 – Angebot offen',
    tag: 'Lead',
  },
  {
    id: 'c2',
    name: 'Acme Retail',
    context: 'Letzter Kontakt: 2. Dez 2025 – Auftrag bestätigt',
    tag: 'Aktiv',
  },
  {
    id: 'c3',
    name: 'Futura Labs',
    context: 'Letzter Kontakt: 18. Nov 2025 – Follow-up geplant',
    tag: 'Lead',
  },
  {
    id: 'c4',
    name: 'KaffeeKultur',
    context: 'Letzter Kontakt: 8. Sep 2025 – schläft seit 90 Tagen',
  },
  {
    id: 'c5',
    name: 'Zeta Ventures',
    context: 'Letzter Kontakt: 12. Dez 2025 – Roadmap geteilt',
    tag: 'VIP',
  },
]

export function CustomersSidebarWidget({
  onCustomerClick,
}: CustomersSidebarWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<string>('Alle')

  // Filtere Kunden basierend auf Segment und Suche
  const filteredCustomers = useMemo(() => {
    let customers = MOCK_CUSTOMERS

    // Filter nach Segment
    if (selectedSegment !== 'Alle') {
      customers = customers.filter((customer) => customer.tag === selectedSegment)
    }

    // Filter nach Suchbegriff
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      customers = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.context.toLowerCase().includes(query)
      )
    }

    return customers
  }, [selectedSegment, searchQuery])

  const handleCustomerClick = (customer: CustomerItem) => {
    if (onCustomerClick) {
      onCustomerClick(customer.id)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Action Palette öffnen
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Search action
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Suchfeld ganz oben */}
      <form onSubmit={handleSearchSubmit}>
        <AkSearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Kunden suchen…"
          accent="customers"
        />
      </form>

      {/* Info-Button entfernt */}

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {MOCK_QUICK_ACTIONS.map((action) => {
          const IconComponent = QUICK_ACTION_ICON_MAP[action.icon] || Square3Stack3DIcon
          return (
            <button
              key={action.actionKey}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            >
              <IconComponent className="h-4 w-4" />
              {action.label}
            </button>
          )
        })}
        <div className="flex-1" />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <EllipsisHorizontalIcon className="h-4 w-4" />
          Mehr…
        </button>
      </div>

      {/* Segment Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {MOCK_SEGMENTS.map((segment) => (
          <button
            key={segment}
            type="button"
            onClick={() => setSelectedSegment(segment)}
            className={clsx(
              'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
              selectedSegment === segment
                ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            {segment}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Kunden-Liste oder Empty State */}
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-8 text-center">
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Noch keine Kundendatei. Starte mit &apos;Kundendatei aufbauen&apos;.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
            >
              Import starten
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCustomerClick(customer)}
                className={clsx(
                  'group ak-list-row flex w-full items-center gap-3 ak-surface-1 ak-border-hairline cursor-pointer',
                  'hover:ak-surface-2-hover hover:ak-elev-1'
                )}
                style={{
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: 'var(--ak-border-hairline)',
                }}
              >
                {/* User Icon Box (32px, full radius) */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ak-surface-2">
                  <UserIcon className="h-4 w-4 text-[var(--ak-text-primary)]" />
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="ak-body truncate text-[var(--ak-font-size-sm)] font-semibold leading-tight text-[var(--ak-text-primary)]">
                    {customer.name}
                  </p>
                  <p className="ak-caption text-[var(--ak-font-size-xs)] text-[var(--ak-text-secondary)]">
                    {customer.context}
                  </p>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Tag (optional) */}
                {customer.tag && (
                  <span className="inline-flex items-center rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--ak-color-text-primary)]">
                    {customer.tag}
                  </span>
                )}

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMenuClick(e)
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                  aria-label="Menü"
                >
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
