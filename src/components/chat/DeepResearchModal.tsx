'use client'

import { useState } from 'react'
import { AkModal } from '@/components/ui/AkModal'
import { AkButton } from '@/components/ui/AkButton'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface DeepResearchModalProps {
  isOpen: boolean
  onClose: () => void
  onStartResearch: (query: string) => void
}

export function DeepResearchModal({ isOpen, onClose, onStartResearch }: DeepResearchModalProps) {
  const [query, setQuery] = useState('')

  const handleStart = () => {
    if (!query.trim()) return
    onStartResearch(query)
    onClose()
    setQuery('')
  }

  return (
    <AkModal
      isOpen={isOpen}
      onClose={onClose}
      title="Intensive Internetsuche"
      size="md"
    >
      <div className="space-y-4">
        <div className="text-sm ak-text-secondary">
          Der Deep Research Agent durchsucht das Web, analysiert Quellen und erstellt einen umfassenden Bericht. Dies kann einige Minuten dauern.
        </div>
        
        <div>
          <label className="block text-xs font-semibold ak-text-secondary mb-1.5 uppercase tracking-wide">
            Thema oder Frage
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-3 rounded-xl bg-[var(--ak-color-bg-surface-secondary)] border border-[var(--ak-color-border-subtle)] focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)] focus:outline-none resize-none text-sm ak-text-primary"
            placeholder="Beschreibe, wonach du suchen möchtest..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleStart()
              }
            }}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <AkButton variant="ghost" onClick={onClose}>
            Abbrechen
          </AkButton>
          <AkButton 
            variant="primary" 
            onClick={handleStart}
            disabled={!query.trim()}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          >
            Recherche starten
          </AkButton>
        </div>
      </div>
    </AkModal>
  )
}

