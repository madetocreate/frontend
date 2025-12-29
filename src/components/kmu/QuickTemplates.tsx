'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  DocumentDuplicateIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HashtagIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { kmuClient, type ResponseTemplate, type TemplateVariable } from '@/lib/kmuClient'

const CATEGORIES = [
  { id: 'general', label: 'Allgemein', color: 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]' },
  { id: 'support', label: 'Support', color: 'bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]' },
  { id: 'sales', label: 'Vertrieb', color: 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]' },
  { id: 'billing', label: 'Abrechnung', color: 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]' },
]

interface TemplateFormData {
  name: string
  shortcut: string
  category: string
  subject_template: string
  body_template: string
  variables: TemplateVariable[]
}

const emptyFormData: TemplateFormData = {
  name: '',
  shortcut: '',
  category: 'general',
  subject_template: '',
  body_template: '',
  variables: [],
}

export function QuickTemplates() {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>(emptyFormData)
  const [isSaving, setIsSaving] = useState(false)

  // Preview state
  const [previewTemplate, setPreviewTemplate] = useState<ResponseTemplate | null>(null)
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({})
  const [renderedPreview, setRenderedPreview] = useState<{ body: string; subject: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await kmuClient.getTemplates(selectedCategory || undefined)
      setTemplates(data.templates || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData(emptyFormData)
    setIsEditing(true)
  }

  const handleEdit = (template: ResponseTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      shortcut: template.shortcut || '',
      category: template.category,
      subject_template: template.subject_template || '',
      body_template: template.body_template,
      variables: template.variables || [],
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Template wirklich löschen?')) return
    try {
      await kmuClient.deleteTemplate(id)
      fetchTemplates()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      if (editingTemplate) {
        await kmuClient.updateTemplate(editingTemplate.id, formData)
      } else {
        await kmuClient.createTemplate(formData)
      }
      setIsEditing(false)
      fetchTemplates()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = async (template: ResponseTemplate) => {
    setPreviewTemplate(template)
    const vars: Record<string, string> = {}
    template.variables?.forEach(v => {
      vars[v.name] = v.default_value || ''
    })
    setPreviewVariables(vars)
    
    try {
      const result = await kmuClient.applyTemplate(template.id, vars)
      setRenderedPreview({ body: result.rendered_body, subject: result.rendered_subject })
    } catch (e) {
      console.error('Preview error:', e)
    }
  }

  const handleCopy = async () => {
    if (!renderedPreview) return
    await navigator.clipboard.writeText(renderedPreview.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updatePreviewVariable = async (name: string, value: string) => {
    const newVars = { ...previewVariables, [name]: value }
    setPreviewVariables(newVars)
    
    if (previewTemplate) {
      try {
        const result = await kmuClient.applyTemplate(previewTemplate.id, newVars)
        setRenderedPreview({ body: result.rendered_body, subject: result.rendered_subject })
      } catch (e) {
        console.error('Preview update error:', e)
      }
    }
  }

  const filteredTemplates = templates.filter(t => 
    searchQuery === '' || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortcut?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--ak-color-border-subtle)]">
            <div>
          <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                Quick Templates
          </h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Antwortvorlagen für schnelle Reaktionen
              </p>
            </div>
        <AkButton onClick={handleCreate} variant="primary" size="sm">
          <PlusIcon className="w-4 h-4 mr-1" />
          Neues Template
            </AkButton>
        </div>

      {/* Filters */}
      <div className="p-4 space-y-3 border-b border-[var(--ak-color-border-subtle)]">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ak-color-text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen... (z.B. /danke)"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] placeholder-[var(--ak-color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              !selectedCategory
                ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]'
                : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
            )}
          >
            Alle
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                selectedCategory === cat.id
                  ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[var(--ak-semantic-danger)]">{error}</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="w-12 h-12 mx-auto text-[var(--ak-color-text-tertiary)] mb-3" />
            <p className="text-[var(--ak-color-text-secondary)]">Noch keine Templates</p>
            <AkButton onClick={handleCreate} variant="ghost" size="sm" className="mt-2">
                Erstes Template erstellen
              </AkButton>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTemplates.map(template => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-default)] transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[var(--ak-color-text-primary)]">{template.name}</span>
                      {template.shortcut && (
                        <span className="px-2 py-0.5 rounded bg-[var(--ak-color-bg-surface-muted)] text-xs font-mono text-[var(--ak-color-text-secondary)]">
                          {template.shortcut}
                        </span>
                      )}
                      <AkBadge tone="neutral" size="xs">
                        {CATEGORIES.find(c => c.id === template.category)?.label || template.category}
                      </AkBadge>
                    </div>
                    <p className="text-sm text-[var(--ak-color-text-secondary)] line-clamp-2">
                      {template.body_template.slice(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--ak-color-text-tertiary)]">
                      <span>{template.use_count}x verwendet</span>
                      {template.variables?.length > 0 && (
                        <span>{template.variables.length} Variablen</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)]"
                      title="Vorschau & Kopieren"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)]"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 rounded-lg hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--ak-color-bg-elevated)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--ak-color-border-subtle)] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                  {editingTemplate ? 'Template bearbeiten' : 'Neues Template'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                      placeholder="z.B. Danke-Antwort"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Shortcut</label>
                    <input
                      type="text"
                      value={formData.shortcut}
                      onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                      placeholder="/danke"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Kategorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Betreff (optional)</label>
                  <input
                    type="text"
                    value={formData.subject_template}
                    onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                    placeholder="Re: {{betreff}}"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Text</label>
                  <textarea
                    value={formData.body_template}
                    onChange={(e) => setFormData({ ...formData, body_template: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] resize-none"
                    placeholder="Vielen Dank für Ihre Nachricht, {{name}}!

Wir werden uns schnellstmöglich bei Ihnen melden.

Mit freundlichen Grüßen"
                  />
                  <p className="text-xs text-[var(--ak-color-text-tertiary)] mt-1">
                    Verwende {"{{variable}}"} für dynamische Inhalte. System-Variablen: datum, zeit, wochentag
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--ak-color-border-subtle)] flex justify-end gap-2">
                <AkButton variant="ghost" onClick={() => setIsEditing(false)}>
                  Abbrechen
                </AkButton>
                <AkButton variant="primary" onClick={handleSave} disabled={isSaving || !formData.name || !formData.body_template}>
                  {isSaving ? 'Speichern...' : editingTemplate ? 'Aktualisieren' : 'Erstellen'}
                </AkButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--ak-color-bg-elevated)] rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--ak-color-border-subtle)] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                  {previewTemplate.name}
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {previewTemplate.variables?.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Variablen</label>
                    {previewTemplate.variables.map(v => (
                      <div key={v.name} className="flex items-center gap-2">
                        <span className="text-sm text-[var(--ak-color-text-tertiary)] w-24">{v.name}:</span>
                        <input
                          type="text"
                          value={previewVariables[v.name] || ''}
                          onChange={(e) => updatePreviewVariable(v.name, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm rounded bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]"
                          placeholder={v.description || v.default_value || ''}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Vorschau</label>
                  <div className="mt-2 p-3 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
                    {renderedPreview?.subject && (
                      <div className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-2 pb-2 border-b border-[var(--ak-color-border-subtle)]">
                        {renderedPreview.subject}
                      </div>
                    )}
                    <div className="text-sm text-[var(--ak-color-text-primary)] whitespace-pre-wrap">
                      {renderedPreview?.body || previewTemplate.body_template}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--ak-color-border-subtle)] flex justify-end gap-2">
                <AkButton variant="ghost" onClick={() => setPreviewTemplate(null)}>
                  Schließen
                </AkButton>
                <AkButton variant="primary" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Kopiert!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                      Kopieren
                    </>
                  )}
                </AkButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
