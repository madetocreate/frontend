'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'

type Campaign = {
  id: string
  name: string
  type: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  channels: string[]
  budget: number | null
  currency: string
  start_date: string | null
  end_date: string | null
  briefing: string | null
  tone: string | null
  language: string
  created_at: string | null
  updated_at: string | null
}

type CampaignDetailDrawerProps = {
  campaignId: string | null
  onClose: () => void
  onUpdate: () => void
}

export function CampaignDetailDrawer({ campaignId, onClose, onUpdate }: CampaignDetailDrawerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Campaign>>({})

  useEffect(() => {
    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId])

  const loadCampaign = async () => {
    if (!campaignId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/marketing/campaigns/${campaignId}`)
      if (!response.ok) {
        throw new Error('Failed to load campaign')
      }
      const data = await response.json()
      setCampaign(data)
      setFormData(data)
    } catch (err) {
      console.error('Error loading campaign:', err)
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Fehler beim Laden der Kampagne' }
        })
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!campaignId) return

    try {
      setSaving(true)
      const response = await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Fehler beim Speichern' }))
        throw new Error(errorData.error || 'Fehler beim Speichern')
      }

      const updated = await response.json()
      setCampaign(updated)
      setEditing(false)
      onUpdate()
      
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'success', message: 'Kampagne erfolgreich aktualisiert' }
        })
      )
    } catch (err) {
      console.error('Error saving campaign:', err)
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: err instanceof Error ? err.message : 'Fehler beim Speichern' }
        })
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(campaign || {})
    setEditing(false)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatBudget = (budget: number | null, currency: string) => {
    if (!budget) return '-'
    return `${budget.toFixed(0)}${currency === 'EUR' ? '€' : currency}`
  }

  if (!campaignId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[var(--ak-color-bg-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--ak-color-border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[var(--ak-color-text-primary)]">
              {loading ? 'Lade...' : campaign?.name || 'Kampagne'}
            </h2>
            {campaign && !editing && (
              <AkBadge 
                tone={
                  campaign.status === 'active' ? 'success' :
                  campaign.status === 'paused' ? 'warning' :
                  campaign.status === 'completed' ? 'info' :
                  campaign.status === 'cancelled' ? 'danger' :
                  'muted'
                }
              >
                {campaign.status === 'active' ? 'Aktiv' :
                 campaign.status === 'paused' ? 'Pausiert' :
                 campaign.status === 'completed' ? 'Abgeschlossen' :
                 campaign.status === 'cancelled' ? 'Abgebrochen' :
                 'Entwurf'}
              </AkBadge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <AkButton
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Abbrechen
                </AkButton>
                <AkButton
                  size="sm"
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                  leftIcon={saving ? undefined : <CheckIcon className="h-4 w-4" />}
                >
                  {saving ? 'Speichere...' : 'Speichern'}
                </AkButton>
              </>
            ) : (
              <>
                <AkButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                  leftIcon={<PencilIcon className="h-4 w-4" />}
                >
                  Bearbeiten
                </AkButton>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[var(--ak-color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : campaign ? (
            <>
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider">
                  Grundinformationen
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
                      Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                      />
                    ) : (
                      <p className="text-sm text-[var(--ak-color-text-primary)]">{campaign.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
                      Typ
                    </label>
                    {editing ? (
                      <select
                        value={formData.type || ''}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                      >
                        <option value="social">Social Media</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="launch">Launch/Promo</option>
                        <option value="ads">Werbeanzeigen</option>
                        <option value="other">Sonstiges</option>
                      </select>
                    ) : (
                      <p className="text-sm text-[var(--ak-color-text-primary)] capitalize">{campaign.type}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
                      Status
                    </label>
                    {editing ? (
                      <select
                        value={formData.status || 'draft'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Campaign['status'] })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                      >
                        <option value="draft">Entwurf</option>
                        <option value="active">Aktiv</option>
                        <option value="paused">Pausiert</option>
                        <option value="completed">Abgeschlossen</option>
                        <option value="cancelled">Abgebrochen</option>
                      </select>
                    ) : (
                      <AkBadge 
                        tone={
                          campaign.status === 'active' ? 'success' :
                          campaign.status === 'paused' ? 'warning' :
                          campaign.status === 'completed' ? 'info' :
                          campaign.status === 'cancelled' ? 'danger' :
                          'muted'
                        }
                      >
                        {campaign.status === 'active' ? 'Aktiv' :
                         campaign.status === 'paused' ? 'Pausiert' :
                         campaign.status === 'completed' ? 'Abgeschlossen' :
                         campaign.status === 'cancelled' ? 'Abgebrochen' :
                         'Entwurf'}
                      </AkBadge>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
                      Budget
                    </label>
                    {editing ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.budget || ''}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : null })}
                          className="flex-1 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                          placeholder="0"
                        />
                        <select
                          value={formData.currency || 'EUR'}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                        >
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--ak-color-text-primary)]">{formatBudget(campaign.budget, campaign.currency)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Channels */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider">
                  Kanäle
                </h3>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {['instagram', 'linkedin', 'facebook', 'twitter', 'email', 'website'].map((channel) => (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.channels || []).includes(channel)}
                          onChange={(e) => {
                            const channels = formData.channels || []
                            if (e.target.checked) {
                              setFormData({ ...formData, channels: [...channels, channel] })
                            } else {
                              setFormData({ ...formData, channels: channels.filter(c => c !== channel) })
                            }
                          }}
                          className="rounded border-[var(--ak-color-border-subtle)]"
                        />
                        <span className="text-sm text-[var(--ak-color-text-primary)] capitalize">{channel}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {campaign.channels.length > 0 ? (
                      campaign.channels.map((channel) => (
                        <AkBadge key={channel} tone="info">
                          {channel}
                        </AkBadge>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--ak-color-text-muted)]">Keine Kanäle ausgewählt</p>
                    )}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider">
                  Zeitraum
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
                      Startdatum
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? `${e.target.value}T00:00:00Z` : null })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                      />
                    ) : (
                      <p className="text-sm text-[var(--ak-color-text-primary)]">{formatDate(campaign.start_date)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
                      Enddatum
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? `${e.target.value}T00:00:00Z` : null })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                      />
                    ) : (
                      <p className="text-sm text-[var(--ak-color-text-primary)]">{formatDate(campaign.end_date)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Briefing */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider">
                  Briefing
                </h3>
                {editing ? (
                  <textarea
                    value={formData.briefing || ''}
                    onChange={(e) => setFormData({ ...formData, briefing: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                    placeholder="Beschreibe die Kampagne..."
                  />
                ) : (
                  <p className="text-sm text-[var(--ak-color-text-primary)] whitespace-pre-wrap">
                    {campaign.briefing || 'Kein Briefing vorhanden'}
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider">
                  Weitere Informationen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Tonalität:</span>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.tone || ''}
                        onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                        placeholder="z.B. locker, professionell"
                      />
                    ) : (
                      <span className="ml-2 text-[var(--ak-color-text-primary)]">{campaign.tone || '-'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Sprache:</span>
                    {editing ? (
                      <select
                        value={formData.language || 'de-DE'}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                      >
                        <option value="de-DE">Deutsch</option>
                        <option value="en-US">Englisch</option>
                        <option value="fr-FR">Französisch</option>
                      </select>
                    ) : (
                      <span className="ml-2 text-[var(--ak-color-text-primary)]">{campaign.language}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Erstellt:</span>
                    <span className="ml-2 text-[var(--ak-color-text-primary)]">{formatDate(campaign.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ak-color-text-secondary)]">Aktualisiert:</span>
                    <span className="ml-2 text-[var(--ak-color-text-primary)]">{formatDate(campaign.updated_at)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-[var(--ak-color-text-secondary)]">Kampagne nicht gefunden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

