'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Send,
  Users,
  BarChart3,
  Clock,
  Zap,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Eye,
  Save,
  Play,
  Pause,
  Target,
  SplitSquareVertical,
  Workflow,
  FileText,
  Settings,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

// Types
interface Campaign {
  id?: string
  name: string
  type: 'email' | 'telegram' | 'drip' | 'newsletter'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled'
  channels: string[]
  segmentId?: string
  abTestEnabled?: boolean
  subject?: string
  content?: string
  htmlContent?: string
  scheduledAt?: string
  metadata?: Record<string, unknown>
}

interface Segment {
  id: string
  name: string
  memberCount: number
  segmentType: 'dynamic' | 'static' | 'smart'
}

interface CampaignBuilderProps {
  tenantId: string
  campaign?: Campaign
  onSave?: (campaign: Campaign) => void
  onClose?: () => void
}

type BuilderStep = 'type' | 'audience' | 'content' | 'ab-test' | 'schedule' | 'review'

const CAMPAIGN_TYPES = [
  {
    id: 'email',
    name: 'E-Mail Kampagne',
    description: 'Einmalige E-Mail an eine Zielgruppe',
    icon: Mail,
    color: 'from-[var(--ak-semantic-info)] to-[var(--ak-semantic-info-strong)]',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Regelmäßiger Newsletter an Abonnenten',
    icon: FileText,
    color: 'from-[var(--ak-color-accent-marketing)] to-[var(--ak-color-accent-marketing-strong)]',
  },
  {
    id: 'drip',
    name: 'Drip Kampagne',
    description: 'Automatisierte E-Mail-Serie',
    icon: Workflow,
    color: 'from-[var(--ak-semantic-warning)] to-[var(--ak-semantic-danger)]',
  },
  {
    id: 'telegram',
    name: 'Telegram Broadcast',
    description: 'Nachricht an alle Telegram-Kontakte',
    icon: Send,
    color: 'from-[var(--ak-semantic-success)] to-[var(--ak-semantic-success-strong)]',
  },
]

const QUICK_TEMPLATES = [
  { name: 'Willkommens-E-Mail', subject: 'Willkommen bei uns!', content: 'Schön, dass du da bist...' },
  { name: 'Newsletter', subject: 'Unser Newsletter', content: 'Hier sind die Neuigkeiten...' },
  { name: 'Produktankündigung', subject: 'Neues Produkt verfügbar', content: 'Wir haben etwas Neues für dich...' },
]

const STEPS: { id: BuilderStep; label: string; icon: typeof Mail }[] = [
  { id: 'type', label: 'Kampagnentyp', icon: Zap },
  { id: 'audience', label: 'Zielgruppe', icon: Users },
  { id: 'content', label: 'Inhalt', icon: FileText },
  { id: 'ab-test', label: 'A/B Test', icon: SplitSquareVertical },
  { id: 'schedule', label: 'Zeitplan', icon: Clock },
  { id: 'review', label: 'Überprüfen', icon: Eye },
]

