'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import {
  BoltIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'

// ============================================================================
// Types
// ============================================================================

interface AutoReplyRule {
  id: string
  name: string
  description?: string
  is_enabled: boolean
  trigger_type: string
  trigger_source?: string
  condition: {
    field: string
    operator: string
    value: string
  }
  action: {
    type: string
    template_id?: string
    content?: string
  }
  requires_approval: boolean
  stats: {
    executions: number
    matches: number
  }
}

interface PresetRule {
  name: string
  description: string
  trigger_type: string
  condition_field: string
  condition_operator: string
  condition_value: string
  action_type: string
  action_content: string
}

// ============================================================================
// Hook
// ============================================================================

export function useAutoReplyRules() {
  const [rules, setRules] = useState<AutoReplyRule[]>([])
  const [presets, setPresets] = useState<PresetRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true)
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/kmu/auto-reply/rules')
      if (!res.ok) throw new Error('Failed to fetch rules')
      const data = await res.json()
      setRules(data.rules || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPresets = useCallback(async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/kmu/auto-reply/presets')
      if (!res.ok) throw new Error('Failed to fetch presets')
      const data = await res.json()
      setPresets(data.presets || [])
    } catch (e) {
      console.error('Failed to fetch presets:', e)
    }
  }, [])

  const createRule = useCallback(async (rule: Partial<AutoReplyRule>) => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch('/api/kmu/auto-reply/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    })
    if (!res.ok) throw new Error('Failed to create rule')
    await fetchRules()
    return res.json()
  }, [fetchRules])

  const toggleRule = useCallback(async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/kmu/auto-reply/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_enabled: enabled }),
    })
    if (!res.ok) throw new Error('Failed to toggle rule')
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_enabled: enabled } : r))
  }, [])

  const deleteRule = useCallback(async (id: string) => {
    const res = await fetch(`/api/kmu/auto-reply/rules/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete rule')
    setRules(prev => prev.filter(r => r.id !== id))
  }, [])

  const activatePreset = useCallback(async (index: number) => {
    const res = await fetch(`/api/kmu/auto-reply/presets/${index}/activate`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error('Failed to activate preset')
    await fetchRules()
    return res.json()
  }, [fetchRules])

  useEffect(() => {
    fetchRules()
    fetchPresets()
  }, [fetchRules, fetchPresets])

  return {
    rules,
    presets,
    isLoading,
    error,
    createRule,
    toggleRule,
    deleteRule,
    activatePreset,
    refresh: fetchRules,
  }
}

// ============================================================================
// Rule Card
// ============================================================================

interface RuleCardProps {
  rule: AutoReplyRule
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
  onEdit?: (rule: AutoReplyRule) => void
}

function RuleCard({ rule, onToggle, onDelete, onEdit }: RuleCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(rule.id, !rule.is_enabled)
    } finally {
      setIsLoading(false)
    }
  }

  const operatorLabels: Record<string, string> = {
    contains: 'enthält',
    not_contains: 'enthält nicht',
    equals: 'ist gleich',
    starts_with: 'beginnt mit',
    ends_with: 'endet mit',
    regex: 'matcht Regex',
  }

  const fieldLabels: Record<string, string> = {
    subject: 'Betreff',
    body: 'Inhalt',
    from: 'Absender',
    content: 'Alles',
  }

  const actionLabels: Record<string, string> = {
    create_draft: 'Draft erstellen',
    send_reply: 'Antwort senden',
    add_label: 'Label hinzufügen',
    assign_to: 'Zuweisen an',
    add_note: 'Notiz hinzufügen',
    use_template: 'Template verwenden',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'p-4 rounded-xl border transition-all',
        rule.is_enabled
          ? 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]'
          : 'border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface-muted)] opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            rule.is_enabled
              ? 'bg-[var(--ak-color-bg-success)]'
              : 'bg-[var(--ak-color-bg-surface-muted)]'
          )}>
            {rule.is_enabled ? (
              <PlayIcon className="h-5 w-5 text-[var(--ak-color-text-success)]" />
            ) : (
              <PauseIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
              {rule.name}
            </h3>
            {rule.description && (
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                {rule.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)]"
            title={rule.is_enabled ? 'Deaktivieren' : 'Aktivieren'}
          >
            {rule.is_enabled ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(rule)}
              className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)]"
              title="Bearbeiten"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('Regel wirklich löschen?')) {
                onDelete(rule.id)
              }
            }}
            className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-danger)]"
            title="Löschen"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Rule Logic */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="px-2 py-1 rounded-md bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)] font-medium">
          WENN
        </span>
        <span className="text-[var(--ak-color-text-secondary)]">
          {fieldLabels[rule.condition.field] || rule.condition.field}
        </span>
          <span className="px-2 py-1 rounded-md bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning-strong)]">
          {operatorLabels[rule.condition.operator] || rule.condition.operator}
        </span>
        <span className="px-2 py-1 rounded-md bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] font-mono">
          "{rule.condition.value}"
        </span>
          <span className="px-2 py-1 rounded-md bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success-strong)] font-medium">
          DANN
        </span>
        <span className="text-[var(--ak-color-text-secondary)]">
          {actionLabels[rule.action.type] || rule.action.type}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {rule.requires_approval && (
            <AkBadge tone="warning" size="xs">
              Freigabe erforderlich
            </AkBadge>
          )}
          <AkBadge tone={rule.is_enabled ? 'success' : 'muted'} size="xs">
            {rule.is_enabled ? 'Aktiv' : 'Pausiert'}
          </AkBadge>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[var(--ak-color-text-muted)]">
          <span>{rule.stats.matches} Treffer</span>
          <span>{rule.stats.executions} Ausführungen</span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Preset Card
// ============================================================================

interface PresetCardProps {
  preset: PresetRule
  index: number
  onActivate: (index: number) => Promise<void>
  isActivated?: boolean
}

function PresetCard({ preset, index, onActivate, isActivated }: PresetCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleActivate = async () => {
    setIsLoading(true)
    try {
      await onActivate(index)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'p-4 rounded-xl border transition-all',
        isActivated
          ? 'border-[var(--ak-semantic-success-soft)] bg-[var(--ak-semantic-success-soft)]/80'
          : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)]'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ak-accent-automation-soft)]">
            <LightBulbIcon className="h-5 w-5 text-[var(--ak-accent-automation)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
              {preset.name}
            </h3>
            <p className="text-xs text-[var(--ak-color-text-muted)]">
              {preset.description}
            </p>
          </div>
        </div>
        <AkButton
          variant={isActivated ? 'secondary' : 'primary'}
          accent="automation"
          size="sm"
          onClick={handleActivate}
          disabled={isLoading || isActivated}
          leftIcon={isActivated ? <CheckCircleIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
        >
          {isActivated ? 'Aktiviert' : 'Aktivieren'}
        </AkButton>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Rule Editor Modal
// ============================================================================

interface RuleEditorProps {
  onSave: (rule: any) => Promise<void>
  onClose: () => void
}

function RuleEditor({ onSave, onClose }: RuleEditorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [conditionField, setConditionField] = useState('subject')
  const [conditionOperator, setConditionOperator] = useState('contains')
  const [conditionValue, setConditionValue] = useState('')
  const [actionType, setActionType] = useState('create_draft')
  const [actionContent, setActionContent] = useState('')
  const [requiresApproval, setRequiresApproval] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        name,
        description,
        trigger_type: 'email_received',
        condition_field: conditionField,
        condition_operator: conditionOperator,
        condition_value: conditionValue,
        action_type: actionType,
        action_content: actionContent,
        requires_approval: requiresApproval,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[var(--ak-color-bg-surface)] rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--ak-color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Neue Auto-Reply Regel
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]">
            <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-accent-primary)]"
              placeholder="z.B. Rechnung → Zahlungsinfos"
            />
          </div>

          {/* Condition */}
          <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)] space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--ak-semantic-info)]">
            <span className="px-2 py-0.5 rounded bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]">WENN</span>
              <span className="text-[var(--ak-color-text-secondary)]">E-Mail empfangen</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <select
                value={conditionField}
                onChange={(e) => setConditionField(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm"
              >
                <option value="subject">Betreff</option>
                <option value="body">Inhalt</option>
                <option value="from">Absender</option>
              </select>
              
              <select
                value={conditionOperator}
                onChange={(e) => setConditionOperator(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm"
              >
                <option value="contains">enthält</option>
                <option value="not_contains">enthält nicht</option>
                <option value="equals">ist gleich</option>
                <option value="starts_with">beginnt mit</option>
              </select>
              
              <input
                type="text"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm"
                placeholder="Suchbegriff"
              />
            </div>
          </div>

          {/* Action */}
          <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)] space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--ak-semantic-success)]">
            <span className="px-2 py-0.5 rounded bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]">DANN</span>
            </div>
            
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm"
            >
              <option value="create_draft">Draft erstellen</option>
              <option value="add_note">Interne Notiz hinzufügen</option>
              <option value="assign_to">Zuweisen an</option>
            </select>
            
            <textarea
              value={actionContent}
              onChange={(e) => setActionContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm resize-none"
              placeholder="Antworttext eingeben..."
            />
          </div>

          {/* Options */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="rounded border-[var(--ak-color-border-subtle)]"
            />
            <span className="text-sm text-[var(--ak-color-text-secondary)]">
              Vor Ausführung um Freigabe fragen
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--ak-color-border-subtle)]">
          <AkButton variant="ghost" onClick={onClose}>
            Abbrechen
          </AkButton>
          <AkButton 
            variant="primary"
            accent="automation"
            onClick={handleSave}
            disabled={!name || !conditionValue || isSaving}
          >
            {isSaving ? 'Erstellen...' : 'Regel erstellen'}
          </AkButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

type TabId = 'rules' | 'presets'

export function SimpleAutoReplyRules() {
  const { rules, presets, isLoading, createRule, toggleRule, deleteRule, activatePreset, refresh } = useAutoReplyRules()
  const [activeTab, setActiveTab] = useState<TabId>('presets')
  const [showEditor, setShowEditor] = useState(false)
  const [activatedPresets, setActivatedPresets] = useState<Set<number>>(new Set())

  const handleActivatePreset = async (index: number) => {
    await activatePreset(index)
    setActivatedPresets(prev => new Set([...prev, index]))
  }

  const tabs = [
    { id: 'presets' as const, label: 'Vorlagen', icon: LightBulbIcon, count: presets.length },
    { id: 'rules' as const, label: 'Aktive Regeln', icon: BoltIcon, count: rules.filter(r => r.is_enabled).length },
  ]

  return (
    <div className="h-full flex flex-col bg-[var(--ak-color-bg-app)]">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--ak-color-border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ak-accent-automation-soft)]">
              <BoltIcon className="h-5 w-5 text-[var(--ak-accent-automation)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                Auto-Reply Regeln
              </h1>
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                Einfache Wenn-Dann-Automationen
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AkButton
              variant="ghost"
              size="sm"
              onClick={refresh}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Aktualisieren
            </AkButton>
            <AkButton
              variant="primary"
              accent="automation"
              size="sm"
              onClick={() => setShowEditor(true)}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Neue Regel
            </AkButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--ak-color-bg-surface-muted)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm'
                  : 'text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <AkBadge tone="muted" size="xs">{tab.count}</AkBadge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 ak-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <ArrowPathIcon className="h-8 w-8 text-[var(--ak-color-text-muted)] animate-spin" />
          </div>
        ) : activeTab === 'presets' ? (
          <AnimatePresence>
            {presets.length === 0 ? (
              <div className="text-center py-12 text-[var(--ak-color-text-muted)]">
                Keine Vorlagen verfügbar
              </div>
            ) : (
              presets.map((preset, index) => (
                <PresetCard
                  key={index}
                  preset={preset}
                  index={index}
                  onActivate={handleActivatePreset}
                  isActivated={activatedPresets.has(index)}
                />
              ))
            )}
          </AnimatePresence>
        ) : (
          <AnimatePresence>
            {rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BoltIcon className="h-12 w-12 text-[var(--ak-color-text-muted)] mb-2" />
                <p className="text-sm text-[var(--ak-color-text-muted)]">
                  Noch keine Regeln erstellt
                </p>
                <AkButton
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setActiveTab('presets')}
                >
                  Vorlagen ansehen
                </AkButton>
              </div>
            ) : (
              rules.map(rule => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={toggleRule}
                  onDelete={deleteRule}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <RuleEditor
            onSave={createRule}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default SimpleAutoReplyRules

