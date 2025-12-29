'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MagnifyingGlassIcon,
  TrashIcon,
  TagIcon,
  CpuChipIcon,
  ClockIcon,
  ArchiveBoxIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { searchMemory, listMemory, archiveMemory, deleteMemory } from '@/lib/memoryClient'

interface MemoryEntry {
  id: string
  kind: string
  type: string
  content: string
  content_safe?: string
  tags?: string[]
  status: string
  created_at: string
  updated_at?: string
  metadata?: Record<string, unknown>
  entity_refs?: Record<string, string>
  confidence?: string
  score?: number
  // Vector Mirror fields
  vector_status?: string | null
  embedding_model?: string | null
  embedding_dim?: number | null
  vector_last_id?: number | null
  content_hash?: string | null
  vector_updated_at?: string | null
  drift_status?: string | null
}

export function MemoryExplorer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKind, setSelectedKind] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const limit = 50

  // Load initial list
  const loadMemories = useCallback(async (query: string = '', resetOffset: boolean = true, currentOffset: number = 0) => {
    setLoading(true)
    setError(null)
    
    try {
      if (query.trim()) {
        // Search API - verwende kanonische Keys (memory_kind, source_type)
        const filtersPayload: Record<string, string[]> = {};
        if (selectedKind) {
          filtersPayload.memory_kind = [selectedKind];
        }
        if (selectedSource) {
          filtersPayload.source_type = [selectedSource];
        }
        
        const data = await searchMemory({
          query: query.trim(),
          limit: limit,
          filters: Object.keys(filtersPayload).length > 0 ? filtersPayload : undefined,
        })
        const items = (data.items || []) as MemoryEntry[]
        setMemories(items)
        setTotal(items.length)
        if (resetOffset) {
          setOffset(0)
        }
      } else {
        // List API
        const params = new URLSearchParams({
          status: 'active',
          sort: 'created_at',
          order: 'desc',
          limit: limit.toString(),
          offset: resetOffset ? '0' : currentOffset.toString(),
        })
        if (selectedKind) {
          params.set('memory_kind', selectedKind)
        }
        if (selectedSource) {
          params.set('source_type', selectedSource)
        }
        
        const data = await listMemory({
          status: 'active',
          sort: 'created_at',
          order: 'desc',
          limit: limit,
          offset: resetOffset ? 0 : currentOffset,
          memoryKind: selectedKind || undefined,
          sourceType: selectedSource || undefined,
        })
        const items = (data.items || []) as MemoryEntry[]
        setMemories(prev => resetOffset ? items : [...prev, ...items])
        setTotal(data.total || items.length)
        if (resetOffset) {
          setOffset(0)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memories')
      console.error('Memory load error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedKind, selectedSource, limit])

  useEffect(() => {
    loadMemories(searchTerm, true, 0)
  }, [selectedKind, selectedSource]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Initial load
    loadMemories('', true, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(() => {
    setOffset(0)
    loadMemories(searchTerm, true, 0)
  }, [searchTerm, loadMemories])

  const handleArchive = async (id: string) => {
    try {
      await archiveMemory(id)
      // Reload
      loadMemories(searchTerm, true, 0)
    } catch (err) {
      console.error('Archive error:', err)
      alert('Fehler beim Archivieren')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Memory wirklich löschen?')) {
      return
    }
    
    try {
      await deleteMemory(id)
      // Reload
      loadMemories(searchTerm, true, 0)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Fehler beim Löschen')
    }
  }

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

  return (
    <div className="space-y-6">
       {/* Search Bar */}
       <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-secondary)]" />
          <input 
            type="text" 
            placeholder="Gedächtnis durchsuchen (Semantische Suche)..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] py-3 pl-12 pr-4 text-base shadow-sm focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-[var(--ak-color-text-secondary)]">Filter:</span>
          
          {/* Kind Filter */}
          <select
            value={selectedKind || ''}
            onChange={e => setSelectedKind(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm"
          >
            <option value="">Alle Arten</option>
            <option value="fact">Fakt</option>
            <option value="preference">Präferenz</option>
            <option value="instruction">Anweisung</option>
            <option value="summary">Zusammenfassung</option>
            <option value="note">Notiz</option>
          </select>

          {/* Source Filter */}
          <select
            value={selectedSource || ''}
            onChange={e => setSelectedSource(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm"
          >
            <option value="">Alle Quellen</option>
            <option value="chat">Chat</option>
            <option value="inbox">Posteingang</option>
            <option value="doc">Dokument</option>
            <option value="manual">Manuell</option>
            <option value="system">System</option>
          </select>

          {(selectedKind || selectedSource) && (
            <button
              onClick={() => {
                setSelectedKind(null)
                setSelectedSource(null)
              }}
              className="px-2 py-1 text-xs text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 px-2">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-[var(--ak-semantic-warning)] animate-pulse' : 'bg-[var(--ak-semantic-success)]'}`}></div>
              <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                {loading ? 'Lädt...' : 'Vector Store Online'}
              </span>
           </div>
           <div className="h-4 w-px bg-[var(--ak-color-border-subtle)]"></div>
           <span className="text-sm text-[var(--ak-color-text-secondary)]">{total} Memories</span>
        </div>

        {/* Error State */}
        {error && (
        <div className="p-4 rounded-lg bg-[var(--ak-semantic-danger-soft)] border border-[color-mix(in oklab,var(--ak-semantic-danger) 40%,var(--ak-color-border-fine) 60%)] text-[var(--ak-semantic-danger)] text-sm">
            {error}
          </div>
        )}

        {/* Memory Grid */}
        {loading && memories.length === 0 ? (
          <div className="text-center py-12 text-[var(--ak-color-text-secondary)]">
            Lädt Memories...
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12 text-[var(--ak-color-text-secondary)]">
            Keine Memories gefunden
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {memories.map((mem) => (
              <div key={mem.id} className="group relative p-5 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-surface-muted)]/50 transition-all hover:shadow-md">
                 <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-[var(--ak-color-text-muted)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 rounded border border-[var(--ak-color-border-subtle)]">
                        {mem.id.slice(0, 8)}...
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)] border border-[color-mix(in oklab,var(--ak-semantic-info) 40%,var(--ak-color-border-fine) 60%)]">
                        {mem.kind}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)] border border-[color-mix(in oklab,var(--ak-accent-documents) 40%,var(--ak-color-border-fine) 60%)]">
                        {mem.type}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[var(--ak-color-text-secondary)]">
                        <ClockIcon className="w-3 h-3" /> {formatDate(mem.created_at)}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button 
                         onClick={() => handleArchive(mem.id)}
                         className="p-1.5 text-[var(--ak-accent-growth)] hover:bg-[var(--ak-accent-growth-soft)] rounded-lg transition-colors" 
                         title="Archivieren"
                       >
                          <ArchiveBoxIcon className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(mem.id)}
                         className="p-1.5 text-[var(--ak-semantic-danger)] hover:bg-[var(--ak-semantic-danger-soft)] rounded-lg transition-colors" 
                         title="Löschen"
                       >
                          <TrashIcon className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
                 
                 <p className="text-[var(--ak-color-text-primary)] leading-relaxed mb-4">
                   {mem.content_safe || mem.content}
                 </p>

                 <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {(mem.tags || []).slice(0, 5).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)] text-xs font-medium border border-[color-mix(in oklab,var(--ak-semantic-info) 40%,var(--ak-color-border-fine) 60%)]">
                          <TagIcon className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                      {(mem.tags || []).length > 5 && (
                        <span className="text-xs text-[var(--ak-color-text-secondary)]">
                          +{(mem.tags || []).length - 5} mehr
                        </span>
                      )}
                    </div>
                    {mem.score !== undefined && mem.score !== null && (
                      <div className="flex items-center gap-1 text-xs font-medium text-[var(--ak-color-accent)]">
                        <CpuChipIcon className="w-3 h-3" />
                        {(mem.score * 100).toFixed(0)}% Match
                      </div>
                    )}
                 </div>

                 {/* Vector Mirror Section */}
                 {mem.vector_status && (
                   <div className="mt-4 pt-4 border-t border-[var(--ak-color-border-subtle)]">
                     <div className="flex items-center gap-2 flex-wrap text-xs">
                       <span className="text-[var(--ak-color-text-secondary)] font-medium">Vektor:</span>
                       {/* Status Badge */}
                       <span className={`px-2 py-0.5 rounded-md font-medium ${
                         mem.drift_status === 'ok' || mem.vector_status === 'ready'
                           ? 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] border border-[color-mix(in oklab,var(--ak-semantic-success) 40%,var(--ak-color-border-fine) 60%)]'
                           : mem.drift_status === 'mismatch' || mem.vector_status === 'failed'
                           ? 'bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] border border-[color-mix(in oklab,var(--ak-semantic-danger) 40%,var(--ak-color-border-fine) 60%)]'
                           : 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)] border border-[color-mix(in oklab,var(--ak-semantic-warning) 40%,var(--ak-color-border-fine) 60%)]'
                       }`}>
                         {mem.drift_status === 'ok' ? 'ready' : mem.drift_status === 'mismatch' ? 'drift' : mem.vector_status === 'pending' ? 'pending' : 'missing'}
                       </span>
                       {/* Model + Dim */}
                       {mem.embedding_model && (
                         <span className="text-[var(--ak-color-text-secondary)]">
                           {mem.embedding_model.replace('text-embedding-', '')}
                           {mem.embedding_dim && ` (${mem.embedding_dim})`}
                         </span>
                       )}
                       {/* Fingerprint */}
                       {mem.content_hash && (
                         <span className="font-mono text-[10px] text-[var(--ak-color-text-muted)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 rounded border border-[var(--ak-color-border-subtle)]">
                           {mem.content_hash.slice(0, 8)}...
                         </span>
                       )}
                       {/* Last Updated */}
                       {mem.vector_updated_at && (
                         <span className="flex items-center gap-1 text-[var(--ak-color-text-muted)]">
                           <ClockIcon className="w-3 h-3" /> {formatDate(mem.vector_updated_at)}
                         </span>
                       )}
                     </div>
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && memories.length > 0 && memories.length < total && !searchTerm.trim() && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                const newOffset = offset + limit
                setOffset(newOffset)
                loadMemories(searchTerm, false, newOffset)
              }}
              className="px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-surface-muted)] text-sm"
            >
              Mehr laden ({total - memories.length} verbleibend)
            </button>
          </div>
        )}
    </div>
  )
}
