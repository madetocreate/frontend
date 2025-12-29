'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  BoltIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  UserIcon,
  HashtagIcon,
  XMarkIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { kmuClient, type AutoReplyRule, type AutoReplyPreset } from '@/lib/kmuClient'

const CONDITION_FIELDS = [
  { id: 'subject', label: 'Betreff', icon: HashtagIcon },
  { id: 'body', label: 'Inhalt', icon: DocumentTextIcon },
  { id: 'from', label: 'Absender', icon: UserIcon },
]

const CONDITION_OPERATORS = [
  { id: 'contains', label: 'enthält' },
  { id: 'not_contains', label: 'enthält nicht' },
  { id: 'equals', label: 'ist gleich' },
  { id: 'starts_with', label: 'beginnt mit' },
  { id: 'ends_with', label: 'endet mit' },
  { id: 'regex', label: 'RegEx' },
]

const ACTION_TYPES = [
  { id: 'create_draft', label: 'Entwurf erstellen', icon: DocumentTextIcon },
  { id: 'add_note', label: 'Notiz hinzufügen', icon: DocumentTextIcon },
  { id: 'add_label', label: 'Label hinzufügen', icon: HashtagIcon },
  { id: 'assign_to', label: 'Zuweisen an', icon: UserIcon },
]

interface RuleFormData {
  name: string
  description: string
  trigger_type: string
  condition_field: string
  condition_operator: string
  condition_value: string
  action_type: string
  action_content: string
  requires_approval: boolean
}

const emptyFormData: RuleFormData = {
  name: '',
  description: '',
  trigger_type: 'email_received',
  condition_field: 'subject',
  condition_operator: 'contains',
  condition_value: '',
  action_type: 'create_draft',
  action_content: '',
  requires_approval: true,
}

