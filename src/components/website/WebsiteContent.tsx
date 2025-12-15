'use client'

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
  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Wissen & Inhalt</h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Trainiere deinen Assistenten mit Dokumenten und Links.
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

      <div className="shrink-0">
        <AkSearchField placeholder="Wissen durchsuchen..." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        <WidgetCard padding="none" className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <div className="overflow-y-auto flex-1">
            {MOCK_DOCS.map((doc) => (
              <AkListRow
                key={doc.id}
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
                className="border-b border-[var(--ak-color-border-hairline)] last:border-0"
              />
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Status" className="h-fit">
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--ak-color-text-secondary)]">Vektorisierung</span>
                <span className="text-[var(--ak-color-text-primary)]">98%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--ak-color-bg-sidebar)] overflow-hidden">
                <div className="h-full bg-green-500 w-[98%]" />
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-[var(--ak-color-bg-sidebar)] text-sm">
              <p className="font-medium text-[var(--ak-color-text-primary)]">Automatischer Crawl</p>
              <p className="text-[var(--ak-color-text-secondary)] text-xs mt-1">
                Nächster Crawl: Morgen, 03:00 Uhr
              </p>
            </div>
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}
