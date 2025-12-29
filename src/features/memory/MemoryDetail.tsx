'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftIcon, ArchiveBoxIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import type { MemoryItem } from './types'
import { fetchMemoryDetail, patchMemory, deleteMemoryItem, archiveMemoryItem } from './api'

interface MemoryDetailProps {
  id: string
  onBack: () => void
  onUpdate: () => void
}

export function MemoryDetail({ id, onBack, onUpdate }: MemoryDetailProps) {
  const [memory, setMemory] = useState<MemoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  
  useEffect(() => {
    loadDetail()
  }, [id])
  
  const loadDetail = async () => {
    setLoading(true)
    try {
      const item = await fetchMemoryDetail(id)
      setMemory(item)
      if (item) {
        setEditedText(item.text)
      }
    } catch (error) {
      console.error('Failed to load memory detail', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleArchive = async () => {
    if (!memory) return
    
    try {
      await archiveMemoryItem(memory.id)
      onUpdate()
      onBack()
    } catch (error) {
      console.error('Failed to archive memory', error)
      alert('Fehler beim Archivieren')
    }
  }
  
  const handleDelete = async () => {
    if (!memory) return
    
    if (!confirm('Memory wirklich löschen?')) {
      return
    }
    
    try {
      await deleteMemoryItem(memory.id)
      onUpdate()
      onBack()
    } catch (error) {
      console.error('Failed to delete memory', error)
      alert('Fehler beim Löschen')
    }
  }
  
  const handleSave = async () => {
    if (!memory) return
    
    try {
      await patchMemory(memory.id, { text: editedText })
      await loadDetail()
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to save memory', error)
      alert('Fehler beim Speichern')
    }
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-6 py-4 border-b border-[var(--ak-color-border-hairline)]">
          <div className="text-sm text-[var(--ak-color-text-secondary)]">Lädt...</div>
        </div>
      </div>
    )
  }
  
  if (!memory) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-6 py-4 border-b border-[var(--ak-color-border-hairline)]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Zurück
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Memory nicht gefunden</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--ak-color-border-hairline)]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Zurück
          </button>
          
          <div className="flex items-center gap-2">
            {memory.status === 'active' ? (
              <AkButton
                variant="ghost"
                size="sm"
                onClick={handleArchive}
              >
                <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                Archivieren
              </AkButton>
            ) : (
              <AkButton
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await patchMemory(memory.id, { status: 'active' })
                    await loadDetail()
                    onUpdate()
                  } catch (error) {
                    console.error('Failed to activate memory', error)
                    alert('Fehler beim Aktivieren')
                  }
                }}
              >
                Aktivieren
              </AkButton>
            )}
            
            <AkButton
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-[var(--ak-semantic-danger)] hover:bg-[var(--ak-semantic-danger-soft)]"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Löschen
            </AkButton>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <AkBadge tone="info" size="sm">
            {memory.type}
          </AkBadge>
          <AkBadge tone="accent" size="sm">
            {memory.source}
          </AkBadge>
          {memory.scope !== 'user' && (
            <AkBadge tone="neutral" size="sm">
              {memory.scope}
            </AkBadge>
          )}
          <AkBadge tone={memory.status === 'active' ? 'success' : 'muted'} size="sm">
            {memory.status}
          </AkBadge>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full min-h-[200px] rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-3 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)]"
              placeholder="Memory-Text..."
            />
            <div className="flex items-center gap-2">
              <AkButton
                variant="primary"
                size="sm"
                onClick={handleSave}
              >
                Speichern
              </AkButton>
              <AkButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditedText(memory.text)
                }}
              >
                Abbrechen
              </AkButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                  Erinnerung
                </h2>
                <AkButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Bearbeiten
                </AkButton>
              </div>
              <p className="text-base text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap">
                {memory.text}
              </p>
            </div>
            
            {/* Meta */}
            <div className="pt-6 border-t border-[var(--ak-color-border-subtle)] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ak-color-text-secondary)]">Erstellt</span>
                <span className="text-[var(--ak-color-text-primary)]">{formatDate(memory.createdAt)}</span>
              </div>
              {memory.updatedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--ak-color-text-secondary)]">Aktualisiert</span>
                  <span className="text-[var(--ak-color-text-primary)]">{formatDate(memory.updatedAt)}</span>
                </div>
              )}
              {memory.customerName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--ak-color-text-secondary)]">Kunde</span>
                  <span className="text-[var(--ak-color-text-primary)]">{memory.customerName}</span>
                </div>
              )}
              {memory.tags && memory.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-sm text-[var(--ak-color-text-secondary)] shrink-0">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {memory.tags.map((tag) => (
                      <AkBadge key={tag} tone="neutral" size="xs">
                        {tag}
                      </AkBadge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

