'use client'

import React, { useState } from 'react'
import { 
  RocketLaunchIcon, 
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ChevronLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { 
  DrawerCard, 
  DrawerSectionTitle
} from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'

export type Campaign = {
  id: string
  name: string
  status: 'active' | 'draft' | 'paused' | 'completed'
  type: string
  audience: string
  budget: number
  conversion: number
}

type GrowthDetailsDrawerProps = {
  item: Campaign | null
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

export function GrowthDetailsDrawer({ item, onClose, onExpand, isExpanded, onAction: _onAction }: GrowthDetailsDrawerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<'performance' | 'strategy' | 'tasks'>('performance')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAiMenu, _setShowAiMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all')

  // Empty State / Overview
  if (!item) {
    return (
      <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
        {/* Compact Header */}
        <div className="relative px-4 py-3 bg-[var(--ak-color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    <RocketLaunchIcon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] uppercase tracking-wider leading-none">
                          Wachstum Details
                      </h1>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <p className="text-[10px] text-[var(--ak-color-text-muted)] font-medium mt-0.5">
                        Kampagnen & Leads
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <AkBadge tone="warning" size="xs">4 Aktive</AkBadge>
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

        <div className="flex-1 overflow-y-auto ak-scrollbar p-6 space-y-6">
            {/* List of Recent Campaigns (Zuerst!) */}
            <div className="pt-2">
                <DrawerSectionTitle className="mb-4">Top Kampagnen</DrawerSectionTitle>
                <div className="space-y-1">
                    {[
                        { id: '1', name: 'Q4 Sales Push - B2B', status: 'active', roi: '2.4x', budget: '5.000€' },
                        { id: '2', name: 'New Customer Welcome', status: 'active', roi: '4.1x', budget: '1.200€' },
                        { id: '3', name: 'Product Launch X', status: 'paused', roi: '1.2x', budget: '10.000€' },
                    ].map(c => (
                        <button 
                            key={c.id}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-all text-left border border-transparent hover:border-[var(--ak-color-border-subtle)] group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-600 font-bold">
                                {c.roi}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[var(--ak-color-text-primary)] truncate">{c.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <AkBadge tone={c.status === 'active' ? 'success' : 'neutral'} size="xs">{c.status}</AkBadge>
                                    <span className="text-[11px] text-[var(--ak-color-text-muted)] font-medium uppercase tracking-wider">{c.budget} Budget</span>
                                </div>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                    <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Impressions</p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">42.5k</span>
                        <span className="text-xs font-bold text-green-600 mb-1">+12%</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                    <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Leads</p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">843</span>
                        <span className="text-xs font-bold text-green-600 mb-1">+5%</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                    <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Conversion</p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">4.2%</span>
                        <span className="text-xs font-bold text-indigo-600 mb-1">Top</span>
                    </div>
                </div>
            </div>

            <AISuggestionGrid
              context="growth"
              summary="Kampagnen & Leads"
              text="Marketing Übersicht und Top Kampagnen"
              channel="marketing"
            />
        </div>
      </div>
    )
  }

  const statusTone: 'neutral' | 'success' | 'warning' | 'error' | 'info' = (() => {
    const statusMap: Record<Campaign['status'], 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
      active: 'success',
      draft: 'neutral',
      paused: 'warning',
      completed: 'info'
    }
    return statusMap[item.status]
  })()

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
      {/* 1. Compact Header */}
      <div className="relative px-4 py-3 bg-[var(--ak-color-bg-surface)]">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-[var(--ak-color-bg-app)]">
                    {item.name.charAt(0)}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] tracking-tight leading-none">
                          Wachstum Details
                      </h1>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--ak-color-text-secondary)] font-medium mt-0.5 truncate max-w-[220px]">
                        <span className="font-semibold text-[var(--ak-color-text-primary)]">{item.name}</span>
                        <span className="text-[var(--ak-color-border-strong)]">•</span>
                        <span className="truncate">{item.type}</span>
                        <span className="text-[var(--ak-color-border-strong)]">•</span>
                        <span className="truncate">{item.audience}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[var(--ak-color-bg-surface-muted)] rounded-lg px-2 py-1">
                  {(['all','active','paused','draft'] as const).map(key => (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className={clsx(
                        "px-2 py-1 rounded-md text-[11px] font-medium transition-colors",
                        statusFilter === key 
                          ? "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm"
                          : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                      )}
                    >
                      {key === 'all' ? 'Alle' : key === 'active' ? 'Aktiv' : key === 'paused' ? 'Pausiert' : 'Entwurf'}
                    </button>
                  ))}
                </div>
                <div className="hidden md:block">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Suchen..."
                    className="w-48 rounded-lg bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
                  />
                </div>
                <AkBadge tone={statusTone} size="xs">{item.status.toUpperCase()}</AkBadge>
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
          {(['performance', 'strategy', 'tasks'] as const).map((tab) => (
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
              {tab === 'performance' && 'Performance'}
              {tab === 'strategy' && 'Strategie'}
              {tab === 'tasks' && 'Aufgaben'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 ak-scrollbar">
        
        {/* 3. Tab Content (Zuerst!) */}
        {activeTab === 'performance' && (
            <div className="space-y-4">
                <DrawerCard title="Kanal-Verteilung">
                    <div className="space-y-3 py-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-[var(--ak-color-text-secondary)]">Social Media</span>
                            <span className="font-bold text-[var(--ak-color-text-primary)]">65%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[65%]" />
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1">
                            <span className="font-medium text-[var(--ak-color-text-secondary)]">E-Mail Marketing</span>
                            <span className="font-bold text-[var(--ak-color-text-primary)]">25%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full w-[25%]" />
                        </div>
                    </div>
                </DrawerCard>
            </div>
        )}

        <AISuggestionGrid
          context="growth"
          summary={`${item.name} – ${item.type}`}
          text={`Status ${item.status}, Budget ${item.budget}€, Audience ${item.audience}`}
          channel="marketing"
        />

        {/* 5. Micro-Charts Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors group">
            <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Budget</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">{item.budget}€</span>
              <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
                <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
                +12%
              </span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
            <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Conv.</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">{item.conversion}%</span>
              <span className="text-xs font-bold text-green-600 mb-1">
                +0.5%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
            <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Impressions</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">12.4k</span>
              <span className="text-xs font-bold text-gray-400 mb-1">Trend</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
