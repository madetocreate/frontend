'use client'

import React, { useState } from 'react'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { DrawerCard, DrawerSectionTitle } from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  RocketLaunchIcon, 
  ChevronRightIcon, 
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Campaign } from './GrowthDetailsDrawer' // Import types

type GrowthDetailsDrawerProps = {
  item: Campaign | null
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

export function GrowthDetailsDrawerV2({
  item,
  onClose,
  onExpand,
  isExpanded,
  onAction: _onAction // eslint-disable-line @typescript-eslint/no-unused-vars
}: GrowthDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState('details')

  const tabs: DrawerTabItem[] = [
    { id: 'details', label: 'Details' },
    { id: 'verlauf', label: 'Verlauf' }
  ]

  // ------------------------------------------------------------------
  // LIST VIEW (Kein Item gewählt)
  // ------------------------------------------------------------------
  if (!item) {
    return (
      <AkDrawerScaffold
        header={
          <InspectorHeader
            icon={RocketLaunchIcon}
            title="Wachstum Details"
            subtitle="Kampagnen & Leads"
            onClose={onClose!}
            onExpand={onExpand}
            isExpanded={isExpanded}
            actions={<AkBadge tone="warning" size="sm">4 Aktive</AkBadge>}
          />
        }
        title={null}
      >
        <div className="p-4 space-y-6">
           <DrawerSectionTitle>Top Kampagnen</DrawerSectionTitle>
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
                              <AkBadge tone={c.status === 'active' ? 'success' : 'muted'} size="sm">{c.status}</AkBadge>
                              <span className="text-[11px] text-[var(--ak-color-text-muted)] font-medium uppercase tracking-wider">{c.budget} Budget</span>
                          </div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
              ))}
           </div>
        </div>
      </AkDrawerScaffold>
    )
  }

  const statusTone: 'muted' | 'success' | 'warning' | 'danger' | 'info' = (() => {
    const statusMap: Record<Campaign['status'], 'muted' | 'success' | 'warning' | 'danger' | 'info'> = {
      active: 'success',
      draft: 'muted',
      paused: 'warning',
      completed: 'info'
    }
    return statusMap[item.status]
  })()

  // ------------------------------------------------------------------
  // DETAIL VIEW
  // ------------------------------------------------------------------
  return (
    <AkDrawerScaffold
      header={
        <InspectorHeader
          icon={RocketLaunchIcon}
          title={item.name}
          subtitle={`${item.type} • ${item.audience}`}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose!}
          onExpand={onExpand}
          isExpanded={isExpanded}
          actions={
            <div className="flex items-center gap-2">
               <AkBadge tone={statusTone} size="sm">{item.status.toUpperCase()}</AkBadge>
            </div>
          }
        />
      }
      title={null}
    >
      <div className="flex flex-col h-full">
        {activeTab === 'details' && (
          <div className="p-6 space-y-6">
             {/* Micro-Charts (Stats Grid) */}
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

            <DrawerCard title="Kanal-Verteilung">
                <div className="space-y-3 py-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[var(--ak-color-text-secondary)]">Social Media</span>
                        <span className="font-bold text-[var(--ak-color-text-primary)]">65%</span>
                    </div>
                    <div className="w-full bg-[var(--ak-color-bg-surface-muted)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[65%]" />
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1">
                        <span className="font-medium text-[var(--ak-color-text-secondary)]">E-Mail Marketing</span>
                        <span className="font-bold text-[var(--ak-color-text-primary)]">25%</span>
                    </div>
                    <div className="w-full bg-[var(--ak-color-bg-surface-muted)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[25%]" />
                    </div>
                </div>
            </DrawerCard>

            {/* AI Suggestions */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
                    <h4 className="text-xs font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">KI-Empfehlungen</h4>
                </div>
                <AISuggestionGrid
                    context="growth"
                    summary={`${item.name} – ${item.type}`}
                    text={`Status ${item.status}, Budget ${item.budget}€, Audience ${item.audience}`}
                    channel="marketing"
                />
            </div>
          </div>
        )}

        {activeTab === 'verlauf' && (
           <div className="p-6 flex-1 overflow-y-auto ak-scrollbar">
             {/* Placeholder for History */}
             <div className="text-center text-[var(--ak-color-text-muted)] py-8 text-sm">
               Keine Aktivitäten gefunden.
             </div>
           </div>
        )}
      </div>
    </AkDrawerScaffold>
  )
}

