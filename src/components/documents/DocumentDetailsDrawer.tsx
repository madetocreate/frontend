'use client'

import React, { useState } from 'react'
import { 
  DocumentIcon, 
  InformationCircleIcon, 
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { 
  DrawerCard
} from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'

type DocumentDetailsDrawerProps = {
  documentId: string | null
  selectedCount: number
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

export function DocumentDetailsDrawer({ documentId, selectedCount: _selectedCount, onClose, onExpand, isExpanded, onAction: _onAction }: DocumentDetailsDrawerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata' | 'chat'>('preview')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAiMenu, _setShowAiMenu] = useState(false)

  // Empty State / List View
  if (!documentId) {
    return (
      <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
        {/* Compact Header */}
        <div className="relative px-4 py-3 bg-[var(--ak-color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    <DocumentIcon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] uppercase tracking-wider leading-none">
                          Dokumente Übersicht
                      </h1>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <p className="text-[10px] text-[var(--ak-color-text-muted)] font-medium mt-0.5">
                        Wissen & Verwaltung
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <AkBadge tone="neutral" size="xs">124 Dateien</AkBadge>
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

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto ak-scrollbar p-2">
           <div className="space-y-0.5">
             <div className="px-4 py-2 text-xs font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
               Zuletzt bearbeitet
             </div>
             {/* Mock List Items */}
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

        {/* AI Suggestions for List View */}
        <div className="p-4 border-t border-[var(--ak-color-border-subtle)]">
            <AISuggestionGrid
              context="document"
              summary="Dokumenten-Übersicht"
              text="Verwaltung aller Dokumente und Dateien."
            />
        </div>
      </div>
    )
  }

  // Mock Document Data
  const doc = {
    id: documentId,
    name: 'Q4 Financial Report 2024.pdf',
    type: 'PDF Document',
    size: '2.4 MB',
    uploaded: 'Gestern, 14:30',
    status: 'Final',
    views: 24,
    shares: 3
  }

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
      {/* 1. Compact Header */}
      <div className="relative px-4 py-3 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-[var(--ak-color-bg-app)]">
                    <DocumentIcon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-sm font-bold text-[var(--ak-color-text-primary)] tracking-tight leading-none truncate max-w-[200px]">
                          {doc.name}
                      </h1>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--ak-color-text-secondary)] font-medium mt-0.5">
                        <span>{doc.type}</span>
                        <span className="text-[var(--ak-color-border-strong)]">•</span>
                        <span>{doc.size}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <AkBadge tone="success" size="xs">{doc.status}</AkBadge>
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
          {(['preview', 'metadata', 'chat'] as const).map((tab) => (
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
              {tab === 'preview' && 'Vorschau'}
              {tab === 'metadata' && 'Metadaten'}
              {tab === 'chat' && 'Q&A Chat'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar p-6 space-y-6">
        
        {/* 3. Tab Content (Zuerst!) */}
        {activeTab === 'preview' && (
            <div className="space-y-4">
                <DrawerCard title="Vorschau">
                    <div className="aspect-[3/4] w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                        [PDF Vorschau wird geladen...]
                    </div>
                </DrawerCard>
            </div>
        )}


        {/* 5. Micro-Charts Grid */}
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
              <span className="text-xs font-bold text-gray-400 mb-1">Intern</span>
            </div>
          </div>
        </div>

        <AISuggestionGrid
          context="document"
          summary={doc.name}
          text="Finanzbericht Q4, PDF, Status Final"
        />

      </div>
    </div>
  )
}