export function AutoReplyRules() {
  const [rules, setRules] = useState<AutoReplyRule[]>([])
  const [presets, setPresets] = useState<AutoReplyPreset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPresets, setShowPresets] = useState(false)
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false)
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null)
  const [formData, setFormData] = useState<RuleFormData>(emptyFormData)
  const [isSaving, setIsSaving] = useState(false)

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true)
      const [rulesData, presetsData] = await Promise.all([
        kmuClient.getAutoReplyRules(),
        kmuClient.getAutoReplyPresets(),
      ])
      setRules(rulesData.rules || [])
      setPresets(presetsData.presets || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const handleCreate = () => {
    setEditingRule(null)
    setFormData(emptyFormData)
    setIsEditing(true)
  }

  const handleEdit = async (rule: AutoReplyRule) => {
    try {
      const { rule: full } = await kmuClient.getAutoReplyRule(rule.id)
      setEditingRule(full)
      setFormData({
        name: full.name,
        description: full.description || '',
        trigger_type: full.trigger_type,
        condition_field: full.condition.field,
        condition_operator: full.condition.operator,
        condition_value: full.condition.value,
        action_type: full.action.type,
        action_content: full.action.content || '',
        requires_approval: full.requires_approval,
      })
      setIsEditing(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Regel wirklich löschen?')) return
    try {
      await kmuClient.deleteAutoReplyRule(id)
      fetchRules()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
    }
  }

  const handleToggle = async (rule: AutoReplyRule) => {
    try {
      await kmuClient.toggleAutoReplyRule(rule.id, !rule.is_enabled)
      fetchRules()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Umschalten')
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      if (editingRule) {
        await kmuClient.updateAutoReplyRule(editingRule.id, {
          name: formData.name,
          description: formData.description,
          // @ts-expect-error - Backend expects flat fields (API typing ist hier (noch) nicht 1:1)
          condition_field: formData.condition_field,
          condition_operator: formData.condition_operator,
          condition_value: formData.condition_value,
          action_type: formData.action_type,
          action_content: formData.action_content,
          requires_approval: formData.requires_approval,
        })
      } else {
        await kmuClient.createAutoReplyRule({
          name: formData.name,
          description: formData.description,
          trigger_type: formData.trigger_type,
          condition_field: formData.condition_field,
          condition_operator: formData.condition_operator,
          condition_value: formData.condition_value,
          action_type: formData.action_type,
          action_content: formData.action_content,
          requires_approval: formData.requires_approval,
        })
      }
      setIsEditing(false)
      fetchRules()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleActivatePreset = async (index: number) => {
    try {
      await kmuClient.activateAutoReplyPreset(index)
      setShowPresets(false)
      fetchRules()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Aktivieren')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--ak-color-border-subtle)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Auto-Reply Regeln
          </h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Automatische Antworten auf eingehende Nachrichten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AkButton onClick={() => setShowPresets(true)} variant="ghost" size="sm">
            <SparklesIcon className="w-4 h-4 mr-1" />
            Vorlagen
          </AkButton>
          <AkButton onClick={handleCreate} variant="primary" size="sm">
            <PlusIcon className="w-4 h-4 mr-1" />
            Neue Regel
          </AkButton>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-4 p-3 rounded-lg bg-[var(--ak-semantic-danger-soft)] border border-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)}><XMarkIcon className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12">
            <BoltIcon className="w-12 h-12 mx-auto text-[var(--ak-color-text-tertiary)] mb-3" />
            <p className="text-[var(--ak-color-text-secondary)]">Noch keine Regeln</p>
            <p className="text-sm text-[var(--ak-color-text-tertiary)] mb-4">
              Erstelle eine neue Regel oder nutze eine Vorlage
            </p>
            <div className="flex items-center justify-center gap-2">
              <AkButton onClick={() => setShowPresets(true)} variant="ghost" size="sm">
                Vorlagen ansehen
              </AkButton>
              <AkButton onClick={handleCreate} variant="primary" size="sm">
                Erste Regel erstellen
              </AkButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  'p-4 rounded-xl border transition-all group',
                  rule.is_enabled
                    ? 'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)]'
                    : 'bg-[var(--ak-color-bg-surface-muted)] border-[var(--ak-color-border-subtle)] opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[var(--ak-color-text-primary)]">{rule.name}</span>
                      {rule.is_enabled ? (
                        <AkBadge tone="success" size="xs">Aktiv</AkBadge>
                      ) : (
                        <AkBadge tone="neutral" size="xs">Pausiert</AkBadge>
                      )}
                      {rule.requires_approval && (
                        <AkBadge tone="warning" size="xs">Prüfung</AkBadge>
                      )}
                    </div>
                    
                    {/* Rule Visualization */}
                    <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)] mt-2">
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--ak-color-bg-surface-muted)]">
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                        E-Mail empfangen
                      </span>
                      <ChevronRightIcon className="w-4 h-4" />
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]">
                        {CONDITION_FIELDS.find(f => f.id === rule.condition.field)?.label} {CONDITION_OPERATORS.find(o => o.id === rule.condition.operator)?.label} "{rule.condition.value}"
                      </span>
                      <ChevronRightIcon className="w-4 h-4" />
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]">
                        {ACTION_TYPES.find(a => a.id === rule.action.type)?.label}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--ak-color-text-tertiary)]">
                      <span>{rule.stats.matches} Treffer</span>
                      <span>{rule.stats.executions} Ausführungen</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={clsx(
                        'p-2 rounded-lg transition-colors',
                        rule.is_enabled
                          ? 'hover:bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]'
                          : 'hover:bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]'
                      )}
                      title={rule.is_enabled ? 'Pausieren' : 'Aktivieren'}
                    >
                      {rule.is_enabled ? (
                        <PauseIcon className="w-4 h-4" />
                      ) : (
                        <PlayIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)]"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 rounded-lg hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)]"
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
              className="bg-[var(--ak-color-bg-elevated)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--ak-color-border-subtle)] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                  {editingRule ? 'Regel bearbeiten' : 'Neue Regel'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                      placeholder="z.B. Rechnung → Zahlungsinfos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Beschreibung</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                      placeholder="Was macht diese Regel?"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div className="p-4 rounded-xl bg-[var(--ak-semantic-info-soft)] border border-[var(--ak-semantic-info-soft)]">
                  <h4 className="font-medium text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--ak-semantic-info)] text-[var(--ak-color-text-inverted)] text-xs flex items-center justify-center">1</span>
                    Wenn...
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <select
                        value={formData.condition_field}
                        onChange={(e) => setFormData({ ...formData, condition_field: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] text-sm"
                      >
                        {CONDITION_FIELDS.map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={formData.condition_operator}
                        onChange={(e) => setFormData({ ...formData, condition_operator: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] text-sm"
                      >
                        {CONDITION_OPERATORS.map(o => (
                          <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.condition_value}
                        onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] text-sm"
                        placeholder="Suchbegriff..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="p-4 rounded-xl bg-[var(--ak-semantic-success-soft)] border border-[var(--ak-semantic-success-soft)]">
                  <h4 className="font-medium text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] text-xs flex items-center justify-center">2</span>
                    Dann...
                  </h4>
                  <div className="space-y-3">
                    <select
                      value={formData.action_type}
                      onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                    >
                      {ACTION_TYPES.map(a => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                    {(formData.action_type === 'create_draft' || formData.action_type === 'add_note') && (
                      <textarea
                        value={formData.action_content}
                        onChange={(e) => setFormData({ ...formData, action_content: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] resize-none text-sm"
                        placeholder="Antworttext eingeben..."
                      />
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requires_approval}
                      onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">Vor dem Senden prüfen lassen</span>
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--ak-color-border-subtle)] flex justify-end gap-2">
                <AkButton variant="ghost" onClick={() => setIsEditing(false)}>
                  Abbrechen
                </AkButton>
                <AkButton
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving || !formData.name || !formData.condition_value}
                >
                  {isSaving ? 'Speichern...' : editingRule ? 'Aktualisieren' : 'Erstellen'}
                </AkButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presets Modal */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPresets(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--ak-color-bg-elevated)] rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--ak-color-border-subtle)] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                    Regel-Vorlagen
                  </h3>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">
                    Schnell starten mit bewährten Regeln
                  </p>
                </div>
                <button
                  onClick={() => setShowPresets(false)}
                  className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
                {presets.map((preset, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] transition-all cursor-pointer group"
                    onClick={() => handleActivatePreset(index)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-medium text-[var(--ak-color-text-primary)]">{preset.name}</span>
                        <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[var(--ak-color-text-tertiary)]">
                          <span className="px-2 py-0.5 rounded bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]">
                            {preset.condition_field} {preset.condition_operator} "{preset.condition_value}"
                          </span>
                        </div>
                      </div>
                      <AkButton
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Aktivieren
                      </AkButton>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

