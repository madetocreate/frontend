'use client'

import React, { useState } from 'react'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { DrawerCard } from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  GlobeAltIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { WebsiteView } from './WebsiteSidebarWidget'

interface WebsiteInspectorDrawerProps {
  view: WebsiteView
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

const VIEW_CONFIG: Record<WebsiteView, { description: string }> = {
  overview: {
    description: 'Dein KI-Chatbot für die Webseite. Beantwortet Kundenanfragen, sammelt Leads und vereinbart Termine.',
  },
  conversations: {
    description: 'Alle Gespräche mit deinen Website-Besuchern. Analysiere Chats, Leads und Conversion-Raten.',
  },
  content: {
    description: 'Trainiere den Bot mit deinem Wissen. Lade Dokumente hoch oder crawle deine Webseite.',
  },
  appearance: {
    description: 'Passe das Aussehen des Chat-Widgets an deine Brand an. Farben, Logos und Texte.',
  }
}

export function WebsiteInspectorDrawerV2({
  view,
  onClose,
  onExpand,
  isExpanded,
  onAction: _onAction // eslint-disable-line @typescript-eslint/no-unused-vars
}: WebsiteInspectorDrawerProps) {
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
          icon={GlobeAltIcon}
          title="Website-Bot"
          subtitle={view.charAt(0).toUpperCase() + view.slice(1)}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose!}
          onExpand={onExpand}
          isExpanded={isExpanded}
          actions={
             <AkBadge tone="info" size="xs">Live</AkBadge>
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
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Chats</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">85</span>
                  <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
                    +15%
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Leads</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">12</span>
                  <span className="text-xs font-bold text-[var(--ak-color-text-muted)] mb-1">
                    Heute
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Rating</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">4.8</span>
                  <span className="text-xs font-bold text-green-600 mb-1">Top</span>
                </div>
              </div>
            </div>

            <DrawerCard title="Übersicht">
                <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
                    {config?.description || 'Dein KI-Chatbot für die Webseite.'}
                </p>
            </DrawerCard>
          </div>
        )}

        {activeTab === 'ki' && (
          <div className="p-4 flex-1 overflow-y-auto ak-scrollbar">
            <AISuggestionGrid
                context="website"
                summary={`Website Bot – ${view}`}
                text={config.description}
                channel="web"
            />
          </div>
        )}

        {activeTab === 'verlauf' && (
           <div className="p-6 flex-1 overflow-y-auto ak-scrollbar">
             {/* Placeholder */}
             <div className="text-center text-[var(--ak-color-text-muted)] py-8 text-sm">
                Keine Chats in den letzten 24 Stunden.
             </div>
           </div>
        )}
      </div>
    </AkDrawerScaffold>
  )
}

