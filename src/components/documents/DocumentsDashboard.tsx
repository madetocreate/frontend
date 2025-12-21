'use client'

import { useState, useCallback, useRef } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
    DocumentIcon, 
    ArrowUpTrayIcon, 
    ListBulletIcon, 
    Squares2X2Icon,
    SparklesIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    FolderIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { DocumentsView } from './DocumentsSidebarWidget'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { motion, AnimatePresence } from 'framer-motion'

import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'

const DOCUMENTS = [
    { id: '1', name: 'Projektplan Q1.pdf', type: 'PDF', size: '2.4 MB', date: 'heute', tag: 'wichtig' },
    { id: '2', name: 'Rechnung_1023.pdf', type: 'PDF', size: '145 KB', date: 'gestern', tag: 'finanzen' },
    { id: '3', name: 'Meeting Notes.docx', type: 'DOCX', size: '12 KB', date: 'vor 3 Tagen', tag: '' },
    { id: '4', name: 'Präsentation.pptx', type: 'PPTX', size: '5.1 MB', date: 'letzte Woche', tag: 'draft' },
    { id: '5', name: 'Vertrag_Entwurf.pdf', type: 'PDF', size: '1.2 MB', date: '01.12.2025', tag: 'legal' },
    { id: '6', name: 'Budget 2026.xlsx', type: 'XLSX', size: '45 KB', date: '01.12.2025', tag: 'finanzen' },
]

export function DocumentsDashboard({ view: _view }: { view: DocumentsView }) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const viewLabel = _view ? ` (${_view})` : ''

  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
        console.log('Files dropped in documents:', files)
        // Handle file upload here
        alert(`${files.length} Dateien zum Hochladen empfangen: ${files.map(f => f.name).join(', ')}`)
    }
  }, [])

  return (
    <div 
        className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)] relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        {/* Drag Overlay */}
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[9999] bg-indigo-600/10 backdrop-blur-sm border-2 border-indigo-600 border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"
                >
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <CloudArrowUpIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Dokumente hier ablegen</h3>
                        <p className="text-sm text-gray-500">Zum Upload hinzufügen</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                Smart Documents{viewLabel}
            </h1>
            <div className="flex items-center gap-3">
                <div className="w-64">
                    <AkSearchField 
                        placeholder="Inhalte suchen..." 
                        value={search}
                        onChange={setSearch}
                    />
                </div>
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
        
        <main className="max-w-7xl mx-auto p-6 space-y-8">

             {/* AI Suggestions - Only in All View */}
             {_view === 'all' && (
                <AISuggestionGrid 
                    context="document"
                    summary="Dokumenten-Management"
                    text="Intelligente Analyse deiner Verträge und Rechnungen."
                />
             )}

             {/* AI Insights & Smart Folders */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AI Insight */}
                <div className="md:col-span-2 p-6 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-[var(--ak-color-bg-surface)] to-indigo-50/50">
                    <h2 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
                        AI Analyse
                    </h2>
                    <div className="space-y-3">
                         <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-[var(--ak-color-border-subtle)] hover:bg-white transition-colors cursor-pointer">
                             <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                                 <ClockIcon className="w-5 h-5" />
                             </div>
                             <div>
                                 <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)]">Vertrag läuft ab</h3>
                                 <p className="text-xs text-[var(--ak-color-text-secondary)]">Der &quot;Mietvertrag Büro&quot; läuft in 30 Tagen aus. Erinnerung setzen?</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-[var(--ak-color-border-subtle)] hover:bg-white transition-colors cursor-pointer">
                             <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                 <MagnifyingGlassIcon className="w-5 h-5" />
                             </div>
                             <div>
                                 <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)]">Rechnung erkannt</h3>
                                 <p className="text-xs text-[var(--ak-color-text-secondary)]">&quot;Rechnung_1023.pdf&quot; wurde automatisch kategorisiert. Betrag: 1.200€</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Smart Folders */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-4">Smart Folders</h2>
                    <div className="p-4 apple-glass-enhanced rounded-xl border border-[var(--ak-color-border-subtle)] flex items-center gap-3 cursor-pointer hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                        <FolderIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">Rechnungen 2024</span>
                        <span className="ml-auto text-xs text-[var(--ak-color-text-muted)]">12</span>
                    </div>
                    <div className="p-4 apple-glass-enhanced rounded-xl border border-[var(--ak-color-border-subtle)] flex items-center gap-3 cursor-pointer hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                        <FolderIcon className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">Verträge (Aktiv)</span>
                        <span className="ml-auto text-xs text-[var(--ak-color-text-muted)]">5</span>
                    </div>
                    <div className="p-4 apple-glass-enhanced rounded-xl border border-[var(--ak-color-border-subtle)] flex items-center gap-3 cursor-pointer hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                        <FolderIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">Angebote</span>
                        <span className="ml-auto text-xs text-[var(--ak-color-text-muted)]">8</span>
                    </div>
                </div>
             </div>

            {/* Document List/Grid */}
            <div>
                <h2 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-4">Zuletzt bearbeitet</h2>
                {layout === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {DOCUMENTS.map((doc) => (
                            <div key={doc.id} className="group relative flex flex-col items-center p-4 rounded-2xl apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all cursor-pointer border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
                                <div className="h-14 w-14 mb-3 flex items-center justify-center rounded-xl bg-[var(--ak-color-bg-surface-muted)] text-gray-400 group-hover:text-[var(--ak-color-accent)] group-hover:bg-indigo-50 transition-colors">
                                    <DocumentIcon className="h-7 w-7" />
                                </div>
                                <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] text-center truncate w-full">{doc.name}</h3>
                                <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1">{doc.size} • {doc.date}</p>
                                {doc.tag && (
                                    <span className="absolute top-2 right-2">
                                        <AkBadge tone={doc.tag === 'wichtig' ? 'danger' : 'muted'} size="sm">{doc.tag}</AkBadge>
                                    </span>
                                )}
                            </div>
                        ))}
                        {/* Upload Placeholder */}
                        <div className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] transition-all cursor-pointer bg-transparent opacity-60 hover:opacity-100">
                             <ArrowUpTrayIcon className="h-8 w-8 text-[var(--ak-color-text-muted)] mb-2 group-hover:text-[var(--ak-color-accent)] transition-colors" />
                             <span className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Drop file here</span>
                        </div>
                    </div>
                ) : (
                    <WidgetCard padding="none" className="apple-glass-enhanced">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--ak-color-bg-surface-muted)] border-b border-[var(--ak-color-border-subtle)]">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Name</th>
                                    <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Typ</th>
                                    <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Größe</th>
                                    <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Datum</th>
                                    <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Tag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--ak-color-border-hairline)]">
                                {DOCUMENTS.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-[var(--ak-color-bg-hover)] cursor-pointer">
                                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                                            <div className="p-1.5 rounded bg-[var(--ak-color-bg-surface-muted)]">
                                                <DocumentIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                            {doc.name}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--ak-color-text-secondary)]">{doc.type}</td>
                                        <td className="px-6 py-4 text-[var(--ak-color-text-secondary)]">{doc.size}</td>
                                        <td className="px-6 py-4 text-[var(--ak-color-text-secondary)]">{doc.date}</td>
                                        <td className="px-6 py-4">
                                            {doc.tag && <AkBadge tone={doc.tag === 'wichtig' ? 'danger' : 'muted'}>{doc.tag}</AkBadge>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </WidgetCard>
                )}
            </div>
        </main>
    </div>
  )
}
