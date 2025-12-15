'use client'

import { useState, useEffect } from 'react'
import {
  ArrowPathIcon,
  SparklesIcon,
  CalendarIcon,
  Square3Stack3DIcon,
  CheckIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'

type ViewState = 'ready' | 'loading' | 'error' | 'empty'

type ItemType = 'campaign' | 'social_post' | 'newsletter' | 'review_flow' | 'followup'

type StatusOption = {
  label: string
  value: string
  disabled?: boolean
}

type Channel = {
  label: string
  color: 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery'
}

type Asset = {
  id: string
  icon: string
  title: string
  body: string
}

type Connection = {
  id: string
  label: string
  type: 'social' | 'email'
  connected: boolean
}

type Schedule = {
  date: string
  time: string
  needsApproval: boolean
}

type UTM = {
  source: string
  medium: string
  campaign: string
}

type GrowthDetailsDrawerProps = {
  growthItemId: string
  onClose?: () => void
}

const BADGE_COLOR_MAP: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "discovery"> = {
  secondary: 'neutral',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  discovery: 'discovery',
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'square-text': Square3Stack3DIcon,
  mail: EnvelopeIcon,
  check: CheckIcon,
  mobile: DevicePhoneMobileIcon,
}

// Mock-Daten
const MOCK_DATA = {
  viewState: 'ready' as ViewState,
  growthItemId: 'gi_2025_001',
  itemType: 'campaign' as ItemType,
  itemTypeLabel: 'Kampagne',
  lastUpdated: '12.12.2025, 18:20',
  status: 'Entwurf',
  statusOptions: [
    { label: 'Entwurf', value: 'Entwurf' },
    { label: 'Geplant', value: 'Geplant' },
    { label: 'Live', value: 'Live' },
    { label: 'Abgeschlossen', value: 'Abgeschlossen' },
  ],
  goal: 'Mehr Anfragen für Angebot X',
  audience: 'KMU im Raum Berlin',
  channels: [
    { label: 'Instagram', color: 'info' as const },
    { label: 'Newsletter', color: 'secondary' as const },
    { label: 'Bewertungen', color: 'discovery' as const },
  ],
  schedule: {
    date: '2025-12-22',
    time: '10:00',
    needsApproval: true,
  },
  assets: [
    {
      id: 'a1',
      icon: 'square-text',
      title: 'Post-Variante A',
      body: 'Kurzer Hook + CTA auf Landingpage',
    },
    {
      id: 'a2',
      icon: 'square-text',
      title: 'Post-Variante B',
      body: 'Story-Ansatz, Fokus Nutzen',
    },
    {
      id: 'a3',
      icon: 'mail',
      title: 'Betreffzeile',
      body: 'Jetzt Winter‑Deal sichern❄️',
    },
    {
      id: 'a4',
      icon: 'check',
      title: 'CTA',
      body: 'Kostenlos anfragen',
    },
  ],
  connections: [
    {
      id: 'c1',
      label: 'Instagram Business',
      type: 'social' as const,
      connected: false,
    },
    {
      id: 'c2',
      label: 'E‑Mail (SendGrid)',
      type: 'email' as const,
      connected: true,
    },
  ],
  showAdvanced: false,
  utm: {
    source: 'chatgpt',
    medium: 'social',
    campaign: 'winter_sale',
  },
  internal: {
    externalId: 'crm-7890',
  },
  disabledControls: false,
}

export function GrowthDetailsDrawer({ growthItemId, onClose }: GrowthDetailsDrawerProps) {
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [itemTypeLabel, setItemTypeLabel] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')
  const [status, setStatus] = useState('')
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([])
  const [goal, setGoal] = useState('')
  const [audience, setAudience] = useState('')
  const [channels, setChannels] = useState<Channel[]>([])
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [utm, setUtm] = useState<UTM | null>(null)
  const [internal, setInternal] = useState<{ externalId: string } | null>(null)
  const [disabledControls, setDisabledControls] = useState(false)

  useEffect(() => {
    // Simuliere Laden
    const timer = setTimeout(() => {
      setViewState('ready')
      setItemTypeLabel(MOCK_DATA.itemTypeLabel)
      setLastUpdated(MOCK_DATA.lastUpdated)
      setStatus(MOCK_DATA.status)
      setStatusOptions(MOCK_DATA.statusOptions)
      setGoal(MOCK_DATA.goal)
      setAudience(MOCK_DATA.audience)
      setChannels(MOCK_DATA.channels)
      setSchedule(MOCK_DATA.schedule)
      setAssets(MOCK_DATA.assets)
      setConnections(MOCK_DATA.connections)
      setUtm(MOCK_DATA.utm)
      setInternal(MOCK_DATA.internal)
      setDisabledControls(MOCK_DATA.disabledControls)
    }, 500)

    return () => clearTimeout(timer)
  }, [growthItemId])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save growth details
    console.log('Save growth details:', {
      status,
      goal,
      audience,
      schedule,
      utm,
      internal,
    })
  }

  const handleCopyAsset = (assetId: string) => {
    // TODO: Copy asset
    console.log('Copy asset:', assetId)
  }

  const handleCopyBundle = () => {
    // TODO: Copy all assets
    console.log('Copy bundle')
  }

  if (viewState === 'loading') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-[var(--ak-color-text-secondary)]" />
        <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Wird geladen…</p>
      </div>
    )
  }

  if (viewState === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <AkBadge tone="danger">Fehler</AkBadge>
        <div className="flex justify-end">
          <AkButton
            variant="primary"
            leftIcon={<SparklesIcon className="h-4 w-4" />}
            onClick={onClose}
          >
            Im Chat weiterarbeiten
          </AkButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 p-1 overflow-y-auto">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Überblick */}
        <WidgetCard title="Überblick" padding="sm" className="apple-glass-enhanced">
          {/* AI Suggestions & Quick Actions - in der Mitte */}
          <div className="mb-4 flex flex-col gap-3 px-2 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
            <AIActions context="growth" />
            <QuickActions context="growth" />
          </div>
          
           <div className="space-y-4">
               <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                       <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">{itemTypeLabel}</span>
                       <span className="text-xs text-[var(--ak-color-text-muted)]">Aktualisiert: {lastUpdated}</span>
                   </div>
                   <AkBadge tone={status === 'Live' ? 'success' : 'neutral'}>{status}</AkBadge>
               </div>

               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={disabledControls}
                            className="w-full rounded-md border border-[var(--ak-color-border-subtle)] bg-transparent px-2 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)]"
                        >
                            {statusOptions.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                            </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Ziel</label>
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            disabled={disabledControls}
                            className="w-full rounded-md border border-[var(--ak-color-border-subtle)] bg-transparent px-2 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)]"
                        />
                    </div>
               </div>

               <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Kanäle</label>
                    <div className="flex flex-wrap gap-2">
                        {channels.map((channel, idx) => (
                            <AkBadge key={idx} tone={BADGE_COLOR_MAP[channel.color] || 'neutral'}>
                                {channel.label}
                            </AkBadge>
                        ))}
                    </div>
               </div>
           </div>
        </WidgetCard>

        {/* Planung */}
        <WidgetCard title="Planung" padding="sm" className="apple-glass-enhanced">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Datum</label>
                        <input
                            type="date"
                            value={schedule?.date || ''}
                            onChange={(e) => setSchedule((prev) => prev ? { ...prev, date: e.target.value } : null)}
                            disabled={disabledControls}
                            className="w-full rounded-md border border-[var(--ak-color-border-subtle)] bg-transparent px-2 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Zeit</label>
                        <input
                            type="time"
                            value={schedule?.time || ''}
                            onChange={(e) => setSchedule((prev) => prev ? { ...prev, time: e.target.value } : null)}
                            disabled={disabledControls}
                            className="w-full rounded-md border border-[var(--ak-color-border-subtle)] bg-transparent px-2 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)]"
                        />
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-[var(--ak-color-text-primary)]">
                        <input
                            type="checkbox"
                            checked={schedule?.needsApproval || false}
                            onChange={(e) => setSchedule((prev) => prev ? { ...prev, needsApproval: e.target.checked } : null)}
                            disabled={disabledControls}
                            className="rounded border-[var(--ak-color-border-subtle)] text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
                        />
                        Freigabe erforderlich
                    </label>
                    <AkButton size="sm" variant="ghost" leftIcon={<CalendarIcon className="h-4 w-4" />}>
                        Anpassen
                    </AkButton>
                </div>
            </div>
        </WidgetCard>

        {/* Assets */}
        <WidgetCard 
            title="Assets" 
            padding="sm" 
            className="apple-glass-enhanced overflow-hidden"
            action={
                <AkButton size="sm" variant="ghost" onClick={handleCopyBundle}>
                    <Square3Stack3DIcon className="h-4 w-4" />
                </AkButton>
            }
        >
            <div className="divide-y divide-[var(--ak-color-border-hairline)]">
                {assets.map((asset) => {
                    const IconComponent = ICON_MAP[asset.icon] || Square3Stack3DIcon
                    return (
                        <AkListRow
                            key={asset.id}
                            leading={<IconComponent className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />}
                            title={asset.title}
                            subtitle={asset.body}
                            trailing={
                                <AkButton 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleCopyAsset(asset.id)}
                                >
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                </AkButton>
                            }
                        />
                    )
                })}
            </div>
        </WidgetCard>

        {/* Connections */}
        <WidgetCard title="Verbindungen" padding="sm" className="apple-glass-enhanced overflow-hidden">
            <div className="divide-y divide-[var(--ak-color-border-hairline)]">
                {connections.map((connection) => {
                    const IconComponent = connection.type === 'email' ? EnvelopeIcon : DevicePhoneMobileIcon
                    return (
                        <AkListRow
                            key={connection.id}
                            leading={<IconComponent className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />}
                            title={connection.label}
                            subtitle={connection.connected ? 'Verbunden' : 'Getrennt'}
                            trailing={
                                connection.connected ? (
                                    <AkBadge tone="success" size="sm">OK</AkBadge>
                                ) : (
                                    <AkButton size="sm" variant="secondary" leftIcon={<LinkIcon className="h-3 w-3" />}>
                                        Verbinden
                                    </AkButton>
                                )
                            }
                        />
                    )
                })}
            </div>
        </WidgetCard>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--ak-color-border-subtle)]">
            <AkButton variant="secondary" onClick={onClose}>
                Schließen
            </AkButton>
            <AkButton 
                variant="primary" 
                type="submit" 
                disabled={viewState !== 'ready'}
                leftIcon={<CheckCircleIcon className="h-4 w-4" />}
            >
                Speichern
            </AkButton>
        </div>

      </form>
    </div>
  )
}
