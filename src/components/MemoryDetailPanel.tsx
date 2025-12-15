'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'
import { 
  LinkIcon, 
  StarIcon, 
  LightBulbIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import type { MemoryCategory } from './MemorySidebarWidget'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

type FilterChip = {
  id: string
  label: string
  selected: boolean
  typeKeys?: string[]
  statusKey?: 'active' | 'archived' | 'suppressed'
  scopeKey?: 'tenant' | 'conversation'
}

type MemoryItem = {
  id: string
  title: string
  preview: string
  typeKey: string
  typeLabel: string
  createdAt: string
  date: string
  source: string
}

type MemoryDetail = {
  id: string
  title: string
  body: string
  typeKey: string
  typeLabel: string
  status: 'active' | 'archived' | 'suppressed'
  statusLabel: string
  tenant: string
  conversationId: string | null
  source: string
  tags: string[]
  links: Array<{ id: string; text: string }>
}

type MemoryDetailPanelProps = {
  category: MemoryCategory | null
}

type MemoryBackendResult = {
  id: string
  content: string
  type: string
  created_at: string
  tenant_id?: string
  conversation_id?: string | null
  metadata?: {
    source?: string
    tags?: string[]
    links?: Array<{ id: string; text: string }>
    [key: string]: unknown
  }
}

const MOCK_TYPE_CHIPS: FilterChip[] = [
  { id: 'type.customer', label: 'Kundendaten', selected: false, typeKeys: ['business_profile'] },
  { id: 'type.talk', label: 'Gespräche', selected: true, typeKeys: ['conversation_message', 'conversation_summary'] },
  { id: 'type.maildm', label: 'E-Mails & DMs', selected: false, typeKeys: ['email', 'dm'] },
  { id: 'type.review', label: 'Bewertungen', selected: false, typeKeys: ['review'] },
  { id: 'type.docs', label: 'Dokumente', selected: false, typeKeys: ['document'] },
  { id: 'type.general', label: 'Allgemeines', selected: false, typeKeys: ['custom'] },
  { id: 'type.knowledge', label: 'Eigenes Wissen', selected: false, typeKeys: ['document'] },
]

const MOCK_STATUS_CHIPS: FilterChip[] = [
  { id: 'status.active', label: 'Aktiv', selected: true, statusKey: 'active' },
  { id: 'status.archived', label: 'Archiviert', selected: false, statusKey: 'archived' },
  { id: 'status.suppressed', label: 'Unterdrückt', selected: false, statusKey: 'suppressed' },
]

const MOCK_SCOPE_CHIPS: FilterChip[] = [
  { id: 'scope.tenant', label: 'Mandantenweit', selected: true, scopeKey: 'tenant' },
  { id: 'scope.conv', label: 'Aktuelle Konversation', selected: false, scopeKey: 'conversation' },
]

const DEFAULT_TENANT_ID = 'demo-tenant'

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    business_profile: 'Kundendaten',
    conversation_message: 'Gespräch',
    conversation_summary: 'Gespräch',
    email: 'E-Mail',
    dm: 'DM',
    review: 'Bewertung',
    document: 'Dokument',
    custom: 'Eigenes Wissen',
  }
  return labels[type] || type
}

