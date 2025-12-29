'use client'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import {
  BookmarkIcon,
  LightBulbIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

import { AkButton } from '@/components/ui/AkButton'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

export type MemoryCategory = {
  id: string
  label: string
  subtitle: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  memoryTypes?: string[]
  title?: string
}

const CATEGORIES: MemoryCategory[] = [
  {
    id: 'notes',
    label: 'Notizen',
    subtitle: 'Kurze Snippets & Gedanken',
    count: 18,
    icon: LightBulbIcon,
    colorClass: 'bg-[var(--ak-semantic-warning)]',
  },
  {
    id: 'links',
    label: 'Links',
    subtitle: 'Quellen, Dokus, Referenzen',
    count: 42,
    icon: LinkIcon,
    colorClass: 'ak-accent-bg-soft',
  },
  {
    id: 'quotes',
    label: 'Zitate',
    subtitle: 'Wichtige Aussagen & Facts',
    count: 7,
    icon: ChatBubbleLeftRightIcon,
    colorClass: 'bg-[var(--ak-accent-inbox)]',
  },
  {
    id: 'assets',
    label: 'Assets',
    subtitle: 'Dateien, Bilder, Attachments',
    count: 13,
    icon: CubeIcon,
    colorClass: 'bg-[var(--ak-semantic-success)]',
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    subtitle: 'Schnellzugriff',
    count: 9,
    icon: BookmarkIcon,
    colorClass: 'ak-accent-bg-soft',
  },
]

type MemorySidebarWidgetProps = {
  onCategoryClick?: (categoryId: string) => void
}

export function MemorySidebarWidget({ onCategoryClick }: MemorySidebarWidgetProps) {
  const [activeId, setActiveId] = useState<string>(CATEGORIES[0]?.id || 'notes')

  const activeCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === activeId) || CATEGORIES[0]
  }, [activeId])

  return (
    <WidgetCard
      title="Memory"
      subtitle={activeCategory ? activeCategory.label : 'Wissen & Kontext'}
      className="h-full"
      padding="sm"
      actions={
        <AkButton variant="secondary" accent="default" onClick={() => {}}>
          Ordner erstellen
        </AkButton>
      }
    >
      <ul className="flex flex-col gap-1">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isActive = category.id === activeId
          return (
            <li key={category.id}>
              <AkListRow
                accent="default"
                selected={isActive}
                title={category.label}
                subtitle={category.subtitle}
                leading={
                  <div className="flex items-center gap-2">
                    <div className={clsx('h-6 w-1 rounded-full', category.colorClass)} />
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--ak-color-border)] bg-[var(--ak-color-bg-elevated)]">
                      <Icon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
                    </div>
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-[var(--ak-color-border)] bg-[var(--ak-color-bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--ak-color-text-secondary)]">
                      {category.count}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] opacity-0 transition group-hover:opacity-100" />
                  </div>
                }
                onClick={() => {
                  setActiveId(category.id)
                  onCategoryClick?.(category.id)
                }}
              />
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}
