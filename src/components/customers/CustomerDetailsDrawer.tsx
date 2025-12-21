'use client'

import React, { useState } from 'react'
import { 
  BriefcaseIcon, 
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import { 
  DrawerSectionTitle
} from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import clsx from 'clsx'

// Types (Dummy)
export type CustomerProfile = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: 'active' | 'lead' | 'churned'
  tags: string[]
  lastContact: string
  ltv: number
  healthScore: number // 0-100
}

type CustomerDetailsDrawerProps = {
  customer: CustomerProfile | null
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
}

export function CustomerDetailsDrawer({ customer, onClose, onExpand, isExpanded }: CustomerDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'files'>('overview')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAiMenu, _setShowAiMenu] = useState(false)

  if (!customer) {
    return (
      <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
        {/* Compact Header - Dashboard Style */}
        <div className="relative px-4 py-3 bg-[var(--ak-color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    <UserGroupIcon className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] uppercase tracking-wider leading-none">
                        Kunden-Radar
                    </h1>
                    <p className="text-[10px] text-[var(--ak-color-text-muted)] font-medium mt-0.5">
                        Verwalte Beziehungen und identifiziere Chancen.
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <AkBadge tone="info" size="sm">128 Kunden</AkBadge>
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
            {/* Kunden Liste (Zuerst!) */}
            <div>
                <DrawerSectionTitle className="mb-4">Top Opportunities</DrawerSectionTitle>
                <div className="space-y-1">
                    {[
                      { id: '1', name: 'Muster GmbH', contact: 'Max Mustermann', status: 'active', pot: 'High' },
                      { id: '2', name: 'Creative Studio', contact: 'Lisa Design', status: 'lead', pot: 'Mid' },
                      { id: '3', name: 'Tech Solutions', contact: 'Tom Tech', status: 'active', pot: 'High' },
                      { id: '4', name: 'Food & Co', contact: 'Gastro Profis', status: 'churned', pot: 'Low' },
                    ].map(c => (
                        <button 
                            key={c.id}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--ak-color-bg-hover)] transition-all text-left border border-transparent hover:border-[var(--ak-color-border-subtle)] group"
                        >
                            <div className={clsx(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold border",
                                c.pot === 'High' ? "bg-green-50 text-green-600 border-green-100" :
                                c.pot === 'Mid' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                "bg-gray-50 text-gray-500 border-gray-100"
                            )}>
                                {c.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[var(--ak-color-text-primary)] truncate">{c.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-[var(--ak-color-text-muted)] font-medium">{c.contact}</span>
                                    <span className="text-[var(--ak-color-border-strong)]">•</span>
                                    <AkBadge tone={c.status === 'active' ? 'success' : c.status === 'lead' ? 'info' : 'danger'} size="sm">{c.status}</AkBadge>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={clsx(
                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                                    c.pot === 'High' ? "bg-green-100 text-green-700" :
                                    c.pot === 'Mid' ? "bg-blue-100 text-blue-700" :
                                    "bg-gray-100 text-gray-700"
                                )}>
                                    {c.pot} Pot.
                                </span>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                    <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Gesamt</p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">1,248</span>
                        <span className="text-xs font-bold text-green-600 mb-1">+5%</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                    <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Churn Risk</p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">3.2%</span>
                        <span className="text-xs font-bold text-green-600 mb-1">-0.8%</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                    <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">NPS</p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">72</span>
                        <span className="text-xs font-bold text-indigo-600 mb-1">High</span>
                    </div>
                </div>
            </div>

            <AISuggestionGrid
              context="customer"
              summary="Kunden-Radar"
              text="Dashboard-Übersicht der Kundenbeziehungen."
            />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
      {/* 1. Compact Header - Detail Style */}
      <div className="relative px-4 py-3 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-[var(--ak-color-bg-app)]">
                    {customer.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] tracking-tight leading-none truncate max-w-[200px]">
                        {customer.name}
                    </h1>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--ak-color-text-secondary)] font-medium mt-0.5">
                        <BriefcaseIcon className="w-3 h-3" />
                        {customer.company}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                    {customer.healthScore}% Health
                </div>
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
          {(['overview', 'activity', 'files'] as const).map((tab) => (
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
              {tab === 'overview' && 'Überblick'}
              {tab === 'activity' && 'Aktivitäten'}
              {tab === 'files' && 'Dateien'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar p-6 space-y-6">
        
        {/* 3. Visuelle Timeline (Zuerst!) */}
        <div className="pt-2">
          <DrawerSectionTitle className="mb-4">Letzte Aktivitäten</DrawerSectionTitle>
          <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--ak-color-border-subtle)]">
            
            <div className="relative flex gap-4">
              <div className="absolute -left-[5px] w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[var(--ak-color-bg-app)]" />
              <div className="flex-1 -mt-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-[var(--ak-color-text-primary)]">E-Mail geöffnet</span>
                  <span className="text-[10px] font-medium text-[var(--ak-color-text-muted)]">vor 2 Std</span>
                </div>
                <p className="text-xs text-[var(--ak-color-text-secondary)] mt-0.5">&quot;Angebot Q4 Strategie&quot;</p>
              </div>
            </div>

            <div className="relative flex gap-4">
              <div className="absolute -left-[5px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-[var(--ak-color-bg-app)]" />
              <div className="flex-1 -mt-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-[var(--ak-color-text-primary)]">Meeting gebucht</span>
                  <span className="text-[10px] font-medium text-[var(--ak-color-text-muted)]">Gestern</span>
                </div>
                <p className="text-xs text-[var(--ak-color-text-secondary)] mt-0.5">Zoom Call mit Sarah (Sales)</p>
              </div>
            </div>

            <div className="relative flex gap-4">
              <div className="absolute -left-[5px] w-3 h-3 rounded-full bg-[var(--ak-color-border-strong)] ring-4 ring-[var(--ak-color-bg-app)]" />
              <div className="flex-1 -mt-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-[var(--ak-color-text-secondary)]">Webseite besucht</span>
                  <span className="text-[10px] font-medium text-[var(--ak-color-text-muted)]">Vor 3 Tagen</span>
                </div>
                <p className="text-xs text-[var(--ak-color-text-muted)] mt-0.5">Pricing Page • 4:20 min</p>
              </div>
            </div>

          </div>
        </div>

        <AISuggestionGrid
          context="customer"
          summary={`${customer.name} – ${customer.company}`}
          text={`HealthScore ${customer.healthScore}%, letzter Kontakt ${customer.lastContact}`}
        />

        {/* 5. Micro-Charts (Stats Grid) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors group">
            <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Deal Value</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">
                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(customer.ltv)}
              </span>
              <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
                <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
                +12%
              </span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
            <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Offene Tickets</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">2</span>
              <span className="text-xs font-bold text-[var(--ak-color-text-muted)] mb-1">
                Normal
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
            <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">NPS Score</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">9/10</span>
              <span className="text-xs font-bold text-green-600 mb-1">Promoter</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
