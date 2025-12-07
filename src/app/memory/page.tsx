'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import clsx from 'clsx'
import {
  CircleStackIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { ChatWorkspaceShell } from '@/components/ChatWorkspaceShell'
import { MemoryOverviewWidget } from '@/components/MemoryOverviewWidget'

type MemoryTabId = 'memory' | 'crm'

type MemoryTile = {
  id: string
  title: string
  description: string
  badge: string
  icon: ReactNode
}

const MEMORY_TABS: { id: MemoryTabId; label: string }[] = [
  { id: 'memory', label: 'Memory' },
  { id: 'crm', label: 'CRM' },
]

const MEMORY_TILES: MemoryTile[] = [
  {
    id: 'all',
    title: 'Alle Memories',
    description: 'Schneller Überblick über alle gespeicherten Kontexte.',
    badge: 'Memories',
    icon: <CircleStackIcon className="h-4 w-4" />,
  },
  {
    id: 'contacts',
    title: 'Kunden & Kontakte',
    description: 'Zentrale Ansicht für Personen, Firmen und CRM-Felder.',
    badge: 'CRM',
    icon: <UserGroupIcon className="h-4 w-4" />,
  },
  {
    id: 'projects',
    title: 'Projekte & Deals',
    description: 'Pipeline-Sicht auf laufende Projekte und Opportunities.',
    badge: 'Pipeline',
    icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
  },
  {
    id: 'inbox',
    title: 'Posteingang-Memories',
    description: 'Kontext aus E-Mails, DMs und Support-Chats.',
    badge: 'Posteingang',
    icon: <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />,
  },
  {
    id: 'docs',
    title: 'Dokumente & Website',
    description: 'Inhalte aus Docs, Notion, Webseiten und Wissensbasen.',
    badge: 'Dokumente',
    icon: <DocumentTextIcon className="h-4 w-4" />,
  },
  {
    id: 'highlights',
    title: 'Highlights & Snippets',
    description: 'Wichtige Erkenntnisse, Zitate und KI-Zusammenfassungen.',
    badge: 'Highlights',
    icon: <SparklesIcon className="h-4 w-4" />,
  },
]

type CrmEntry = {
  id: string
  name: string
  company: string
  segment: string
  initials: string
  status: string
  lastInteraction: string
}

const CRM_ENTRIES: CrmEntry[] = [
  {
    id: 'c1',
    name: 'Anna König',
    company: 'König Consulting',
    segment: 'B2B · Beratung',
    initials: 'AK',
    status: 'Aktiv',
    lastInteraction: 'Vor 2 Tagen',
  },
  {
    id: 'c2',
    name: 'Max Weber',
    company: 'Weber Studio',
    segment: 'B2C · Creator',
    initials: 'MW',
    status: 'Lead',
    lastInteraction: 'Vor 5 Tagen',
  },
  {
    id: 'c3',
    name: 'Studio Nord',
    company: 'Studio Nord GmbH',
    segment: 'B2B · Agentur',
    initials: 'SN',
    status: 'Onboarding',
    lastInteraction: 'Heute',
  },
]

export default function MemoryPage() {
  const [activeTab, setActiveTab] = useState<MemoryTabId>('memory')

  return (
    <ChatWorkspaceShell>
      <div className="flex h-full min-h-0 flex-col gap-4 px-4 py-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Speicher &amp; CRM
            </h1>
            <p className="text-xs text-slate-500">
              Übersicht über deine gespeicherten Kunden, Notizen und Kontexte.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-[11px] text-slate-400 md:flex">
            <span className="inline-flex h-6 items-center rounded-full border border-slate-200 bg-slate-900 px-2 text-[10px] font-medium uppercase tracking-wide text-slate-50">
              Memory &amp; CRM
            </span>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.1fr),minmax(0,2.9fr)]">
          <section className="flex min-h-0 flex-col gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 text-slate-50 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
                Speicher-Steuerzentrale
              </p>
              <p className="mt-1 text-sm font-semibold">
                Wo deine Langzeit-Memories und dein CRM zusammenlaufen.
              </p>
              <p className="mt-2 text-[11px] text-slate-300">
                Wähle eine Kachel, um später in Detailansichten und Workflows zu springen.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {MEMORY_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  className="group flex w-full flex-col rounded-xl border border-slate-100 bg-white/90 px-3 py-2 text-left text-xs shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/5 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-slate-50 group-hover:bg-[var(--ak-color-accent)]">
                        {tile.icon}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {tile.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                          {tile.description}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {tile.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
              <div className="flex gap-1 rounded-full bg-slate-50 p-0.5 text-[11px]">
                {MEMORY_TABS.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'inline-flex items-center rounded-full px-2.5 py-1 font-medium transition-colors',
                        isActive
                          ? 'bg-slate-900 text-slate-50 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      )}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Demo-Daten · wird später dynamisch
              </p>
            </div>

            <div className="flex-1 min-h-0">
              {activeTab === 'memory' ? (
                <MemoryOverviewWidget />
              ) : (
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        CRM-Liste
                      </p>
                      <p className="text-xs text-slate-600">
                        Übersicht über gespeicherte Kontakte und Kunden.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                      Neu anlegen
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/80">
                      {CRM_ENTRIES.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-slate-50">
                              {entry.initials}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {entry.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {entry.company} · {entry.segment}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              {entry.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {entry.lastInteraction}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ChatWorkspaceShell>
  )
}
