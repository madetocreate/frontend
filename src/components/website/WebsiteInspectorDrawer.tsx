'use client'

import React, { useState } from 'react'
import { 
  GlobeAltIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { 
  DrawerCard
} from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { WebsiteView } from './WebsiteSidebarWidget'
import clsx from 'clsx'

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

export function WebsiteInspectorDrawer({ view, onClose, onExpand, isExpanded, onAction: _onAction }: WebsiteInspectorDrawerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<'chats' | 'knowledge' | 'design'>('chats')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAiMenu, _setShowAiMenu] = useState(false)
  const config = VIEW_CONFIG[view] || VIEW_CONFIG.overview

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
      {/* 1. Compact Header */}
      <div className="relative px-4 py-3 bg-[var(--ak-color-bg-surface)]">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    <GlobeAltIcon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] uppercase tracking-wider leading-none">
                          Website-Bot
                      </h1>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <p className="text-[10px] text-[var(--ak-color-text-muted)] font-medium mt-0.5">
                        Chat-Widget & Support
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <AkBadge tone="info" size="xs">Live</AkBadge>
                {onExpand && (
                    <button 
                        onClick={onExpand}
                        className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-colors"
                    >
                        {isExpanded ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-colors"
                >
                    <span className="sr-only">Schließen</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        {/* 2. Smart Tabs */}
        <div className="flex gap-1 bg-[var(--ak-color-bg-surface-muted)] p-0.5 rounded-lg w-fit">
          {(['chats', 'knowledge', 'design'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all",
                activeTab === tab 
                  ? "bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm" 
                  : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
              )}
            >
              {tab === 'chats' && 'Chats'}
              {tab === 'knowledge' && 'Wissen'}
              {tab === 'design' && 'Design'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar p-6 space-y-6">
        
        {/* 3. Tab Content (Zuerst!) */}
        {activeTab === 'chats' && (
            <div className="space-y-4">
                <DrawerCard title="Übersicht">
                    <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
                        {config?.description || 'Dein KI-Chatbot für die Webseite.'}
                    </p>
                </DrawerCard>
            </div>
        )}

        <AISuggestionGrid
          context="website"
          summary={`Website Bot – ${view}`}
          text={config.description}
          channel="web"
        />

        {/* 5. Micro-Charts Grid */}
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

      </div>
    </div>
  )
}
