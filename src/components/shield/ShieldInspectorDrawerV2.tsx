'use client'

import React, { useState } from 'react'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { DrawerCard } from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { ShieldView } from './ShieldSidebarWidget'

interface ShieldInspectorDrawerProps {
  view: ShieldView
  status?: 'healthy' | 'warning' | 'offline'
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

const VIEW_CONFIG: Record<ShieldView, { description: string; tips: string[] }> = {
  overview: {
    description: 'Echtzeit-Überwachung der KI-Sicherheit.',
    tips: ['99.9% Protection Rate', 'PII-Maskierung aktiv', 'Active MCP Monitoring'],
  },
  registry: {
    description: 'Zentrale Verwaltung aller MCP-Server.',
    tips: ['5 Server verbunden', '3 Read-Only Tools', '2 Write-Capable Tools'],
  },
  policies: {
    description: 'Definiere granulare Regeln für den Datenaustausch.',
    tips: ['DSGVO Policy aktiv', 'Finanzdaten-Sperre', 'PII Maskierung'],
  },
  logs: {
    description: 'Detailliertes Audit-Protokoll aller KI-Interaktionen.',
    tips: ['Audit Logs: 90 Tage', 'Export jederzeit möglich', 'Live Tracing aktiv'],
  }
}

export function ShieldInspectorDrawerV2({
  view,
  status = 'healthy',
  onClose,
  onExpand,
  isExpanded,
  onAction: _onAction // eslint-disable-line @typescript-eslint/no-unused-vars
}: ShieldInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState('details')

  const tabs: DrawerTabItem[] = [
    { id: 'details', label: 'Details' },
    { id: 'ki', label: 'KI-Assistenz' },
    { id: 'verlauf', label: 'Verlauf' }
  ]

  const config = VIEW_CONFIG[view] || VIEW_CONFIG.overview

  return (
    <AkDrawerScaffold
      header={
        <InspectorHeader
          icon={ShieldCheckIcon}
          title="AI Shield"
          subtitle={view.charAt(0).toUpperCase() + view.slice(1)}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose!}
          onExpand={onExpand}
          isExpanded={isExpanded}
          actions={
            <AkBadge tone={status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'danger'} size="xs">
                {status === 'healthy' ? 'Geschützt' : status === 'warning' ? 'Warnung' : 'Offline'}
            </AkBadge>
          }
        />
      }
      title={null}
    >
      <div className="flex flex-col h-full">
        {activeTab === 'details' && (
          <div className="p-6 space-y-6">
             {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors group">
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Angriffe</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">0</span>
                  <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
                    Sicher
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Policy Hits</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">142</span>
                  <span className="text-xs font-bold text-[var(--ak-color-text-muted)] mb-1">
                    24h
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Uptime</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">100%</span>
                  <span className="text-xs font-bold text-green-600 mb-1">Stabil</span>
                </div>
              </div>
            </div>

            <DrawerCard title="Live Metriken">
                <div className="space-y-2">
                    {config.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--ak-color-text-primary)] font-medium px-1">
                        <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                        <span>{tip}</span>
                    </div>
                    ))}
                </div>
            </DrawerCard>
          </div>
        )}

        {activeTab === 'ki' && (
          <div className="p-4 flex-1 overflow-y-auto ak-scrollbar">
            <AISuggestionGrid
                context="shield"
                summary={`Modul: ${view}`}
                text={config?.description}
                channel="security"
            />
          </div>
        )}

        {activeTab === 'verlauf' && (
           <div className="p-6 flex-1 overflow-y-auto ak-scrollbar">
             {/* Placeholder */}
             <div className="text-center text-[var(--ak-color-text-muted)] py-8 text-sm">
                Keine Sicherheitsvorfälle in den letzten 24 Stunden.
             </div>
           </div>
        )}
      </div>
    </AkDrawerScaffold>
  )
}

