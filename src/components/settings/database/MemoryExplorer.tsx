'use client'

import { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  TrashIcon,
  TagIcon,
  CpuChipIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export function MemoryExplorer() {
  const [searchTerm, setSearchTerm] = useState('')

  // Dummy Data for Vector Memories
  const memories = [
    { id: 'vec_98234', content: 'Kunde Müller bevorzugt Kommunikation per E-Mail am Vormittag.', tags: ['preference', 'contact'], relevance: 0.98, date: 'Heute, 10:23' },
    { id: 'vec_12938', content: 'Projekt Alpha Deadline wurde auf 15.03. verschoben.', tags: ['project', 'deadline'], relevance: 0.85, date: 'Gestern' },
    { id: 'vec_48291', content: 'Rechnungsadresse für TechCorp geändert auf neue Straße 12.', tags: ['billing', 'address'], relevance: 0.76, date: '12.12.2023' },
    { id: 'vec_11029', content: 'Meeting Notizen: Budgeterhöhung wurde genehmigt.', tags: ['meeting', 'budget'], relevance: 0.65, date: '10.12.2023' },
  ]

  const filtered = memories.filter(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()) || m.tags.some(t => t.includes(searchTerm.toLowerCase())))

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
            className="w-full rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] py-3 pl-12 pr-4 text-base shadow-sm focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 px-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Vector Store Online</span>
           </div>
           <div className="h-4 w-px bg-[var(--ak-color-border-subtle)]"></div>
           <span className="text-sm text-[var(--ak-color-text-secondary)]">24.5k Embeddings</span>
           <div className="h-4 w-px bg-[var(--ak-color-border-subtle)]"></div>
           <span className="text-sm text-[var(--ak-color-text-secondary)]">Last Index: 2min ago</span>
        </div>

        {/* Memory Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((mem) => (
            <div key={mem.id} className="group relative p-5 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-surface-muted)]/50 transition-all hover:shadow-md">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--ak-color-text-muted)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 rounded border border-[var(--ak-color-border-subtle)]">
                      {mem.id}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[var(--ak-color-text-secondary)]">
                      <ClockIcon className="w-3 h-3" /> {mem.date}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                     <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Löschen">
                        <TrashIcon className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               <p className="text-[var(--ak-color-text-primary)] leading-relaxed mb-4">
                 {mem.content}
               </p>

               <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {mem.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        <TagIcon className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-[var(--ak-color-accent)]">
                    <CpuChipIcon className="w-3 h-3" />
                    {(mem.relevance * 100).toFixed(0)}% Match
                  </div>
               </div>
            </div>
          ))}
        </div>
    </div>
  )
}
