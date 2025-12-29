'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon,
  ClockIcon,
  XMarkIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkEmptyState } from '@/components/ui/AkEmptyState'
import type { MemoryItem, MemoryFilters } from './types'
import { fetchMemoryList, fetchMemorySearch } from './api'
import { seedDemoMemoryIfEmpty } from './storage'
import { MemoryDetail } from './MemoryDetail'

export function MemorySettings() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedId = searchParams.get('id')
  
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<MemoryFilters>({
    range: 'all',
    status: 'active',
  })
  
  // Load memories
  const loadMemories = useCallback(async () => {
    setLoading(true)
    try {
      seedDemoMemoryIfEmpty()
      
      let result
      if (searchQuery.trim()) {
        result = await fetchMemorySearch(searchQuery.trim(), filters, 50)
      } else {
        result = await fetchMemoryList(filters, 0, 50)
      }
      
      setMemories(result.items)
    } catch (error) {
      console.error('Failed to load memories', error)
      setMemories([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])
  
  useEffect(() => {
    loadMemories()
  }, [loadMemories])
  
  // Update filters from URL params
  useEffect(() => {
    const mType = searchParams.get('m_type')
    const mSrc = searchParams.get('m_src')
    const mScope = searchParams.get('m_scope')
    const mStatus = searchParams.get('m_status')
    const mRange = searchParams.get('m_range')
    const q = searchParams.get('q')
    
    if (mType || mSrc || mScope || mStatus || mRange || q) {
      setFilters({
        type: mType ? [mType as MemoryItem['type']] : undefined,
        source: mSrc ? [mSrc as MemoryItem['source']] : undefined,
        scope: mScope as MemoryItem['scope'] | undefined,
        status: (mStatus as MemoryItem['status']) || 'active',
        range: (mRange as MemoryFilters['range']) || 'all',
        query: q || undefined,
      })
      if (q) setSearchQuery(q)
    }
  }, [searchParams])
  
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    } else {
      params.delete('q')
    }
    params.delete('id') // Remove detail view when searching
    router.push(`/settings?tab=memory&${params.toString()}`)
  }, [searchQuery, searchParams, router])
  
  const handleFilterChange = useCallback((newFilters: Partial<MemoryFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    
    const params = new URLSearchParams(searchParams.toString())
    if (updated.type && updated.type.length > 0) {
      params.set('m_type', updated.type[0])
    } else {
      params.delete('m_type')
    }
    if (updated.source && updated.source.length > 0) {
      params.set('m_src', updated.source[0])
    } else {
      params.delete('m_src')
    }
    if (updated.scope) {
      params.set('m_scope', updated.scope)
    } else {
      params.delete('m_scope')
    }
    if (updated.status) {
      params.set('m_status', updated.status)
    } else {
      params.delete('m_status')
    }
    if (updated.range) {
      params.set('m_range', updated.range)
    } else {
      params.delete('m_range')
    }
    params.delete('id')
    router.push(`/settings?tab=memory&${params.toString()}`)
  }, [filters, searchParams, router])
  
  const handleRowClick = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('id', id)
    router.push(`/settings?tab=memory&${params.toString()}`)
  }, [searchParams, router])
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `vor ${diffMins} Min`
    if (diffHours < 24) return `vor ${diffHours} Std`
    if (diffDays === 1) return 'Gestern'
    if (diffDays < 7) return `vor ${diffDays} Tagen`
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // Detail View
  if (selectedId) {
    return (
      <MemoryDetail
        id={selectedId}
        onBack={() => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('id')
          router.push(`/settings?tab=memory&${params.toString()}`)
        }}
        onUpdate={loadMemories}
      />
    )
  }
  
  // List View
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--ak-color-border-hairline)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight mb-4">
          Memory
        </h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-secondary)]" />
          <input
            type="text"
            placeholder="Gedächtnis durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                const params = new URLSearchParams(searchParams.toString())
                params.delete('q')
                router.push(`/settings?tab=memory&${params.toString()}`)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--ak-color-bg-surface-muted)]"
            >
              <XMarkIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type Filter */}
          <select
            value={filters.type?.[0] || ''}
            onChange={(e) => handleFilterChange({ type: e.target.value ? [e.target.value as MemoryItem['type']] : undefined })}
            className="px-3 py-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm text-[var(--ak-color-text-primary)]"
          >
            <option value="">Alle Typen</option>
            <option value="preference">Präferenz</option>
            <option value="fact">Fakt</option>
            <option value="project">Projekt</option>
            <option value="note">Notiz</option>
            <option value="system">System</option>
          </select>
          
          {/* Source Filter */}
          <select
            value={filters.source?.[0] || ''}
            onChange={(e) => handleFilterChange({ source: e.target.value ? [e.target.value as MemoryItem['source']] : undefined })}
            className="px-3 py-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm text-[var(--ak-color-text-primary)]"
          >
            <option value="">Alle Quellen</option>
            <option value="chat">Chat</option>
            <option value="inbox">Posteingang</option>
            <option value="docs">Dokumente</option>
            <option value="email">E-Mail</option>
            <option value="telegram">Telegram</option>
            <option value="phone">Telefon</option>
            <option value="website">Website</option>
            <option value="crm">CRM</option>
          </select>
          
          {/* Scope Filter */}
          <select
            value={filters.scope || ''}
            onChange={(e) => handleFilterChange({ scope: e.target.value as MemoryItem['scope'] | undefined || undefined })}
            className="px-3 py-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm text-[var(--ak-color-text-primary)]"
          >
            <option value="">Alle Bereiche</option>
            <option value="user">Benutzer</option>
            <option value="customer">Kunde</option>
            <option value="company">Unternehmen</option>
          </select>
          
          {/* Range Filter */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-0.5">
            {(['today', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleFilterChange({ range })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filters.range === range
                    ? 'bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)]'
                    : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]'
                }`}
              >
                {range === 'today' ? 'Heute' : range === '7d' ? '7d' : range === '30d' ? '30d' : 'Alle'}
              </button>
            ))}
          </div>
          
          {/* Status Toggle */}
          <label className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)]">
            <input
              type="checkbox"
              checked={filters.status === 'active'}
              onChange={(e) => handleFilterChange({ status: e.target.checked ? 'active' : undefined })}
              className="rounded border-[var(--ak-color-border-subtle)]"
            />
            <span>Nur aktive</span>
          </label>
        </div>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="text-center py-12 text-sm text-[var(--ak-color-text-secondary)]">
            Lädt Memories...
          </div>
        ) : memories.length === 0 ? (
          <AkEmptyState
            title="Noch kein Memory"
            description="Du kannst jederzeit sehen, was AKLOW speichert – und es löschen."
            icon={<CircleStackIcon />}
            action={{
              label: 'Beispiel laden',
              onClick: () => {
                seedDemoMemoryIfEmpty()
                loadMemories()
              },
            }}
          />
        ) : (
          <div className="space-y-1">
            {memories.map((memory) => (
              <AkListRow
                key={memory.id}
                onClick={() => handleRowClick(memory.id)}
                title={
                  <div className="line-clamp-2 text-sm text-[var(--ak-color-text-primary)]">
                    {memory.text}
                  </div>
                }
                subtitle={
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <AkBadge tone="info" size="xs">
                      {memory.type}
                    </AkBadge>
                    <AkBadge tone="accent" size="xs">
                      {memory.source}
                    </AkBadge>
                    {memory.scope !== 'user' && (
                      <AkBadge tone="neutral" size="xs">
                        {memory.scope}
                      </AkBadge>
                    )}
                    {memory.customerName && (
                      <span className="text-xs text-[var(--ak-color-text-secondary)]">
                        {memory.customerName}
                      </span>
                    )}
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)]">
                    <ClockIcon className="h-4 w-4" />
                    {formatDate(memory.createdAt)}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

