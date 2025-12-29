'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { 
  DashboardStatsSkeleton, 
  TableSkeleton, 
  ListSkeleton,
  PageTransition,
  EmptyState,
  CompactEmptyState,
  HoverLift,
  RippleButton,
  MagneticButton,
  Pulse,
  CopyFeedback,
  DarkModeToggle,
  DarkModeSwitch,
  Breadcrumbs,
  ReorderableList,
  DropZone,
  SortableGrid
} from '@/components/ui'
import { 
  PhoneIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  StarIcon 
} from '@heroicons/react/24/outline'

export default function DemoUIPage() {
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reorderItems, setReorderItems] = useState<Array<{ id: string; content: ReactNode }>>([
    { id: '1', content: <div>Item 1 - Ziehe mich!</div> },
    { id: '2', content: <div>Item 2 - Ziehe mich!</div> },
    { id: '3', content: <div>Item 3 - Ziehe mich!</div> },
  ])
  const [gridItems, setGridItems] = useState([
    { id: '1', content: 'Task 1', column: 'Todo' },
    { id: '2', content: 'Task 2', column: 'Todo' },
    { id: '3', content: 'Task 3', column: 'In Progress' },
    { id: '4', content: 'Task 4', column: 'Done' },
  ])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', icon: <StarIcon className="h-4 w-4" /> },
    { label: 'Telephony', href: '/dashboard/telephony', icon: <PhoneIcon className="h-4 w-4" /> },
    { label: 'Calls', href: '/dashboard/telephony/calls' },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText('Kopiert!')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎨 Advanced UI Components Demo
            </h1>
            <p className="text-lg ak-text-secondary">
              Alle neuen stylischen Features auf einen Blick
            </p>
            <div className="flex justify-center gap-4">
              <DarkModeToggle />
              <DarkModeSwitch />
            </div>
          </div>

          {/* Breadcrumbs Demo */}
          <section className="ak-bg-surface-1 rounded-3xl p-8 shadow-xl ak-border-default">
            <h2 className="text-2xl font-bold mb-6 text-[var(--ak-color-text-primary)]">
              📍 Breadcrumb Navigation
            </h2>
            <Breadcrumbs items={breadcrumbs} />
          </section>

          {/* Skeleton Screens Demo */}
          <section className="ak-bg-surface-1 rounded-3xl p-8 shadow-xl ak-border-default">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
                💀 Skeleton Screens mit Shimmer
              </h2>
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] font-semibold"
                style={{ color: 'var(--ak-text-primary-dark)' }}
              >
                {showSkeleton ? 'Daten laden' : 'Loading zeigen'}
              </button>
            </div>
            {showSkeleton ? (
              <>
                <DashboardStatsSkeleton />
                <div className="mt-6">
                  <TableSkeleton rows={3} />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-6 rounded-xl ak-bg-surface-2">
                    <div className="text-3xl font-bold text-[var(--ak-color-text-primary)]">
                      {Math.floor(Math.random() * 1000)}
                    </div>
                    <div className="text-sm text-[var(--ak-color-text-secondary)]">
                      Metric {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Micro-Interactions Demo */}
          <section className="ak-bg-surface-1 rounded-3xl p-8 shadow-xl ak-border-default">
            <h2 className="text-2xl font-bold mb-6 text-[var(--ak-color-text-primary)]">
              ✨ Micro-Interactions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <HoverLift>
                <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] text-center font-semibold" style={{ color: 'var(--ak-text-primary-dark)' }}>
                  Hover Lift
                </div>
              </HoverLift>
              
              <RippleButton className="p-6 rounded-xl bg-gradient-to-br from-[var(--ak-semantic-success)] to-[var(--ak-semantic-info)] text-center font-semibold" style={{ color: 'var(--ak-text-primary-dark)' }}>
                Ripple Effect
              </RippleButton>

              <MagneticButton className="p-6 rounded-xl bg-gradient-to-br from-[var(--ak-accent-customers)] to-[var(--ak-accent-reviews)] text-center font-semibold" style={{ color: 'var(--ak-text-primary-dark)' }}>
                Magnetic Button
              </MagneticButton>

              <Pulse>
                <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--ak-semantic-warning)] to-[var(--ak-semantic-danger)] text-center font-semibold" style={{ color: 'var(--ak-text-primary-dark)' }}>
                  Pulse Animation
                </div>
              </Pulse>
            </div>

            <div className="mt-6">
              <CopyFeedback copied={copied}>
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 rounded-xl ak-bg-surface-2 font-semibold hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                >
                  📋 Klick zum Kopieren
                </button>
              </CopyFeedback>
            </div>
          </section>

          {/* Empty States Demo */}
          <section className="ak-bg-surface-1 rounded-3xl p-8 shadow-xl ak-border-default">
            <h2 className="text-2xl font-bold mb-6 text-[var(--ak-color-text-primary)]">
              📭 Interactive Empty States
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                type="calls"
                title="Keine Anrufe"
                description="Du hast heute noch keine Anrufe erhalten. Sobald ein Anruf eingeht, erscheint er hier."
                action={{ label: 'Test-Anruf starten', onClick: () => alert('Test!') }}
              />
              
              <CompactEmptyState
                icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
                message="Keine Nachrichten vorhanden"
                action={{ label: 'Neue Nachricht', onClick: () => alert('Neu!') }}
              />
            </div>
          </section>

          {/* Drag & Drop Demo */}
          <section className="ak-bg-surface-1 rounded-3xl p-8 shadow-xl ak-border-default">
            <h2 className="text-2xl font-bold mb-6 text-[var(--ak-color-text-primary)]">
              🎯 Drag & Drop System
            </h2>
            
            <div className="space-y-8">
              {/* Reorderable List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Reorderable List</h3>
                <ReorderableList
                  items={reorderItems}
                  onReorder={(items) => setReorderItems(items)}
                />
              </div>

              {/* File Drop Zone */}
              <div>
                <h3 className="text-lg font-semibold mb-4">File Drop Zone</h3>
                <DropZone
                  onDrop={(files) => {
                    alert(`${files.length} Datei(en) hochgeladen!`)
                  }}
                  accept="image/*"
                />
              </div>

              {/* Kanban Board */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Kanban Board</h3>
                <SortableGrid
                  items={gridItems}
                  columns={['Todo', 'In Progress', 'Done']}
                  onItemMove={(itemId, newColumn) => {
                    setGridItems(items =>
                      items.map(item =>
                        item.id === itemId ? { ...item, column: newColumn } : item
                      )
                    )
                  }}
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-sm ak-text-muted py-8">
            <p>🎨 Alle Features sind jetzt in deinem Frontend verfügbar!</p>
            <p className="mt-2">Nutze sie in deinen Components mit: <code className="px-2 py-1 rounded ak-bg-surface-2 font-mono">import &#123; ... &#125; from '@/components/ui'</code></p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

