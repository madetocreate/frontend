'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  BoltIcon,
  BookOpenIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

import { QuickTemplates } from '@/components/kmu/QuickTemplates'
import { SimpleAutoReplyRules } from '@/components/kmu/SimpleAutoReplyRules'
import { KnowledgeBase } from '@/components/kmu/KnowledgeBase'
import { WeeklySummary } from '@/components/kmu/WeeklySummary'

// ============================================================================
// Types
// ============================================================================

type TabId = 'templates' | 'auto-reply' | 'kb' | 'weekly-summary'

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
  description: string
  color: string
}

// ============================================================================
// Main Page
// ============================================================================

export default function KMUSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('templates')

  const tabs: Tab[] = [
    {
      id: 'templates',
      label: 'Quick Templates',
      icon: DocumentTextIcon,
      description: 'Antwortvorlagen für häufige Anfragen',
      color: 'ak-text-info ak-badge-info',
    },
    {
      id: 'auto-reply',
      label: 'Auto-Reply Regeln',
      icon: BoltIcon,
      description: 'Automatische Wenn-Dann-Regeln',
      color: 'ak-text-accent-documents ak-badge-info',
    },
    {
      id: 'kb',
      label: 'Knowledge Base',
      icon: BookOpenIcon,
      description: 'Hilfe-Artikel für Kunden',
      color: 'ak-text-success ak-badge-success',
    },
    {
      id: 'weekly-summary',
      label: 'Weekly Summary',
      icon: EnvelopeIcon,
      description: 'Automatische Wochenberichte',
      color: 'ak-text-warning ak-badge-warning',
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'templates':
        return <QuickTemplates />
      case 'auto-reply':
        return <SimpleAutoReplyRules />
      case 'kb':
        return <KnowledgeBase />
      case 'weekly-summary':
        return <WeeklySummary />
      default:
        return null
    }
  }

  return (
    <div className="h-full flex bg-[var(--ak-color-bg-app)]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] flex flex-col">
        <div className="p-4 border-b border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ak-color-bg-surface-muted)]">
              <Cog6ToothIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                KMU Features
              </h1>
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                Einfache Tools für Ihr Geschäft
              </p>
            </div>
          </div>
        </div>

        <nav className="p-2 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all mb-1',
                activeTab === tab.id
                  ? 'bg-[var(--ak-color-bg-surface-muted)]'
                  : 'hover:bg-[var(--ak-color-bg-hover)]'
              )}
            >
              <div className={clsx('p-2 rounded-lg flex-shrink-0', tab.color)}>
                <tab.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className={clsx(
                  'text-sm font-medium truncate',
                  activeTab === tab.id
                    ? 'text-[var(--ak-color-text-primary)]'
                    : 'text-[var(--ak-color-text-secondary)]'
                )}>
                  {tab.label}
                </div>
                <div className="text-[10px] text-[var(--ak-color-text-muted)] truncate">
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Info Box */}
        <div className="mt-auto p-4 border-t border-[var(--ak-color-border-subtle)]">
          <div className="p-3 rounded-xl bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)]">
            <p className="text-[10px] text-[var(--ak-color-text-muted)] leading-relaxed">
              Diese Features sind speziell für kleine und mittlere Unternehmen entwickelt. 
              Einfach zu nutzen, ohne komplexe Konfiguration.
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

