'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'

type MarketingType = {
  id: string
  label: string
  selected: boolean
}

type ChannelChip = {
  value: string
  label: string
  selected: boolean
}

type ToneChip = {
  value: string
  label: string
  selected: boolean
}

type LanguageOption = {
  label: string
  value: string
}

type Preview = {
  headline: string
  body: string
  cta: string
  showImagePlaceholder: boolean
}

type HistoryItem = {
  id: string
  date: string
  type: string
  channel: string
  title: string
  status: 'Entwurf' | 'Veröffentlicht' | 'Geplant'
}

const MOCK_TYPES: MarketingType[] = [
  { id: 'social', label: 'Social Media', selected: true },
  { id: 'newsletter', label: 'Newsletter', selected: false },
  { id: 'launch', label: 'Launch/Promo', selected: false },
  { id: 'ads', label: 'Werbeanzeigen', selected: false },
  { id: 'other', label: 'Sonstiges', selected: false },
]

const MOCK_CHANNELS: ChannelChip[] = [
  { value: 'instagram', label: 'Instagram', selected: true },
  { value: 'linkedin', label: 'LinkedIn', selected: false },
  { value: 'email', label: 'E-Mail', selected: false },
  { value: 'flyer', label: 'Flyer', selected: false },
]

const MOCK_TONES: ToneChip[] = [
  { value: 'locker', label: 'locker', selected: true },
  { value: 'professionell', label: 'professionell', selected: false },
  { value: 'serioes', label: 'seriös', selected: false },
  { value: 'verspielt', label: 'verspielt', selected: false },
]

const MOCK_LANGUAGES: LanguageOption[] = [
  { label: 'Deutsch (de-DE)', value: 'de-DE' },
  { label: 'Englisch (en-US)', value: 'en-US' },
]

const MOCK_PREVIEW: Preview = {
  headline: 'Jetzt Platz sichern: Webinar zu KI-Marketing',
  body: 'Entdecke, wie du in 60 Minuten bessere Kampagnen mit KI planst und umsetzt. Live-Demo, Best Practices und Q&A – ideal für Teams in DACH.',
  cta: 'Jetzt kostenlos anmelden',
  showImagePlaceholder: true,
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    date: '08.12.2025',
    type: 'Social Post',
    channel: 'Instagram',
    title: 'Teaser-Post für Webinar',
    status: 'Entwurf',
  },
  {
    id: 'h2',
    date: '05.12.2025',
    type: 'Newsletter',
    channel: 'E-Mail',
    title: 'Dezember-Update + Webinar-Ankündigung',
    status: 'Veröffentlicht',
  },
  {
    id: 'h3',
    date: '30.11.2025',
    type: 'Kampagnen-Konzept',
    channel: 'LinkedIn',
    title: '3-teilige Awareness-Sequenz Q1',
    status: 'Geplant',
  },
]



type MarketingSuggestion = {
  id: string
  label: string
  description: string
}

type MarketingDetailPanelProps = {
  actionId: string | null
}

const MARKETING_SUGGESTIONS_BY_ACTION: Record<string, MarketingSuggestion[]> = {
  plan_email_campaign: [
    {
      id: 'marketing.campaign.newsletter',
      label: 'Newsletter-Serie planen',
      description: 'Kampagnenziel, Frequenz und Themenplan vorschlagen lassen.',
    },
    {
      id: 'marketing.campaign.briefing',
      label: 'Briefing automatisch strukturieren',
      description: 'Freitext-Briefing in Ziele, Zielgruppen und Botschaften aufteilen.',
    },
  ],
  newsletter_ideas: [
    {
      id: 'marketing.newsletter.ideas',
      label: 'Newsletter-Ideen generieren',
      description: '3–5 konkrete Themenvorschläge für die nächsten Ausgaben.',
    },
  ],
  social_calendar: [
    {
      id: 'marketing.social.calendar',
      label: 'Social-Content-Plan erstellen',
      description: 'Posting-Plan mit Formaten und Hooks für deinen Hauptkanal.',
    },
  ],
  landing_copy: [
    {
      id: 'marketing.landing.copy',
      label: 'Landingpage-Struktur aufbauen',
      description: 'Hero, Nutzenargumente, Social Proof und FAQ als Gerüst definieren.',
    },
  ],
  ad_copy_creation: [
    {
      id: 'marketing.ads.variants',
      label: 'Anzeigen-Varianten entwickeln',
      description: 'Mehrere Versionen für Headlines und Body-Text erzeugen lassen.',
    },
  ],
  campaign_analysis: [
    {
      id: 'marketing.campaign.audit',
      label: 'Kampagne analysieren',
      description: 'Stärken, Schwächen und Optimierungsmöglichkeiten bewerten.',
    },
  ],
}

const getSuggestionsForAction = (actionId: string | null): MarketingSuggestion[] => {
  if (!actionId) return []
  return MARKETING_SUGGESTIONS_BY_ACTION[actionId] ?? []
}

