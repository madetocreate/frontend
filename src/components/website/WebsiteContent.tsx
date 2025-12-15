'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { AkListRow } from '@/components/ui/AkListRow'
import { DocumentIcon, ArrowUpTrayIcon, LinkIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const MOCK_DOCS = [
  { id: '1', title: 'Speisekarte_Winter_2024.pdf', type: 'file', status: 'indexed', date: '12.12.2024' },
  { id: '2', title: 'https://restaurant-name.de/faq', type: 'link', status: 'indexed', date: '10.12.2024' },
  { id: '3', title: 'Öffnungszeiten & Anfahrt', type: 'text', status: 'indexed', date: '01.12.2024' },
  { id: '4', title: 'Allergene Informationen', type: 'text', status: 'processing', date: 'Heute' },
]

export function WebsiteContent() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDocs = MOCK_DOCS.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--ak-color-bg-app)]">
      {/* Header - Apple Style */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Wissen & Inhalt</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Trainiere deinen Assistenten mit Dokumenten und Links
            </p>
          </div>
          <div className="flex gap-2">
            <AkButton variant="secondary" leftIcon={<LinkIcon className="h-4 w-4" />}>
              Link hinzufügen
            </AkButton>
            <AkButton variant="primary" leftIcon={<ArrowUpTrayIcon className="h-4 w-4" />}>
              Datei hochladen
            </AkButton>
          </div>
        </div>
        <AkSearchField 
          placeholder="Wissen durchsuchen..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <WidgetCard padding="sm" className="lg:col-span-2 flex flex-col h-full overflow-hidden apple-glass-enhanced">
            <div className="overflow-y-auto flex-1">
              {filteredDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <AkListRow
                    leading={<DocumentIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />}
                    title={doc.title}
                    subtitle={`Hinzugefügt am ${doc.date}`}
                    trailing={
                      doc.status === 'indexed' ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircleIcon className="h-4 w-4" /> Indiziert
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-orange-500">
                          <ArrowPathIcon className="h-4 w-4 animate-spin" /> Verarbeite
                        </span>
                      )
                    }
                    className="border-b border-[var(--ak-color-border-hairline)] last:border-0 hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                  />
                </motion.div>
              ))}
            </div>
          </WidgetCard>

          <WidgetCard title="Status" className="h-fit apple-glass-enhanced">
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--ak-color-text-secondary)]">Vektorisierung</span>
                  <span className="text-[var(--ak-color-text-primary)] font-medium">98%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--ak-color-bg-sidebar)] overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-[var(--ak-color-bg-surface-muted)] text-sm">
                <p className="font-medium text-[var(--ak-color-text-primary)]">Automatischer Crawl</p>
                <p className="text-[var(--ak-color-text-secondary)] text-xs mt-1">
                  Nächster Crawl: Morgen, 03:00 Uhr
                </p>
              </div>
            </div>
          </WidgetCard>
        </div>
      </div>
    </div>
  )
}