export function CampaignBuilder({
  tenantId,
  campaign: initialCampaign,
  onSave,
  onClose,
}: CampaignBuilderProps) {
  const [step, setStep] = useState<BuilderStep>('type')
  const [campaign, setCampaign] = useState<Campaign>(
    initialCampaign || {
      name: '',
      type: 'email',
      status: 'draft',
      channels: ['email'],
    }
  )
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const currentStepIndex = STEPS.findIndex((s) => s.id === step)
  const progressPercentage = ((currentStepIndex + 1) / STEPS.length) * 100

  const canProceedToNextStep = () => {
    switch (step) {
      case 'type': return campaign.name.length > 0 && !!campaign.type
      case 'audience': return !!campaign.segmentId
      case 'content': return !!(campaign.subject && campaign.content)
      default: return true
    }
  }

  const goToStep = (newStep: BuilderStep) => {
    setStep(newStep)
  }

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length && canProceedToNextStep()) {
      setStep(STEPS[nextIndex].id)
    }
  }

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex].id)
    }
  }

  const updateCampaign = useCallback((updates: Partial<Campaign>) => {
    setCampaign((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      if (onSave) {
        onSave(campaign)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-inverted)] mb-2">
                Wähle deinen Kampagnentyp
              </h2>
              <p className="text-[var(--ak-color-text-secondary)]">
                Welche Art von Marketing-Kampagne möchtest du erstellen?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CAMPAIGN_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = campaign.type === type.id
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      updateCampaign({
                        type: type.id as Campaign['type'],
                        channels: [type.id === 'telegram' ? 'telegram' : 'email'],
                      })
                    }
                    className={`
                      relative p-6 rounded-xl border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-white/30 bg-white/10'
                          : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 hover:border-white/20'
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selected-type"
                        className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-xl"
                        style={{
                          backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                        }}
                      />
                    )}
                    <div
                      className={`
                        w-12 h-12 rounded-lg flex items-center justify-center mb-4
                        bg-gradient-to-br ${type.color}
                      `}
                    >
                      <Icon className="w-6 h-6 text-[var(--ak-color-text-inverted)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--ak-color-text-inverted)] mb-1">
                      {type.name}
                    </h3>
                    <p className="text-sm text-[var(--ak-color-text-secondary)]">{type.description}</p>
                  </motion.button>
                )
              })}
            </div>

            <div className="pt-4">
              <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                Kampagnenname
              </label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => updateCampaign({ name: e.target.value })}
                placeholder="z.B. Sommer-Newsletter 2024"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)]
                  text-[var(--ak-color-text-inverted)] placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/50
                "
              />
            </div>

            {/* Quick Templates */}
            <div className="pt-4 border-t border-[var(--ak-color-border-subtle)]">
              <h3 className="text-sm font-medium text-[var(--ak-color-text-secondary)] mb-3">Schnellstart mit Vorlage</h3>
              <div className="flex gap-3">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => updateCampaign({ 
                      name: tpl.name + ' ' + new Date().toLocaleDateString(),
                      subject: tpl.subject,
                      content: tpl.content
                    })}
                    className="px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 hover:bg-[var(--ak-color-bg-hover)] border border-[var(--ak-color-border-subtle)] text-sm text-[var(--ak-color-text-secondary)] transition-colors"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'audience':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-inverted)] mb-2">
                Wähle deine Zielgruppe
              </h2>
              <p className="text-[var(--ak-color-text-secondary)]">
                An wen soll diese Kampagne gesendet werden?
              </p>
            </div>

            <div className="space-y-4">
              {/* Segment Selection */}
              <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-4 border border-[var(--ak-color-border-subtle)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-accent-soft)] flex items-center justify-center">
                      <Target className="w-5 h-5 text-[var(--ak-color-accent)]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--ak-color-text-inverted)]">Segment auswählen</h3>
                      <p className="text-sm text-[var(--ak-color-text-secondary)]">
                        Wähle ein vordefiniertes Segment
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] text-sm hover:bg-[var(--ak-color-accent-soft-dark)] transition-colors">
                    + Neues Segment
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'all', name: 'Alle Kontakte', count: 1234 },
                    { id: 'newsletter', name: 'Newsletter-Abonnenten', count: 856 },
                    { id: 'active', name: 'Aktive Nutzer (30 Tage)', count: 423 },
                    { id: 'new', name: 'Neue Kontakte (7 Tage)', count: 89 },
                  ].map((seg) => (
                    <button
                      key={seg.id}
                      onClick={() => updateCampaign({ segmentId: seg.id })}
                      className={`
                        p-4 rounded-lg border text-left transition-all
                        ${
                          campaign.segmentId === seg.id
                            ? 'border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)]'
                            : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 hover:border-white/20'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[var(--ak-color-text-inverted)]">{seg.name}</span>
                        <span className="text-sm text-[var(--ak-color-text-secondary)]">
                          {seg.count.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Reach */}
              {campaign.segmentId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--ak-semantic-success-soft)] border border-[var(--ak-semantic-success-soft)] rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[var(--ak-semantic-success)]" />
                    <div>
                      <span className="text-[var(--ak-semantic-success)] font-medium">
                        Geschätzte Reichweite:
                      </span>
                      <span className="text-[var(--ak-color-text-inverted)] ml-2 font-bold">
                        {(1234).toLocaleString()} Empfänger
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-inverted)] mb-2">
                Erstelle deinen Inhalt
              </h2>
              <p className="text-[var(--ak-color-text-secondary)]">
                Gestalte die Nachricht für deine Kampagne
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                {campaign.type !== 'telegram' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                      Betreffzeile
                    </label>
                    <input
                      type="text"
                      value={campaign.subject || ''}
                      onChange={(e) => updateCampaign({ subject: e.target.value })}
                      placeholder="Betreffzeile eingeben..."
                      className="
                        w-full px-4 py-3 rounded-lg
                        bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)]
                        text-[var(--ak-color-text-inverted)] placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/50
                      "
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                    Nachricht
                  </label>
                  <textarea
                    value={campaign.content || ''}
                    onChange={(e) => updateCampaign({ content: e.target.value })}
                    placeholder="Schreibe deine Nachricht..."
                    rows={8}
                    className="
                      w-full px-4 py-3 rounded-lg
                      bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)]
                      text-[var(--ak-color-text-inverted)] placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/50
                      resize-none
                    "
                  />
                </div>

                {campaign.type !== 'telegram' && (
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                      <FileText className="w-4 h-4" />
                      Template wählen
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                      <Eye className="w-4 h-4" />
                      Vorschau
                    </button>
                  </div>
                )}
              </div>

              {/* Preview */}
              {campaign.type !== 'telegram' && (
                <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] overflow-hidden">
                  <div className="bg-[var(--ak-color-bg-surface)]/90 px-4 py-2 border-b border-[var(--ak-color-border-subtle)]">
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">E-Mail Vorschau</span>
                  </div>
                  <div className="p-4">
                    <div className="bg-[var(--ak-color-bg-surface)] rounded-lg p-6 text-[var(--ak-color-text-primary)]">
                      <div className="text-lg font-semibold mb-4">
                        {campaign.subject || 'Betreffzeile...'}
                      </div>
                      <div className="text-[var(--ak-color-text-secondary)] whitespace-pre-wrap">
                        {campaign.content || 'Nachrichteninhalt...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'ab-test':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-inverted)] mb-2">A/B Testing</h2>
              <p className="text-[var(--ak-color-text-secondary)]">
                Teste verschiedene Varianten um die beste Performance zu erzielen
              </p>
            </div>

            <div className="bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--ak-semantic-info)]" />
                <span className="text-sm font-medium text-[var(--ak-semantic-info)]">Profi-Modus</span>
              </div>
              <p className="text-xs text-[var(--ak-color-text-secondary)]">
                A/B Tests helfen dir zu verstehen, worauf deine Zielgruppe am besten reagiert.
              </p>
            </div>

            <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-6 border border-[var(--ak-color-border-subtle)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--ak-semantic-warning-soft)] flex items-center justify-center">
                  <SplitSquareVertical className="w-5 h-5 text-[var(--ak-semantic-warning)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--ak-color-text-inverted)]">A/B Test aktivieren</h3>
                    <p className="text-sm text-[var(--ak-color-text-secondary)]">
                      Teste verschiedene Betreffzeilen oder Inhalte
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.abTestEnabled || false}
                    onChange={(e) =>
                      updateCampaign({ abTestEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--ak-color-bg-surface-muted-dark)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ak-color-accent)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-text-inverted)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-text-inverted)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--ak-color-accent)]"></div>
                </label>
              </div>

              {campaign.abTestEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded bg-[var(--ak-semantic-info)] flex items-center justify-center text-sm font-bold text-[var(--ak-color-text-inverted)]">
                          A
                        </span>
                        <span className="font-medium text-[var(--ak-color-text-inverted)]">Variante A</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Betreffzeile A..."
                        className="
                          w-full px-3 py-2 rounded-lg
                          bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)]
                          text-[var(--ak-color-text-inverted)] placeholder-gray-500 text-sm
                          focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-info)]/50
                        "
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded bg-[var(--ak-semantic-warning)] flex items-center justify-center text-sm font-bold text-[var(--ak-color-text-inverted)]">
                          B
                        </span>
                        <span className="font-medium text-[var(--ak-color-text-inverted)]">Variante B</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Betreffzeile B..."
                        className="
                          w-full px-3 py-2 rounded-lg
                          bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)]
                          text-[var(--ak-color-text-inverted)] placeholder-gray-500 text-sm
                          focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-warning)]/50
                        "
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-2">
                        Test-Anteil
                      </label>
                      <select className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)]">
                        <option value="20">20% (je 10%)</option>
                        <option value="40">40% (je 20%)</option>
                        <option value="100">100% (50/50)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-2">
                        Gewinner-Kriterium
                      </label>
                      <select className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)]">
                        <option value="open_rate">Öffnungsrate</option>
                        <option value="click_rate">Klickrate</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )

      case 'schedule':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-inverted)] mb-2">Zeitplan</h2>
              <p className="text-[var(--ak-color-text-secondary)]">
                Wann soll deine Kampagne gesendet werden?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => updateCampaign({ scheduledAt: undefined })}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all
                  ${
                    !campaign.scheduledAt
                      ? 'border-[var(--ak-semantic-success-soft)]/50 bg-[var(--ak-semantic-success-soft)]'
                      : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 hover:border-[var(--ak-color-border-default)]'
                  }
                `}
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--ak-semantic-success-soft)] flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-[var(--ak-semantic-success)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-inverted)] mb-1">
                  Sofort senden
                </h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)]">
                  Die Kampagne wird nach dem Speichern sofort gesendet
                </p>
              </button>

              <button
                onClick={() =>
                  updateCampaign({
                    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                  })
                }
                className={`
                  p-6 rounded-xl border-2 text-left transition-all
                  ${
                    campaign.scheduledAt
                      ? 'border-[var(--ak-color-accent)]/50 bg-[var(--ak-color-accent-soft)]'
                      : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 hover:border-[var(--ak-color-border-default)]'
                  }
                `}
              >
                  <div className="w-12 h-12 rounded-lg bg-[var(--ak-color-accent-soft)] flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-[var(--ak-color-accent)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-inverted)] mb-1">
                  Später senden
                </h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)]">
                  Plane einen bestimmten Zeitpunkt für den Versand
                </p>
              </button>
            </div>

            {campaign.scheduledAt && (
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--ak-color-bg-surface)]/70 rounded-xl p-4 border border-[var(--ak-color-border-subtle)]"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-2">Datum</label>
                    <input
                      type="date"
                      defaultValue={campaign.scheduledAt.split('T')[0]}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-2">Uhrzeit</label>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )

      case 'review':
        const missingFields = []
        if (!campaign.name) missingFields.push('Kampagnenname')
        if (!campaign.segmentId) missingFields.push('Zielgruppe')
        if (!campaign.subject && campaign.type !== 'telegram') missingFields.push('Betreffzeile')
        if (!campaign.content) missingFields.push('Nachricht')

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-inverted)] mb-2">
                Überprüfen & Senden
              </h2>
              <p className="text-[var(--ak-color-text-secondary)]">
                Prüfe alle Details bevor du die Kampagne startest
              </p>
            </div>

            {missingFields.length > 0 && (
              <div className="bg-[var(--ak-semantic-warning-soft)] border border-[var(--ak-semantic-warning-soft)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-[var(--ak-semantic-warning)]" />
                  <p className="text-sm font-medium text-[var(--ak-semantic-warning-strong)]">Noch fehlend:</p>
                </div>
                <ul className="text-xs text-[var(--ak-color-text-secondary)] list-disc list-inside ml-7">
                  {missingFields.map(field => <li key={field}>{field}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-4 border border-[var(--ak-color-border-subtle)]">
                <h3 className="font-medium text-[var(--ak-color-text-inverted)] mb-3">Zusammenfassung</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Kampagnentyp:</span>
                    <span className="text-[var(--ak-color-text-inverted)] ml-2 capitalize">{campaign.type}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Name:</span>
                    <span className="text-[var(--ak-color-text-inverted)] ml-2">{campaign.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Betreff:</span>
                    <span className="text-[var(--ak-color-text-inverted)] ml-2">{campaign.subject || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Zeitplan:</span>
                    <span className="text-[var(--ak-color-text-inverted)] ml-2">
                      {campaign.scheduledAt ? 'Geplant' : 'Sofort'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">A/B Test:</span>
                    <span className="text-[var(--ak-color-text-inverted)] ml-2">
                      {campaign.abTestEnabled ? 'Aktiv' : 'Deaktiviert'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Empfänger:</span>
                    <span className="text-[var(--ak-color-text-inverted)] ml-2">1.234</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--ak-semantic-success-soft)] border border-[var(--ak-semantic-success-soft)] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--ak-semantic-success-soft)] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[var(--ak-semantic-success)]" />
                  </div>
                  <div>
                    <span className="text-[var(--ak-semantic-success-strong)] font-medium">
                      Bereit zum Senden
                    </span>
                    <p className="text-sm text-[var(--ak-semantic-success-soft)]/80">
                      Alle erforderlichen Felder sind ausgefüllt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--ak-color-bg-app-dark)] via-[var(--ak-color-bg-surface-dark)]/70 to-[var(--ak-color-bg-app)]">
      {/* Header */}
      <div className="border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-inverted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[var(--ak-color-text-inverted)]">
                  {campaign.id ? 'Kampagne bearbeiten' : 'Neue Kampagne'}
                </h1>
                <p className="text-sm text-[var(--ak-color-text-secondary)]">
                  {campaign.name || 'Unbenannte Kampagne'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-[var(--ak-color-accent)] hover:bg-[var(--ak-color-accent-strong)]
                  text-[var(--ak-color-text-inverted)] font-medium transition-colors
                  disabled:opacity-50
                "
              >
                <Save className="w-4 h-4" />
                Speichern
              </button>
              {step === 'review' && (
                <button
                  className="
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-[var(--ak-semantic-success)] hover:bg-[var(--ak-semantic-success-strong)]
                    text-[var(--ak-color-text-inverted)] font-medium transition-colors
                  "
                >
                  <Send className="w-4 h-4" />
                  Kampagne starten
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50 relative">
        <div className="absolute bottom-0 left-0 h-0.5 bg-[var(--ak-color-accent)] transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const Icon = s.icon
              const isActive = s.id === step
              const isCompleted = index < currentStepIndex
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${
                    isActive
                        ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                        : isCompleted
                        ? 'text-[var(--ak-semantic-success)] hover:bg-[var(--ak-color-bg-hover)]'
                        : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:block">
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--ak-color-border-subtle)]">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg
              text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-bg-surface)]/80
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Zurück
          </button>
          <button
            onClick={nextStep}
            disabled={currentStepIndex === STEPS.length - 1 || !canProceedToNextStep()}
            className="
              flex items-center gap-2 px-6 py-2 rounded-lg
              bg-[var(--ak-color-accent)] hover:bg-[var(--ak-color-accent-strong)]
              text-[var(--ak-color-text-inverted)] font-medium
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Weiter
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CampaignBuilder