const getStatusColor = (status: HistoryItem['status']): string => {
  switch (status) {
    case 'Veröffentlicht':
      return 'ak-badge-success'
    case 'Geplant':
      return 'ak-badge-info'
    case 'Entwurf':
      return 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] border-[var(--ak-color-border-subtle)]'
    default:
      return 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] border-[var(--ak-color-border-subtle)]'
  }
}

export function MarketingDetailPanel({ actionId }: MarketingDetailPanelProps) {
  const [types, setTypes] = useState<MarketingType[]>(MOCK_TYPES)
  const [channels, setChannels] = useState<ChannelChip[]>(MOCK_CHANNELS)
  const [tones, setTones] = useState<ToneChip[]>(MOCK_TONES)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('de-DE')
  const [briefing, setBriefing] = useState<string>(
    'Ziel: Mehr Anmeldungen für das Webinar am 15.01.\nZielgruppe: Marketing-Leads in DACH.\nAngebot: Kostenloses Live-Training mit Q&A.',
  )
  const [preview] = useState<Preview>(MOCK_PREVIEW)

const [history] = useState<HistoryItem[]>(MOCK_HISTORY)

const [isSendingSuggestion, setIsSendingSuggestion] = useState(false)
const suggestions = getSuggestionsForAction(actionId ?? null)

const handleTypeSelect = (typeId: string) => {
  setTypes((prev) =>
    prev.map((type) => ({
      ...type,
      selected: type.id === typeId,
    }))
  )
}

const handleChannelSelect = (channelValue: string) => {
  setChannels((prev) =>
    prev.map((channel) => ({
      ...channel,
      selected: channel.value === channelValue,
    }))
  )
}

const handleToneSelect = (toneValue: string) => {
  setTones((prev) =>
    prev.map((tone) => ({
      ...tone,
      selected: tone.value === toneValue,
    }))
  )
}

const handleSuggestionClick = async (s: MarketingSuggestion) => {
  setIsSendingSuggestion(true)
  try {
    // Extract action_id from suggestion id (e.g., "marketing.campaign.newsletter")
    const actionId = s.id

    // Dispatch aklow-action-start event via helper
    const { dispatchActionStart } = await import('@/lib/actions/dispatch')
    dispatchActionStart(
      actionId,
      {
        module: 'growth',
        moduleContext: {
          actionId: actionId || null,
        },
      },
      {},
      'marketing-panel'
    )
  } catch (error) {
    console.error('Error dispatching marketing suggestion action', error)
  } finally {
    setIsSendingSuggestion(false)
  }
}

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/95 p-4 ak-shadow-soft backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="ak-heading">Marketing-Aktionen</h2>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-accent-documents)]/25 bg-[var(--ak-accent-documents-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-accent-documents)]">
              Social
            </span>
            <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-accent-documents)]/25 bg-[var(--ak-accent-documents-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-accent-documents)]">
              Newsletter
            </span>
            <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-accent-documents)]/25 bg-[var(--ak-accent-documents-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-accent-documents)]">
              Anzeigen
            </span>
            <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-accent-documents)]/25 bg-[var(--ak-accent-documents-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-accent-documents)]">
              Print
            </span>
          </div>
          <p className="ak-caption text-[var(--ak-color-text-secondary)]">
            Erstelle Kampagnen und Inhalte mit KI.
          </p>
        </div>

