'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  UserCircleIcon,
  BookOpenIcon,
  EnvelopeIcon,
  StarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  SparklesIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const DEFAULT_TENANT_ID = 'demo-tenant' // TODO: Aus Auth/Context holen

export type MemoryCategory = {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  count: number
  lastUpdatedText: string
  memoryTypes: string[]
}

type MemorySidebarWidgetProps = {
  onCategoryClick?: (category: MemoryCategory) => void
}

const ICON_MAP = {
  'profile-card': UserCircleIcon,
  notebook: BookOpenIcon,
  mail: EnvelopeIcon,
  star: StarIcon,
  document: DocumentTextIcon,
  lightbulb: LightBulbIcon,
  sparkle: SparklesIcon,
} as const

const COLOR_MAP = {
  'blue-500': 'bg-blue-500',
  'purple-500': 'bg-purple-500',
  'teal-500': 'bg-teal-500',
  'orange-500': 'bg-orange-500',
  'green-500': 'bg-green-500',
  'pink-500': 'bg-pink-500',
  'gray-600': 'bg-gray-600',
} as const

const MOCK_CATEGORIES: MemoryCategory[] = [
  {
    id: 'kunden',
    title: 'Kundendaten',
    subtitle: 'Profile, CRM-Schlüsselinfos',
    icon: 'profile-card',
    color: 'blue-500',
    count: 32,
    lastUpdatedText: 'vor 2 Tagen',
    memoryTypes: ['business_profile'],
  },
  {
    id: 'gespraeche',
    title: 'Gespräche',
    subtitle: 'Nachrichten & Zusammenfassungen',
    icon: 'notebook',
    color: 'purple-500',
    count: 148,
    lastUpdatedText: 'vor 1 Tag',
    memoryTypes: ['conversation_message', 'conversation_summary'],
  },
  {
    id: 'mail_dm',
    title: 'E-Mails & DMs',
    subtitle: 'E-Mails und Direktnachrichten',
    icon: 'mail',
    color: 'teal-500',
    count: 76,
    lastUpdatedText: 'vor 3 Stunden',
    memoryTypes: ['email', 'dm'],
  },
  {
    id: 'bewertungen',
    title: 'Bewertungen & Feedback',
    subtitle: 'Rezensionen und Rückmeldungen',
    icon: 'star',
    color: 'orange-500',
    count: 24,
    lastUpdatedText: 'vor 5 Tagen',
    memoryTypes: ['review'],
  },
  {
    id: 'dokumente',
    title: 'Dokumente',
    subtitle: 'Dateien und Inhalte',
    icon: 'document',
    color: 'green-500',
    count: 58,
    lastUpdatedText: 'vor 6 Tagen',
    memoryTypes: ['document'],
  },
  {
    id: 'wissen_allgemein',
    title: 'Allgemeines Wissen',
    subtitle: 'Übergreifendes Langzeitwissen',
    icon: 'lightbulb',
    color: 'pink-500',
    count: 12,
    lastUpdatedText: 'vor 8 Tagen',
    memoryTypes: ['document', 'custom'],
  },
  {
    id: 'wissen_eigen',
    title: 'Eigenes Wissen',
    subtitle: 'Manuell erstellte Einträge',
    icon: 'sparkle',
    color: 'gray-600',
    count: 7,
    lastUpdatedText: 'vor 4 Tagen',
    memoryTypes: ['custom'],
  },
]

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Min`
  if (diffHours < 24) return `vor ${diffHours} Std`
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

export function MemorySidebarWidget({ onCategoryClick }: MemorySidebarWidgetProps) {
  const [categories, setCategories] = useState<MemoryCategory[]>(MOCK_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      try {
        // Lade Counts für jede Kategorie
        const categoryPromises = MOCK_CATEGORIES.map(async (category) => {
          try {
            // Suche nach Items dieser Kategorie (ohne Query, nur Type-Filter)
            const response = await fetch('/api/memory/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tenantId: DEFAULT_TENANT_ID,
                query: ' ', // Leerzeichen statt leerer String (Backend erwartet String)
                limit: 1, // Nur Count, nicht die Items selbst
                filters: {
                  types: category.memoryTypes,
                },
              }),
            })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()
            const count = data.count || 0

            // Finde neuestes Item für lastUpdated
            let lastUpdated = new Date(0)
            if (count > 0) {
              const detailResponse = await fetch('/api/memory/search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  tenantId: DEFAULT_TENANT_ID,
                  query: '',
                  limit: 1,
                  filters: {
                    types: category.memoryTypes,
                  },
                }),
              })

              if (detailResponse.ok) {
                const detailData = await detailResponse.json()
                if (detailData.results && detailData.results.length > 0) {
                  lastUpdated = new Date(detailData.results[0].created_at)
                }
              }
            }

            return {
              ...category,
              count,
              lastUpdatedText: count > 0 ? formatTimeAgo(lastUpdated) : 'nie',
            }
          } catch (err) {
            console.error(`Fehler beim Laden der Kategorie ${category.id}:`, err)
            return {
              ...category,
              count: 0,
              lastUpdatedText: 'Fehler',
            }
          }
        })

        const loadedCategories = await Promise.all(categoryPromises)
        setCategories(loadedCategories)
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err)
        // Fallback zu Mock-Daten
        setCategories(MOCK_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleCategoryClick = (category: MemoryCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category)
    }
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="ak-body text-[var(--ak-color-text-muted)]">Lade Kategorien...</p>
        </div>
      )}
      {!loading && categories.map((category) => {
        const IconComponent = ICON_MAP[category.icon as keyof typeof ICON_MAP] || DocumentTextIcon
        const colorClass = COLOR_MAP[category.color as keyof typeof COLOR_MAP] || 'bg-slate-500'

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category)}
            className="group flex w-full items-stretch gap-3 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-3 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:shadow-[var(--ak-shadow-card)]"
          >
            <div className={clsx('w-0.5 rounded-full', colorClass)} />
            <IconComponent className="h-5 w-5 flex-shrink-0 text-[var(--ak-color-text-muted)]" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="ak-heading truncate font-semibold">{category.title}</p>
              <p className="ak-body line-clamp-1 text-[var(--ak-color-text-secondary)]">
                {category.subtitle}
              </p>
              <div className="flex-1" />
              <div className="flex items-center justify-end gap-1">
                <p className="ak-caption text-[var(--ak-color-text-muted)]">
                  {category.count} Einträge · zuletzt aktualisiert {category.lastUpdatedText}
                </p>
                <ChevronRightIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)]" />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