export function MemoryDetailPanel({ category }: MemoryDetailPanelProps) {
  const [typeChips, setTypeChips] = useState<FilterChip[]>(MOCK_TYPE_CHIPS)
  const [statusChips, setStatusChips] = useState<FilterChip[]>(MOCK_STATUS_CHIPS)
  const [scopeChips, setScopeChips] = useState<FilterChip[]>(MOCK_SCOPE_CHIPS)
  const [items, setItems] = useState<MemoryItem[]>([])
  const [selected, setSelected] = useState<MemoryDetail | null>(null)
  const [sortValue, setSortValue] = useState<'newest' | 'relevance'>('newest')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const debouncedQuery = useDebouncedValue(searchInput.trim(), 250)

  useEffect(() => {
    const loadItems = async () => {
      if (!category) return

      setLoading(true)
      setError(null)

      try {
        const selectedTypes = typeChips
          .filter((c) => c.selected && c.typeKeys)
          .flatMap((c) => c.typeKeys || [])

        const categoryTypes = category.memoryTypes ?? []

        const searchTypes = categoryTypes.length > 0
          ? categoryTypes
          : selectedTypes.length > 0
            ? selectedTypes
            : undefined

        const query = debouncedQuery.length > 0
          ? debouncedQuery
          : categoryTypes.length > 0
            ? (category.title ?? category.label ?? '').toLowerCase()
            : ''

        const response = await fetch('/api/memory/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: DEFAULT_TENANT_ID,
            query,
            limit: 50,
            filters: {
              types: searchTypes,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as { results?: MemoryBackendResult[] }

        const convertedItems: MemoryItem[] = (data.results || []).map((r) => ({
          id: r.id,
          title: r.content.substring(0, 60) + (r.content.length > 60 ? '...' : ''),
          preview: r.content.substring(0, 120) + (r.content.length > 120 ? '...' : ''),
          typeKey: r.type,
          typeLabel: getTypeLabel(r.type),
          createdAt: r.created_at,
          date: new Date(r.created_at).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          source: r.metadata?.source || 'Unbekannt',
        }))

        if (sortValue === 'newest') {
          convertedItems.sort((a, b) => {
            const ta = Date.parse(a.createdAt) || 0
            const tb = Date.parse(b.createdAt) || 0
            return tb - ta
          })
        }

        setItems(convertedItems)

        if (convertedItems.length > 0) {
          const selectedId = selected?.id
          const keepId = selectedId && convertedItems.some((i) => i.id === selectedId) ? selectedId : convertedItems[0].id
          if (!selectedId || selectedId !== keepId) {
            await loadItemDetail(keepId)
          }
        } else {
          setSelected(null)
        }
      } catch (err) {
        console.error('Fehler beim Laden der Memory-Items:', err)
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
        setItems([])
        setSelected(null)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, typeChips, statusChips, scopeChips, debouncedQuery, sortValue])

  const loadItemDetail = async (itemId: string) => {
    try {
      const response = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: DEFAULT_TENANT_ID,
          query: itemId,
          limit: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const result = data.results?.[0]

      if (result) {
        setSelected({
          id: result.id,
          title: result.content.substring(0, 60) + (result.content.length > 60 ? '...' : ''),
          body: result.content,
          typeKey: result.type,
          typeLabel: getTypeLabel(result.type),
          status: 'active',
          statusLabel: 'Aktiv',
          tenant: result.tenant_id || DEFAULT_TENANT_ID,
          conversationId: result.conversation_id,
          source: result.metadata?.source || 'Unbekannt',
          tags: result.metadata?.tags || [],
          links: result.metadata?.links || [],
        })
      }
    } catch (err) {
      console.error('Fehler beim Laden des Memory-Details:', err)
    }
  }

  const handleArchive = async (memoryId: string) => {
    try {
      const response = await fetch('/api/memory/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: DEFAULT_TENANT_ID, memoryId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      if (selected && selected.id === memoryId) {
        setSelected({ ...selected, status: 'archived', statusLabel: 'Archiviert' })
      }

      setItems((prev) => prev.filter((item) => item.id !== memoryId))
    } catch (err) {
      console.error('Fehler beim Archivieren:', err)
      alert('Fehler beim Archivieren: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    }
  }

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Möchtest du diesen Eintrag wirklich löschen?')) return

    try {
      const response = await fetch('/api/memory/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: DEFAULT_TENANT_ID, memoryId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setItems((prev) => prev.filter((item) => item.id !== memoryId))

      if (selected && selected.id === memoryId) {
        setSelected(null)
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err)
      alert('Fehler beim Löschen: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    }
  }

  const handleFilterToggle = (kind: 'type' | 'status' | 'scope', id: string) => {
    if (kind === 'type') {
      setTypeChips((prev) => prev.map((c) => ({ ...c, selected: c.id === id ? !c.selected : c.selected })))
    } else if (kind === 'status') {
      setStatusChips((prev) => prev.map((c) => ({ ...c, selected: c.id === id ? !c.selected : c.selected })))
    } else {
      setScopeChips((prev) => prev.map((c) => ({ ...c, selected: c.id === id ? !c.selected : c.selected })))
    }
  }

  if (!category) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-sm text-[var(--ak-color-text-muted)]">
          <p className="font-medium text-[var(--ak-color-text-secondary)]">Wähle eine Kategorie aus</p>
          <p className="mt-1">Klicke auf eine Kategorie in der linken Sidebar.</p>
        </div>
      </div>
    )
  }

  const chipBase = 'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2 py-0.5 text-[11px] font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]'
  const chipOn = 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-text-primary)]'
  const chipOff = 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-hover)]'

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/95 p-4 shadow-[var(--ak-shadow-soft)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="ak-heading">Wissen & Memory</h2>
        <div className="w-[220px]">
          <AkSearchField
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Memory durchsuchen"
            size="sm"
          />
        </div>
      </div>
      
      {/* AI Actions & Quick Actions - direkt unter Header */}
      <div className="px-1 space-y-2">
        <AIActions context="memory" />
        <QuickActions context="memory" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-[120px]">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Typ</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {typeChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleFilterToggle('type', chip.id)}
                className={clsx(chipBase, chip.selected ? chipOn : chipOff)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-[var(--ak-color-border-subtle)]" />

        <div className="flex items-center gap-3">
          <div className="w-[120px]">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Status</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {statusChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleFilterToggle('status', chip.id)}
                className={clsx(chipBase, chip.selected ? chipOn : chipOff)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-[var(--ak-color-border-subtle)]" />

        <div className="flex items-center gap-3">
          <div className="w-[120px]">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Ansicht</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {scopeChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleFilterToggle('scope', chip.id)}
                className={clsx(chipBase, chip.selected ? chipOn : chipOff)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="ak-caption text-[var(--ak-color-text-secondary)]">Sortierung:</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="sort"
                  value="newest"
                  checked={sortValue === 'newest'}
                  onChange={(e) => setSortValue(e.target.value as 'newest' | 'relevance')}
                  className="h-3.5 w-3.5"
                />
                <span className="ak-caption text-[var(--ak-color-text-primary)]">Neueste</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="sort"
                  value="relevance"
                  checked={sortValue === 'relevance'}
                  onChange={(e) => setSortValue(e.target.value as 'newest' | 'relevance')}
                  className="h-3.5 w-3.5"
                />
                <span className="ak-caption text-[var(--ak-color-text-primary)]">Relevanz</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Details Section */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex w-[360px] flex-col gap-2 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <p className="ak-body text-[var(--ak-color-text-muted)]">Lade...</p>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="ak-body text-red-700">Fehler: {error}</p>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="ak-body text-[var(--ak-color-text-muted)]">Keine Einträge gefunden</p>
            </div>
          )}
          {!loading && !error && (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadItemDetail(item.id)}
                  className={clsx(
                    'group flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                    selected?.id === item.id
                      ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] shadow-[var(--ak-shadow-card)]'
                      : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:shadow-[var(--ak-shadow-card)]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <p className="ak-body flex-1 truncate font-semibold">{item.title}</p>
                    <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ak-color-text-secondary)]">
                      {item.typeLabel}
                    </span>
                  </div>
                  <p className="ak-body line-clamp-2 text-[var(--ak-color-text-secondary)]">{item.preview}</p>
                  <p className="ak-caption text-[var(--ak-color-text-muted)]">{item.date} • {item.source}</p>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]"
          >
            Mehr laden
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <LightBulbIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="ak-heading text-[var(--ak-color-text-primary)] mb-1">Wähle einen Eintrag aus</p>
                <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Klicke auf einen Memory-Eintrag in der Liste, um Details zu sehen</p>
              </div>
            </div>
          ) : (
            <>
              {/* AI Suggestions & Quick Actions - in der Mitte */}
              <div className="flex flex-col gap-3 px-2 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
                <AIActions context="memory" />
                <QuickActions context="memory" />
              </div>
              {/* Memory Content Card - Apple Style */}
              <div className="apple-card rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-6 shadow-[var(--ak-shadow-sm)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="ak-heading text-xl mb-2 text-[var(--ak-color-text-primary)]">{selected.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                        {selected.typeLabel}
                      </span>
                      {selected.status === 'active' && (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-100">
                          ✓ Aktiv
                        </span>
                      )}
                      {selected.status === 'archived' && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200">
                          📦 Archiviert
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl bg-[var(--ak-color-bg-surface)] p-4 border border-[var(--ak-color-border-subtle)]">
                  <p className="ak-body text-[15px] leading-relaxed text-[var(--ak-color-text-primary)] whitespace-pre-wrap">
                    {selected.body}
                  </p>
                </div>
              </div>

              {/* Quick Stats Widget */}
              <div className="grid grid-cols-3 gap-3">
                <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
                  <p className="ak-caption text-blue-600 mb-1 font-semibold">Typ</p>
                  <p className="ak-body text-sm font-semibold text-blue-900">{selected.typeLabel}</p>
                </div>
                <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
                  <p className="ak-caption text-purple-600 mb-1 font-semibold">Status</p>
                  <p className="ak-body text-sm font-semibold text-purple-900">{selected.statusLabel}</p>
                </div>
                <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-green-50 to-green-100/50 p-4">
                  <p className="ak-caption text-green-600 mb-1 font-semibold">Tags</p>
                  <p className="ak-body text-sm font-semibold text-green-900">{selected.tags.length} Tags</p>
                </div>
              </div>

              {/* Metadata Card - Apple Style */}
              <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
                <h4 className="ak-heading text-base mb-4 text-[var(--ak-color-text-primary)] flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
                  Informationen
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="ak-caption text-[var(--ak-color-text-secondary)]">Mandant</p>
                    <p className="ak-body text-sm font-medium text-[var(--ak-color-text-primary)]">{selected.tenant}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="ak-caption text-[var(--ak-color-text-secondary)]">Konversation</p>
                    <p className="ak-body text-sm font-medium text-[var(--ak-color-text-primary)]">{selected.conversationId || '—'}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="ak-caption text-[var(--ak-color-text-secondary)]">Quelle</p>
                    <p className="ak-body text-sm font-medium text-[var(--ak-color-text-primary)]">{selected.source}</p>
                  </div>
                </div>
              </div>

              {/* Tags Widget */}
              {selected.tags.length > 0 && (
                <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
                  <h4 className="ak-heading text-base mb-3 text-[var(--ak-color-text-primary)]">Tags</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {selected.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-dashed border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      + Tag hinzufügen
                    </button>
                  </div>
                </div>
              )}

              {/* Links Widget */}
              {selected.links.length > 0 && (
                <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
                  <h4 className="ak-heading text-base mb-3 text-[var(--ak-color-text-primary)] flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
                    Verknüpfungen
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selected.links.map((link) => (
                      <a
                        key={link.id}
                        href="#"
                        className="group flex items-center gap-3 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3 hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-hover)] transition-all"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                          <LinkIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="ak-body flex-1 text-sm text-[var(--ak-color-text-primary)]">{link.text}</p>
                        <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Memories Widget */}
              <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
                <h4 className="ak-heading text-base mb-3 text-[var(--ak-color-text-primary)]">Ähnliche Memories</h4>
                <div className="space-y-2">
                  {items.slice(0, 3).filter(item => item.id !== selected.id).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => loadItemDetail(item.id)}
                      className="w-full text-left rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3 hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-hover)] transition-all"
                    >
                      <p className="ak-body text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">{item.title}</p>
                      <p className="ak-caption text-[var(--ak-color-text-secondary)] line-clamp-1">{item.preview}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons - Apple Style */}
              <div className="flex items-center gap-3 pt-2 border-t border-[var(--ak-color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => selected && handleArchive(selected.id)}
                  disabled={selected?.status === 'archived'}
                  className={clsx(
                    'apple-button-secondary flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                    selected?.status === 'archived'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md active:scale-[0.98]'
                  )}
                >
                  <ArchiveBoxIcon className="h-4 w-4" />
                  {selected?.status === 'archived' ? 'Archiviert' : 'Archivieren'}
                </button>
                <button
                  type="button"
                  onClick={() => selected && handleDelete(selected.id)}
                  className="apple-button-secondary inline-flex items-center justify-center gap-2 rounded-xl border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all active:scale-[0.98]"
                >
                  <TrashIcon className="h-4 w-4" />
                  Löschen
                </button>
                <button
                  type="button"
                  className="apple-button-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <StarIcon className="h-4 w-4" />
                  Wichtig
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
