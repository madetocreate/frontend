'use client'

import { useState, useEffect } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkButton } from '@/components/ui/AkButton'
import { PlusIcon, PlayIcon, PauseIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { CampaignDetailDrawer } from './CampaignDetailDrawer'

type Campaign = {
  id: string
  name: string
  type: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  channels: string[]
  budget: number | null
  currency: string
  created_at: string | null
  updated_at: string | null
}

export function GrowthCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/marketing/campaigns')
      if (!response.ok) {
        throw new Error('Failed to load campaigns')
      }
      const data = await response.json()
      setCampaigns(data.items || [])
      setError(null)
    } catch (err) {
      console.error('Error loading campaigns:', err)
      setError('Fehler beim Laden der Kampagnen')
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
    
    const handleReload = () => {
      loadCampaigns()
    }
    
    window.addEventListener('aklow-reload-campaigns', handleReload)
    return () => {
      window.removeEventListener('aklow-reload-campaigns', handleReload)
    }
  }, [])

  const handleStatusToggle = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    try {
      const response = await fetch(`/api/marketing/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        await loadCampaigns()
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: `Kampagne ${newStatus === 'active' ? 'aktiviert' : 'pausiert'}` }
          })
        )
      }
    } catch (err) {
      console.error('Error updating campaign:', err)
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Fehler beim Aktualisieren' }
        })
      )
    }
  }

  const formatBudget = (budget: number | null, currency: string) => {
    if (!budget) return '-'
    return `${budget.toFixed(0)}${currency === 'EUR' ? '€' : currency}`
  }

  const formatChannels = (channels: string[]) => {
    if (!channels || channels.length === 0) return '-'
    if (channels.length === 1) return channels[0]
    if (channels.length <= 3) return channels.join(', ')
    return `${channels.slice(0, 2).join(', ')} +${channels.length - 2}`
  }

  return (
    <div className="py-6 space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Kampagnen</h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Verwalte deine Marketing-Aktivitäten über alle Kanäle.
            </p>
        </div>
        <AkButton 
          variant="primary" 
          leftIcon={<PlusIcon className="h-4 w-4"/>}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('aklow-open-module', {
              detail: { module: 'growth', action: 'create-campaign' }
            }))
          }}
        >
          Neue Kampagne
        </AkButton>
      </div>

      {/* Mini AI Rec */}
      <div className="p-4 rounded-xl border border-[var(--ak-accent-inbox)]/25 bg-[var(--ak-accent-inbox-soft)]/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]">
              <SparklesIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
              <p className="text-sm font-medium ak-text-primary">Empfehlung: Facebook Ad Retargeting</p>
              <p className="text-xs ak-text-secondary">Deine Warenkorb-Abbrecher sind um 20% gestiegen. Aktiviere die Retargeting-Kampagne.</p>
          </div>
          <AkButton size="sm" variant="primary" className="shrink-0">Kampagne starten</AkButton>
      </div>

      <WidgetCard padding="sm" className="flex-1 overflow-hidden flex flex-col ak-glass">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[var(--ak-color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-[var(--ak-color-text-secondary)]">
            <p>{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <p className="text-[var(--ak-color-text-secondary)]">Noch keine Kampagnen vorhanden</p>
            <AkButton 
              variant="secondary" 
              leftIcon={<PlusIcon className="h-4 w-4"/>}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('aklow-open-module', {
                  detail: { module: 'growth', action: 'create-campaign' }
                }))
              }}
            >
              Erste Kampagne erstellen
            </AkButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--ak-color-bg-sidebar)] border-b border-[var(--ak-color-border-subtle)]">
                    <tr>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Name</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Typ</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Kanäle</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Budget</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Aktionen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface)]">
                    {campaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                            <td className="px-4 py-3">
                                {camp.status === 'active' && <AkBadge tone="success">Aktiv</AkBadge>}
                                {camp.status === 'paused' && <AkBadge tone="warning">Pausiert</AkBadge>}
                                {camp.status === 'draft' && <AkBadge tone="muted">Entwurf</AkBadge>}
                                {camp.status === 'completed' && <AkBadge tone="info">Abgeschlossen</AkBadge>}
                                {camp.status === 'cancelled' && <AkBadge tone="danger">Abgebrochen</AkBadge>}
                            </td>
                            <td className="px-4 py-3 font-medium text-[var(--ak-color-text-primary)]">{camp.name}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)] capitalize">{camp.type}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">{formatChannels(camp.channels)}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-primary)] text-right font-mono text-xs">{formatBudget(camp.budget, camp.currency)}</td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <AkButton 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedCampaignId(camp.id)
                                      }}
                                    >
                                        <ChartBarIcon className="h-4 w-4" />
                                    </AkButton>
                                    {(camp.status === 'active' || camp.status === 'paused') && (
                                        <AkButton 
                                          size="sm" 
                                          variant="ghost"
                                          onClick={() => handleStatusToggle(camp)}
                                        >
                                          {camp.status === 'active' ? (
                                            <PauseIcon className="h-4 w-4" />
                                          ) : (
                                            <PlayIcon className="h-4 w-4" />
                                          )}
                                        </AkButton>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </WidgetCard>

      {/* Campaign Detail Drawer */}
      {selectedCampaignId && (
        <CampaignDetailDrawer
          campaignId={selectedCampaignId}
          onClose={() => setSelectedCampaignId(null)}
          onUpdate={() => {
            loadCampaigns()
            setSelectedCampaignId(null)
          }}
        />
      )}
    </div>
  )
}
