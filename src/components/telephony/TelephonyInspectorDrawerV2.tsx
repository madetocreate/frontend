'use client'

import React, { useState } from 'react'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { DrawerCard } from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  PhoneIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { TelephonyView } from './TelephonySidebarWidget'

interface TelephonyInspectorDrawerProps {
  view: TelephonyView
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

const VIEW_CONFIG: Record<TelephonyView, { description: string }> = {
  overview: {
    description: 'Verwalte deine AI-Telefonagenten. Analysiere Anrufvolumen, Gesprächsqualität und Automatisierungsrate.',
  },
  numbers: {
    description: 'Verwalte Telefonnummern und leite sie an die passenden Agenten weiter.',
  },
  logs: {
    description: 'Alle Gespräche im Überblick. Höre Aufzeichnungen an oder lies Transkripte.',
  },
  configuration: {
    description: 'Konfiguriere deine Telefon-Bot-Einstellungen. Verwalte Agenten, Skripte und Automatisierungen.',
  }
}

export function TelephonyInspectorDrawerV2({
  view,
  onClose,
  onExpand,
  isExpanded,
  onAction: _onAction // eslint-disable-line @typescript-eslint/no-unused-vars
}: TelephonyInspectorDrawerProps) {
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
          icon={PhoneIcon}
          title="Telefon-Bot"
          subtitle={view.charAt(0).toUpperCase() + view.slice(1)}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose!}
          onExpand={onExpand}
          isExpanded={isExpanded}
          actions={
             <AkBadge tone="success" size="xs">Aktiv</AkBadge>
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
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Anrufe</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">142</span>
                  <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
                    +8%
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Dauer</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">2:45m</span>
                  <span className="text-xs font-bold text-[var(--ak-color-text-muted)] mb-1">
                    Avg
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Qualität</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">98%</span>
                  <span className="text-xs font-bold text-green-600 mb-1">HD</span>
                </div>
              </div>
            </div>

            <DrawerCard title="Übersicht">
                <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
                    {config?.description || 'Verwalte deine AI-Telefonagenten.'}
                </p>
            </DrawerCard>
          </div>
        )}

        {activeTab === 'ki' && (
          <div className="p-4 flex-1 overflow-y-auto ak-scrollbar">
            <AISuggestionGrid
                context="telephony"
                summary={`Telephony – ${view}`}
                text={config?.description}
                channel="phone"
            />
          </div>
        )}

        {activeTab === 'verlauf' && (
           <div className="p-6 flex-1 overflow-y-auto ak-scrollbar">
             {/* Placeholder */}
             <div className="text-center text-[var(--ak-color-text-muted)] py-8 text-sm">
                Keine Anrufe in den letzten 24 Stunden.
             </div>
           </div>
        )}
      </div>
    </AkDrawerScaffold>
  )
}

