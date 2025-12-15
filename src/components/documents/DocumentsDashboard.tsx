'use client'

import { useState } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
    DocumentIcon, 
    ArrowUpTrayIcon, 
    ListBulletIcon, 
    Squares2X2Icon 
} from '@heroicons/react/24/outline'
import { DocumentsView } from './DocumentsSidebarWidget'

const DOCUMENTS = [
    { id: '1', name: 'Projektplan Q1.pdf', type: 'PDF', size: '2.4 MB', date: 'heute', tag: 'wichtig' },
    { id: '2', name: 'Rechnung_1023.pdf', type: 'PDF', size: '145 KB', date: 'gestern', tag: 'finanzen' },
    { id: '3', name: 'Meeting Notes.docx', type: 'DOCX', size: '12 KB', date: 'vor 3 Tagen', tag: '' },
    { id: '4', name: 'Präsentation.pptx', type: 'PPTX', size: '5.1 MB', date: 'letzte Woche', tag: 'draft' },
    { id: '5', name: 'Vertrag_Entwurf.pdf', type: 'PDF', size: '1.2 MB', date: '01.12.2025', tag: 'legal' },
    { id: '6', name: 'Budget 2026.xlsx', type: 'XLSX', size: '45 KB', date: '01.12.2025', tag: 'finanzen' },
]

export function DocumentsDashboard({ view }: { view: DocumentsView }) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                {view === 'all' && 'Alle Dokumente'}
                {view === 'uploads' && 'Hochgeladen'}
                {view === 'invoices' && 'Rechnungen'}
                {view === 'contracts' && 'Verträge'}
                {view === 'shared' && 'Geteilt'}
            </h1>
            <div className="flex items-center gap-2">
                <div className="flex bg-[var(--ak-color-bg-surface)] rounded-lg p-0.5 border border-[var(--ak-color-border-subtle)]">
                    <button 
                        onClick={() => setLayout('grid')}
                        className={`p-1.5 rounded-md transition-colors ${layout === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Squares2X2Icon className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setLayout('list')}
                        className={`p-1.5 rounded-md transition-colors ${layout === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ListBulletIcon className="h-4 w-4" />
                    </button>
                </div>
                <AkButton variant="primary" leftIcon={<ArrowUpTrayIcon className="h-4 w-4"/>}>Hochladen</AkButton>
            </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
            {layout === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {DOCUMENTS.map((doc) => (
                        <div key={doc.id} className="group relative flex flex-col items-center p-4 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] hover:shadow-md transition-all cursor-pointer">
                            <div className="h-16 w-16 mb-3 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:text-[var(--ak-color-accent)] group-hover:bg-indigo-50 transition-colors">
                                <DocumentIcon className="h-8 w-8" />
                            </div>
                            <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] text-center truncate w-full">{doc.name}</h3>
                            <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1">{doc.size} • {doc.date}</p>
                            {doc.tag && (
                                <span className="absolute top-2 right-2">
                                    <AkBadge tone="neutral" size="sm">{doc.tag}</AkBadge>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <WidgetCard padding="none">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--ak-color-bg-sidebar)] border-b border-[var(--ak-color-border-subtle)]">
                            <tr>
                                <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Name</th>
                                <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Typ</th>
                                <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Größe</th>
                                <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Datum</th>
                                <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Tag</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ak-color-border-hairline)]">
                            {DOCUMENTS.map((doc) => (
                                <tr key={doc.id} className="hover:bg-[var(--ak-color-bg-hover)] cursor-pointer">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <DocumentIcon className="h-4 w-4 text-gray-400" />
                                        {doc.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{doc.type}</td>
                                    <td className="px-4 py-3 text-gray-500">{doc.size}</td>
                                    <td className="px-4 py-3 text-gray-500">{doc.date}</td>
                                    <td className="px-4 py-3">
                                        {doc.tag && <AkBadge tone="neutral">{doc.tag}</AkBadge>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </WidgetCard>
            )}
        </main>
    </div>
  )
}
