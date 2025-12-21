'use client'

import React, { useState } from 'react'
import { 
  ShieldCheckIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { 
  DrawerCard
} from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { ShieldView } from './ShieldSidebarWidget'
import clsx from 'clsx'

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

export function ShieldInspectorDrawer({ view, status = 'healthy', onClose, onExpand, isExpanded, onAction: _onAction }: ShieldInspectorDrawerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<'live' | 'logs' | 'policies'>('live')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAiMenu, _setShowAiMenu] = useState(false)
  const config = VIEW_CONFIG[view] || VIEW_CONFIG.overview

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
      {/* 1. Compact Header */}
      <div className="relative px-4 py-3 bg-[var(--ak-color-bg-surface)]">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] uppercase tracking-wider leading-none">
                          AI Shield
                      </h1>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <p className="text-[10px] text-[var(--ak-color-text-muted)] font-medium mt-0.5">
                        Sicherheit & Compliance
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <AkBadge tone={status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'danger'} size="xs">
                    {status === 'healthy' ? 'Geschützt' : status === 'warning' ? 'Warnung' : 'Offline'}
                </AkBadge>
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
          {(['live', 'logs', 'policies'] as const).map((tab) => (
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
              {tab === 'live' && 'Live-Status'}
              {tab === 'logs' && 'Audit Logs'}
              {tab === 'policies' && 'Richtlinien'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar p-6 space-y-6">
        
        {/* 3. Tab Content (Zuerst!) */}
        {activeTab === 'live' && (
            <div className="space-y-4">
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

        <AISuggestionGrid
          context="shield"
          summary={`Modul: ${view}`}
          text={config?.description}
          channel="security"
        />

        {/* 5. Micro-Charts Grid */}
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

      </div>
    </div>
  )
}
