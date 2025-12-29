'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AtSymbolIcon,
  UserCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { AkButton } from '@/components/ui/AkButton'
import { kmuClient, type InternalNote } from '@/lib/kmuClient'

interface InternalNotesProps {
  inboxItemId?: string
  threadId?: string
  compact?: boolean
}

export function InternalNotes({ inboxItemId, threadId, compact = false }: InternalNotesProps) {
  const [notes, setNotes] = useState<InternalNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Editor state
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<InternalNote | null>(null)
  const [newContent, setNewContent] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const fetchNotes = useCallback(async () => {
    if (!inboxItemId && !threadId) return
    
    try {
      setIsLoading(true)
      const data = await kmuClient.getNotes(inboxItemId, threadId)
      setNotes(data.notes || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }, [inboxItemId, threadId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleCreate = async () => {
    if (!newContent.trim()) return
    
    try {
      setIsSaving(true)
      await kmuClient.createNote({
        inbox_item_id: inboxItemId,
        thread_id: threadId,
        content: newContent,
        mentions,
      })
      setNewContent('')
      setMentions([])
      setIsCreating(false)
      fetchNotes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Erstellen')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (note: InternalNote) => {
    if (!newContent.trim()) return
    
    try {
      setIsSaving(true)
      await kmuClient.updateNote(note.id, { content: newContent, mentions })
      setEditingNote(null)
      setNewContent('')
      setMentions([])
      fetchNotes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Aktualisieren')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Notiz wirklich löschen?')) return
    
    try {
      await kmuClient.deleteNote(id)
      fetchNotes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
    }
  }

  const handlePin = async (note: InternalNote) => {
    try {
      await kmuClient.updateNote(note.id, { is_pinned: !note.is_pinned })
      fetchNotes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Anheften')
    }
  }

  const startEdit = (note: InternalNote) => {
    setEditingNote(note)
    setNewContent(note.content)
    setMentions(note.mentions || [])
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setIsCreating(false)
    setNewContent('')
    setMentions([])
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!inboxItemId && !threadId) {
    return (
      <div className="p-4 text-center text-[var(--ak-color-text-secondary)]">
        <ChatBubbleLeftEllipsisIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Wähle ein Element aus, um Notizen anzuzeigen</p>
      </div>
    )
  }

  return (
    <div className={clsx('flex flex-col', compact ? 'h-full' : '')}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between p-4 border-b border-[var(--ak-color-border-subtle)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
              Interne Notizen
            </h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
              Team-Kommunikation zu diesem Element
            </p>
          </div>
          <AkButton onClick={() => { setIsCreating(true); setEditingNote(null); }} variant="primary" size="sm">
            <PlusIcon className="w-4 h-4 mr-1" />
            Notiz
          </AkButton>
        </div>
      )}

      {/* Compact header */}
      {compact && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--ak-color-border-subtle)]">
          <span className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
            Notizen ({notes.length})
          </span>
          <button
            onClick={() => { setIsCreating(true); setEditingNote(null); }}
            className="p-1 rounded hover:bg-[var(--ak-color-bg-hover)]"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingNote) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-[var(--ak-color-border-subtle)]"
          >
            <div className="p-3 space-y-3">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                placeholder="Notiz eingeben... (@name zum Erwähnen)"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-tertiary)]">
                  <AtSymbolIcon className="w-4 h-4" />
                  <span>@name zum Erwähnen</span>
                </div>
                <div className="flex gap-2">
                  <AkButton variant="ghost" size="sm" onClick={cancelEdit}>
                    Abbrechen
                  </AkButton>
                  <AkButton
                    variant="primary"
                    size="sm"
                    onClick={() => editingNote ? handleUpdate(editingNote) : handleCreate()}
                    disabled={isSaving || !newContent.trim()}
                  >
                    {isSaving ? 'Speichern...' : editingNote ? 'Aktualisieren' : 'Hinzufügen'}
                  </AkButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className={clsx('flex-1 overflow-y-auto', compact ? 'p-2' : 'p-4')}>
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--ak-color-accent)]" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-[var(--ak-semantic-danger)] text-sm">{error}</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftEllipsisIcon className="w-10 h-10 mx-auto text-[var(--ak-color-text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Noch keine Notizen</p>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="mt-2 text-sm text-[var(--ak-color-accent)] hover:underline"
              >
                Erste Notiz erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  'p-3 rounded-xl border transition-all group',
                  note.is_pinned
                    ? 'bg-[var(--ak-semantic-warning-soft)] border-[var(--ak-semantic-warning-soft)]'
                    : 'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-default)]'
                )}
              >
                {/* Author & Meta */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5 text-[var(--ak-color-text-tertiary)]" />
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                      {note.author_name}
                    </span>
                    <span className="text-xs text-[var(--ak-color-text-tertiary)]">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePin(note)}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        note.is_pinned
                          ? 'text-[var(--ak-semantic-warning)] hover:bg-[var(--ak-semantic-warning-soft)]'
                          : 'text-[var(--ak-color-text-tertiary)] hover:bg-[var(--ak-color-bg-hover)]'
                      )}
                      title={note.is_pinned ? 'Loslösen' : 'Anheften'}
                    >
                      {note.is_pinned ? (
                        <BookmarkSolidIcon className="w-4 h-4" />
                      ) : (
                        <BookmarkSolidIcon className="w-4 h-4 opacity-40" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-tertiary)]"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)]"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-[var(--ak-color-text-primary)] whitespace-pre-wrap">
                  {note.content}
                </p>

                {/* Mentions */}
                {note.mentions?.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {note.mentions.map(mention => (
                      <span
                        key={mention}
                        className="px-2 py-0.5 rounded-full bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)] text-xs"
                      >
                        @{mention}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Widget version for embedding in other panels
export function InternalNotesWidget({ inboxItemId, threadId }: InternalNotesProps) {
  return (
    <div className="rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] overflow-hidden h-64">
      <InternalNotes inboxItemId={inboxItemId} threadId={threadId} compact />
    </div>
  )
}
