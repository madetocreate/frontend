'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  ArrowPathIcon,
  SparklesIcon,
  CalendarIcon,
  Square3Stack3DIcon,
  CheckIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

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

const BADGE_COLOR_MAP = {
  secondary: 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]',
  success: 'border-[var(--ak-color-border-success)] bg-[var(--ak-color-bg-success)] text-[var(--ak-color-text-success)]',
  danger: 'border-[var(--ak-color-border-danger)] bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-danger)]',
  warning: 'border-[var(--ak-color-border-warning)] bg-[var(--ak-color-bg-warning)] text-[var(--ak-color-text-warning)]',
  info: 'border-[var(--ak-color-border-info)] bg-[var(--ak-color-bg-info)] text-[var(--ak-color-text-info)]',
  discovery: 'border-[var(--ak-color-border-discovery)] bg-[var(--ak-color-bg-discovery)] text-[var(--ak-color-text-discovery)]',
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
  const [showAdvanced, setShowAdvanced] = useState(false)
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
        <span className="inline-flex items-center rounded-full border border-[var(--ak-color-border-danger)] bg-[var(--ak-color-bg-danger)] px-2 py-0.5 text-[10px] font-medium text-[var(--ak-color-text-danger)]">
          Fehler
        </span>
        {/* Im Chat weiterarbeiten Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
          >
            <SparklesIcon className="h-4 w-4" />
            Im Chat weiterarbeiten
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Formular */}
      <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-4">
          {/* Überblick */}
          <div className="flex flex-col gap-2">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Überblick</p>
            
            <div className="flex items-center justify-between">
               <span className="ak-body text-sm font-medium">{itemTypeLabel}</span>
               <span className="ak-caption text-[var(--ak-color-text-muted)]">{lastUpdated}</span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Status</label>
              <select
                name="meta.status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={disabledControls}
                className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-transparent px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ziel */}
            <div className="flex items-center justify-between">
              <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Ziel</label>
              <input
                type="text"
                name="meta.goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Kurz Ziel"
                disabled={disabledControls}
                className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
              />
            </div>

            {/* Zielgruppe */}
            <div className="flex items-center justify-between">
              <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Zielgruppe</label>
              <input
                type="text"
                name="meta.audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Kurz Zielgruppe"
                disabled={disabledControls}
                className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
              />
            </div>

            {/* Kanäle */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Kanäle</label>
              <div className="flex flex-wrap items-center gap-1">
                {channels.map((channel, idx) => (
                  <span
                    key={`${channel.label}-${idx}`}
                    className={clsx(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                      BADGE_COLOR_MAP[channel.color]
                    )}
                  >
                    {channel.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Planung */}
          <div className="flex flex-col gap-2">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Planung</p>
            
            {/* Datum */}
            <div className="flex items-center justify-between">
              <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Datum</label>
              <input
                type="date"
                name="schedule.date"
                value={schedule?.date || ''}
                onChange={(e) => setSchedule((prev) => prev ? { ...prev, date: e.target.value } : null)}
                disabled={disabledControls}
                className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
              />
            </div>

            {/* Zeit */}
            <div className="flex items-center justify-between">
              <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Zeit</label>
              <input
                type="time"
                name="schedule.time"
                value={schedule?.time || ''}
                onChange={(e) => setSchedule((prev) => prev ? { ...prev, time: e.target.value } : null)}
                placeholder="HH:MM"
                disabled={disabledControls}
                className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
              />
            </div>

            {/* Freigabe nötig */}
            <div className="flex items-center justify-between">
              <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">
                <input
                  type="checkbox"
                  name="schedule.needsApproval"
                  checked={schedule?.needsApproval || false}
                  onChange={(e) => setSchedule((prev) => prev ? { ...prev, needsApproval: e.target.checked } : null)}
                  disabled={disabledControls}
                  className="mr-2"
                />
                Freigabe nötig
              </label>
              <button
                type="button"
                disabled={disabledControls}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] disabled:opacity-50"
              >
                <CalendarIcon className="h-4 w-4" />
                Plan anpassen im Chat
              </button>
            </div>
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Assets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="ak-caption text-[var(--ak-color-text-secondary)]">Assets</p>
              <button
                type="button"
                onClick={handleCopyBundle}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
              >
                <Square3Stack3DIcon className="h-4 w-4" />
                Export/Copy
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {assets.map((asset) => {
                const IconComponent = ICON_MAP[asset.icon] || Square3Stack3DIcon
                return (
                  <div
                    key={asset.id}
                    className="flex items-center gap-3 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-2"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[var(--ak-color-bg-surface-muted)]/50">
                      <IconComponent className="h-5 w-5 text-[var(--ak-color-text-primary)]" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0">
                      <p className="ak-body text-sm font-semibold text-[var(--ak-color-text-primary)]">
                        {asset.title}
                      </p>
                      <p className="ak-caption text-[var(--ak-color-text-secondary)]">{asset.body}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAsset(asset.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
                    >
                      Kopieren
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Verbindungen */}
          <div className="flex flex-col gap-2">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Verbindungen</p>
            <div className="flex flex-col gap-2">
              {connections.map((connection) => {
                const IconComponent = connection.type === 'email' ? EnvelopeIcon : DevicePhoneMobileIcon
                return (
                  <div
                    key={connection.id}
                    className="flex items-center gap-3 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-2"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[var(--ak-color-bg-surface-muted)]/50">
                      <IconComponent className="h-5 w-5 text-[var(--ak-color-text-primary)]" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0">
                      <p className="ak-body text-sm font-semibold text-[var(--ak-color-text-primary)]">
                        {connection.label}
                      </p>
                      <p
                        className={clsx(
                          'ak-caption',
                          connection.connected
                            ? 'text-[var(--ak-color-text-success)]'
                            : 'text-[var(--ak-color-text-secondary)]'
                        )}
                      >
                        {connection.connected ? 'Verbunden' : 'Nicht verbunden'}
                      </p>
                    </div>
                    {connection.connected ? (
                      <span className="inline-flex items-center rounded-full border border-[var(--ak-color-border-success)] bg-[var(--ak-color-bg-success)] px-2 py-0.5 text-[10px] font-medium text-[var(--ak-color-text-success)]">
                        OK
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
                      >
                        Verbindung herstellen
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Erweitert */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="ak-caption text-[var(--ak-color-text-secondary)]">Erweitert</p>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                {showAdvanced ? 'Ausblenden' : 'Erweitert'}
              </button>
            </div>
            {showAdvanced && utm && internal && (
              <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-elevated-secondary)] p-3">
                <div className="flex flex-col gap-2">
                  <p className="ak-caption text-[var(--ak-color-text-secondary)]">Tracking</p>
                  
                  {/* UTM Source */}
                  <div className="flex items-center justify-between">
                    <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">UTM Source</label>
                    <input
                      type="text"
                      name="utm.source"
                      value={utm.source}
                      onChange={(e) => setUtm((prev) => prev ? { ...prev, source: e.target.value } : null)}
                      placeholder="utm_source"
                      disabled={disabledControls}
                      className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
                    />
                  </div>

                  {/* UTM Medium */}
                  <div className="flex items-center justify-between">
                    <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">UTM Medium</label>
                    <input
                      type="text"
                      name="utm.medium"
                      value={utm.medium}
                      onChange={(e) => setUtm((prev) => prev ? { ...prev, medium: e.target.value } : null)}
                      placeholder="utm_medium"
                      disabled={disabledControls}
                      className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
                    />
                  </div>

                  {/* UTM Campaign */}
                  <div className="flex items-center justify-between">
                    <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">UTM Campaign</label>
                    <input
                      type="text"
                      name="utm.campaign"
                      value={utm.campaign}
                      onChange={(e) => setUtm((prev) => prev ? { ...prev, campaign: e.target.value } : null)}
                      placeholder="utm_campaign"
                      disabled={disabledControls}
                      className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
                    />
                  </div>

                  <div className="h-px bg-[var(--ak-color-border-subtle)]" />

                  <p className="ak-caption text-[var(--ak-color-text-secondary)]">Interne IDs</p>
                  
                  {/* Externe ID */}
                  <div className="flex items-center justify-between">
                    <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Externe ID</label>
                    <input
                      type="text"
                      name="internal.externalId"
                      value={internal.externalId}
                      onChange={(e) => setInternal((prev) => prev ? { ...prev, externalId: e.target.value } : null)}
                      placeholder="ID"
                      disabled={disabledControls}
                      className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Footer Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={viewState !== 'ready'}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90 disabled:opacity-50"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Speichern
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            >
              Schließen
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

