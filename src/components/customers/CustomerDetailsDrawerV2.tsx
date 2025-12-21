'use client'

import React, { useState } from 'react'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { DrawerSectionTitle } from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  UserGroupIcon, 
  ChevronRightIcon, 
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { CustomerProfile } from './CustomerDetailsDrawer' // Import types

type CustomerDetailsDrawerProps = {
  customer: CustomerProfile | null
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

export function CustomerDetailsDrawerV2({
  customer,
  onClose,
  onExpand,
  isExpanded,
  onAction: _onAction // eslint-disable-line @typescript-eslint/no-unused-vars
}: CustomerDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState('details')

  const tabs: DrawerTabItem[] = [
    { id: 'details', label: 'Details' },
    { id: 'ki', label: 'KI-Assistenz' },
    { id: 'verlauf', label: 'Verlauf' }
  ]

  // ------------------------------------------------------------------
  // LIST VIEW (Kein Kunde gewählt)
  // ------------------------------------------------------------------
  if (!customer) {
    return (
      <AkDrawerScaffold
        header={
          <InspectorHeader
            icon={UserGroupIcon}
            title="Kunden-Radar"
            subtitle="Beziehungen & Chancen"
            onClose={onClose!}
            onExpand={onExpand}
            isExpanded={isExpanded}
            actions={<AkBadge tone="info" size="xs">128 Kunden</AkBadge>}
          />
        }
        title={null}
      >
        <div className="p-4 space-y-6">
           <DrawerSectionTitle>Top Opportunities</DrawerSectionTitle>
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
                              <AkBadge tone={c.status === 'active' ? 'success' : c.status === 'lead' ? 'info' : 'danger'} size="xs">{c.status}</AkBadge>
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
      </AkDrawerScaffold>
    )
  }

  // ------------------------------------------------------------------
  // DETAIL VIEW
  // ------------------------------------------------------------------
  return (
    <AkDrawerScaffold
      header={
        <InspectorHeader
          icon={UserGroupIcon} // Or specific avatar if possible? Using generic icon for now
          title={customer.name}
          subtitle={customer.company}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose!}
          onExpand={onExpand}
          isExpanded={isExpanded}
          actions={
            <div className="flex items-center gap-2">
               <AkBadge tone={customer.healthScore > 80 ? 'success' : 'warning'} size="xs">{customer.healthScore}% Health</AkBadge>
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

            <DrawerSectionTitle>Profil</DrawerSectionTitle>
            <div className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] rounded-xl p-4 space-y-3">
                 <div className="flex justify-between border-b border-[var(--ak-color-border-hairline)] pb-2">
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">Firma</span>
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">{customer.company}</span>
                 </div>
                 <div className="flex justify-between border-b border-[var(--ak-color-border-hairline)] pb-2">
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">E-Mail</span>
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">{customer.email}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">Telefon</span>
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">{customer.phone}</span>
                 </div>
            </div>
          </div>
        )}

        {activeTab === 'ki' && (
          <div className="p-4 flex-1 overflow-y-auto ak-scrollbar">
            <AISuggestionGrid
                context="customer"
                summary={`${customer.name} – ${customer.company}`}
                text={`HealthScore ${customer.healthScore}%, letzter Kontakt ${customer.lastContact}`}
            />
          </div>
        )}

        {activeTab === 'verlauf' && (
           <div className="p-6 flex-1 overflow-y-auto ak-scrollbar">
             <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--ak-color-border-subtle)]">
                {/* Timeline items */}
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
             </div>
           </div>
        )}
      </div>
    </AkDrawerScaffold>
  )
}