{/* Suggestions */}
{suggestions.length > 0 && (
  <div className="mt-3 flex flex-col gap-2">
    <p className="ak-caption text-[var(--ak-color-text-secondary)]">
      Nächste sinnvolle Schritte für diese Aktion
    </p>
    <div className="grid gap-2 sm:grid-cols-2">
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => handleSuggestionClick(s)}
          disabled={isSendingSuggestion}
          className={clsx(
            'group flex flex-col items-start rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface)]',
            isSendingSuggestion ? 'opacity-70 cursor-wait' : '',
          )}
        >
          <span className="font-medium text-[var(--ak-color-text-primary)]">
            {s.label}
          </span>
          <span className="ak-caption mt-0.5 text-[var(--ak-color-text-secondary)]">
            {s.description}
          </span>
        </button>
      ))}
    </div>
  </div>
)}

        {/* AI Suggestions & Quick Actions - in der Mitte */}
        <div className="mb-4 flex flex-col gap-3 px-3 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
          <AIActions context="marketing" />
          <QuickActions context="marketing" />
        </div>

        {/* Type Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {types.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeSelect(type.id)}
              className={clsx(
                'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 text-[12px] font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                type.selected
                  ? 'border-[var(--ak-accent-documents)]/35 bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)] shadow-sm'
                  : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]',
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              const selectedType = types.find(t => t.selected)
              const selectedChannels = channels.filter(c => c.selected).map(c => c.value)
              const selectedTone = tones.find(t => t.selected)
              
              if (!selectedType) {
                window.dispatchEvent(
                  new CustomEvent('aklow-notification', {
                    detail: { type: 'error', message: 'Bitte wähle einen Typ aus' }
                  })
                )
                return
              }

              const { authedFetch } = await import('@/lib/api/authedFetch')
              const response = await authedFetch('/api/marketing/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: briefing.split('\n')[0] || 'Neue Kampagne',
                  type: selectedType.id,
                  channels: selectedChannels,
                  tone: selectedTone?.value,
                  language: selectedLanguage,
                  briefing: briefing,
                  status: 'draft',
                }),
              })
              
              if (response.ok) {
                const data = await response.json()
                window.dispatchEvent(
                  new CustomEvent('aklow-notification', {
                    detail: { type: 'success', message: 'Kampagne erfolgreich erstellt' }
                  })
                )
                // Reset form
                setBriefing('')
                // Reload campaigns if we're in the campaigns view
                window.dispatchEvent(new CustomEvent('aklow-reload-campaigns'))
              } else {
                const errorData = await response.json().catch(() => ({ error: 'Fehler beim Erstellen' }))
                window.dispatchEvent(
                  new CustomEvent('aklow-notification', {
                    detail: { type: 'error', message: errorData.error || 'Fehler beim Erstellen' }
                  })
                )
              }
            } catch (error) {
              console.error('Error creating campaign:', error)
              window.dispatchEvent(
                new CustomEvent('aklow-notification', {
                  detail: { type: 'error', message: 'Fehler beim Erstellen' }
                })
              )
            }
          }}
          className="flex flex-col gap-3"
        >
          {/* Briefing */}
          <div className="flex flex-col gap-1">
            <label htmlFor="briefing" className="ak-caption font-medium text-[var(--ak-color-text-primary)]">
              Briefing
            </label>
            <textarea
              id="briefing"
              name="briefing"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              placeholder="Ziele, Zielgruppe, Angebot…"
              rows={5}
              required
              className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
            />
          </div>

          {/* Kanal, Sprache, Tonalität */}
          <div className="flex flex-wrap items-start gap-3">
            {/* Kanal */}
            <div className="flex min-w-[260px] flex-1 flex-col gap-1">
              <label className="ak-caption font-medium text-[var(--ak-color-text-primary)]">
                Kanal
              </label>
              <div className="flex flex-wrap items-center gap-1">
                {channels.map((ch) => (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => handleChannelSelect(ch.value)}
                    className={clsx(
                      'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 text-[11px] font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                      ch.selected
                        ? 'border-[var(--ak-accent-inbox)]/35 bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]'
                        : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)]',
                    )}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sprache */}
            <div className="flex min-w-[200px] flex-col gap-1">
              <label htmlFor="sprache" className="ak-caption font-medium text-[var(--ak-color-text-primary)]">
                Sprache
              </label>
              <select
                id="sprache"
                name="sprache"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
              >
                {MOCK_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tonalität */}
            <div className="flex min-w-[260px] flex-1 flex-col gap-1">
              <label className="ak-caption font-medium text-[var(--ak-color-text-primary)]">
                Tonalität
              </label>
              <div className="flex flex-wrap items-center gap-1">
                {tones.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => handleToneSelect(tone.value)}
                    className={clsx(
                      'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 text-[11px] font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                      tone.selected
                        ? 'border-[var(--ak-color-graphite-border)] bg-[var(--ak-color-graphite-surface)] text-[var(--ak-color-graphite-text)]'
                        : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)]',
                    )}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-3">
            <p className="ak-caption mb-2 font-medium text-[var(--ak-accent-documents)]">KI-Vorschau</p>
            <h3 className="ak-heading mb-1">{preview.headline}</h3>
            <p className="ak-body mb-2 text-[var(--ak-color-text-secondary)]">{preview.body}</p>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-accent-inbox)]/25 bg-[var(--ak-accent-inbox-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-accent-inbox)]">
                CTA
              </span>
              <p className="ak-body text-[var(--ak-color-text-primary)]">{preview.cta}</p>
            </div>
            {preview.showImagePlaceholder && (
              <div className="flex h-[120px] items-center justify-center rounded-lg border border-dashed border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
                <div className="flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
                  <p className="ak-caption text-[var(--ak-color-text-muted)]">Bildvorschlag</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:ak-shadow-card"
            >
              Neu generieren
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:ak-shadow-card"
            >
              Leicht umformulieren
            </button>
          </div>
        </form>

        <div className="h-px bg-[var(--ak-color-border-subtle)]" />

        {/* History */}
        <div className="flex flex-col gap-2">
          <h3 className="ak-heading">Letzte Aktionen</h3>
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-2"
              >
                <p className="ak-body text-[var(--ak-color-text-secondary)]">{item.date}</p>
                <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-color-text-secondary)]">
                  {item.type}
                </span>
                <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border border-[var(--ak-accent-inbox)]/25 bg-[var(--ak-accent-inbox-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--ak-accent-inbox)]">
                  {item.channel}
                </span>
                <p className="ak-body flex-1 truncate text-[var(--ak-color-text-primary)]">
                  {item.title}
                </p>
                <span
                  className={clsx(
                    'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2 py-0.5 text-[11px] font-medium',
                    getStatusColor(item.status),
                  )}
                >
                  {item.status}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]"
                >
                  Wiederverwenden
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

