'use client'

import React, { useState } from 'react'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { DrawerCard, DrawerSectionTitle } from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  DocumentIcon, 
  ChevronRightIcon, 
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

type DocumentDetailsDrawerProps = {
  documentId: string | null
  selectedCount: number
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

export function DocumentDetailsDrawerV2({
  documentId,
  selectedCount: _selectedCount, // eslint-disable-line @typescript-eslint/no-unused-vars
  onClose,
  onExpand,
  isExpanded,
  onAction
}: DocumentDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'metadata' | 'chat'>('preview')

  const tabs: DrawerTabItem[] = [
    { id: 'details', label: 'Details' },
    { id: 'ki', label: 'KI-Assistenz' },
    { id: 'verlauf', label: 'Verlauf' }
  ]

  // Mock Document Data
  const doc = documentId ? {
    id: documentId,
    name: 'Q4 Financial Report 2024.pdf',
    type: 'PDF Document',
    size: '2.4 MB',
    uploaded: 'Gestern, 14:30',
    status: 'Final',
    views: 24,
    shares: 3
  } : null

  // ------------------------------------------------------------------
  // LIST VIEW (Kein Dokument gewählt)
  // ------------------------------------------------------------------
  if (!doc) {
    return (
      <AkDrawerScaffold
        header={
          <InspectorHeader
            icon={DocumentIcon}
            title="Dokumente Übersicht"
            subtitle="Wissen & Verwaltung"
            onClose={onClose!}
            onExpand={onExpand}
            isExpanded={isExpanded}
            actions={<AkBadge tone="neutral" size="xs">124 Dateien</AkBadge>}
          />
        }
        title={null}
      >
        <div className="p-4 space-y-6">
           <DrawerSectionTitle>Zuletzt bearbeitet</DrawerSectionTitle>
           <div className="space-y-1">
             {[
               { id: '1', name: 'Q4 Financial Report.pdf', size: '2.4 MB', type: 'PDF' },
               { id: '2', name: 'Marketing Strategy 2025.docx', size: '1.1 MB', type: 'DOCX' },
               { id: '3', name: 'Client Contract - Acme Corp.pdf', size: '850 KB', type: 'PDF' },
               { id: '4', name: 'Invoice_re_2023_04.pdf', size: '120 KB', type: 'PDF' },
               { id: '5', name: 'Product Roadmap.pptx', size: '5.2 MB', type: 'PPTX' },
             ].map(doc => (
                <button 
                  key={doc.id}
                  onClick={() => onAction?.('select')} // Mock select action
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center shrink-0 border border-[var(--ak-color-border-hairline)] group-hover:border-[var(--ak-color-border-subtle)]">
                    <DocumentIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--ak-color-text-primary)] truncate">{doc.name}</p>
                    <p className="text-xs text-[var(--ak-color-text-muted)] flex items-center gap-2">
                       <span>{doc.type}</span>
                       <span className="w-1 h-1 rounded-full bg-[var(--ak-color-border-strong)]" />
                       <span>{doc.size}</span>
                    </p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
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
          icon={DocumentIcon}
          title={doc.name}
          subtitle={`${doc.type} • ${doc.size}`}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose!}
          onExpand={onExpand}
          isExpanded={isExpanded}
          actions={
            <div className="flex items-center gap-2">
               <AkBadge tone="success" size="xs">{doc.status}</AkBadge>
            </div>
          }
        />
      }
      title={null}
    >
      <div className="flex flex-col h-full">
        {activeTab === 'details' && (
          <div className="flex flex-col h-full">
             {/* Sub-Tabs for Details */}
             <div className="px-6 pt-4">
               <div className="flex gap-1 bg-[var(--ak-color-bg-surface-muted)] p-0.5 rounded-lg w-fit">
                {(['preview', 'metadata', 'chat'] as const).map((tab) => (
                    <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={clsx(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all",
                        activeSubTab === tab 
                        ? "bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm" 
                        : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                    )}
                    >
                    {tab === 'preview' && 'Vorschau'}
                    {tab === 'metadata' && 'Metadaten'}
                    {tab === 'chat' && 'Q&A Chat'}
                    </button>
                ))}
                </div>
             </div>

             <div className="p-6 space-y-6 flex-1 overflow-y-auto ak-scrollbar">
                {activeSubTab === 'preview' && (
                    <div className="space-y-4">
                        <DrawerCard title="Vorschau">
                            <div className="aspect-[3/4] w-full bg-[var(--ak-color-bg-surface-muted)] rounded-lg border border-[var(--ak-color-border-subtle)] flex items-center justify-center text-[var(--ak-color-text-muted)] text-sm">
                                [PDF Vorschau wird geladen...]
                            </div>
                        </DrawerCard>
                    </div>
                )}
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors group">
                        <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Views</p>
                        <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">{doc.views}</span>
                        <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
                            <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
                            +12%
                        </span>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                        <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Version</p>
                        <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">v2.4</span>
                        <span className="text-xs font-bold text-green-600 mb-1">
                            Neu
                        </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)] transition-colors">
                        <p className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Shares</p>
                        <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">{doc.shares}</span>
                        <span className="text-xs font-bold text-[var(--ak-color-text-muted)] mb-1">Intern</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'ki' && (
          <div className="p-4 flex-1 overflow-y-auto ak-scrollbar">
            <AISuggestionGrid
                context="document"
                summary={doc.name}
                text="Finanzbericht Q4, PDF, Status Final"
            />
          </div>
        )}

        {activeTab === 'verlauf' && (
           <div className="p-6 flex-1 overflow-y-auto ak-scrollbar">
             {/* Placeholder */}
             <div className="text-center text-[var(--ak-color-text-muted)] py-8 text-sm">
                Keine Versionen verfügbar.
             </div>
           </div>
        )}
      </div>
    </AkDrawerScaffold>
  )
}

