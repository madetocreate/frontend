'use client'

import type { ReactNode, ComponentType, CSSProperties } from 'react'
import { useState } from 'react'
import clsx from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  InboxIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { InboxDrawerWidget } from '@/components/InboxDrawerWidget'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { InboxDetailPanel } from '@/components/InboxDetailPanel'


type WorkspaceModuleToken =
  | 'chat'
  | 'inbox'
  | 'marketing'
  | 'calendar'
  | 'automation'

type ModuleConfig = {
  id: WorkspaceModuleToken
  label: string
  icon: ComponentType<{ className?: string }>
}

const MODULES: ModuleConfig[] = [
  { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { id: 'inbox', label: 'Posteingang', icon: InboxIcon },
  { id: 'marketing', label: 'Marketing', icon: MegaphoneIcon },
  { id: 'calendar', label: 'Kalender', icon: CalendarDaysIcon },
  { id: 'automation', label: 'Automatisierung', icon: Cog6ToothIcon },
]

const LEFT_DRAWER_WIDTH = 420

function getModuleLabel(token: WorkspaceModuleToken): string {
  const match = MODULES.find((m) => m.id === token)
  return match?.label ?? token
}

type ChatWorkspaceShellProps = {
  children: ReactNode
}

export function ChatWorkspaceShell({ children }: ChatWorkspaceShellProps) {
  const [activeModuleToken, setActiveModuleToken] =
    useState<WorkspaceModuleToken>('chat')
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null)

  const handleModuleClick = (token: WorkspaceModuleToken) => {
    if (token === 'chat') {
      setActiveModuleToken('chat')
      setLeftDrawerOpen(false)
      setRightDrawerOpen(false)
      return
    }

    setActiveModuleToken(token)

    setLeftDrawerOpen((prev) => {
      if (prev && activeModuleToken === token) {
        return false
      }
      return true
    })
  }

  const handleOpenDetails = () => {
    setRightDrawerOpen(true)
  }

  const handleInboxItemClick = (item: InboxItem) => {
    setSelectedInboxItem(item)
    handleOpenDetails()
  }

  const handleCloseDetails = () => {
    setRightDrawerOpen(false)
  }

  const showLeft = activeModuleToken !== 'chat' && leftDrawerOpen

  const chatStyle: CSSProperties = showLeft
    ? { marginLeft: LEFT_DRAWER_WIDTH }
    : { marginLeft: 0 }

  const leftDrawerStyle: CSSProperties = {
    width: LEFT_DRAWER_WIDTH,
  }

  const rightContainerStyle: CSSProperties = {
    left: showLeft ? LEFT_DRAWER_WIDTH : 0,
  }

  return (
    <div className="flex h-screen bg-white text-slate-900">
      <aside className="flex w-16 flex-col items-center gap-y-3 bg-white/60 py-4 text-slate-700 shadow-sm backdrop-blur-xl border-r border-white/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ak-color-accent)] text-xs font-semibold text-white">
          AK
        </div>
        <nav className="mt-4 flex flex-1 flex-col items-center gap-y-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            const isActive =
              (mod.id === activeModuleToken && leftDrawerOpen) ||
              (mod.id === 'chat' &&
                activeModuleToken === 'chat' &&
                !leftDrawerOpen &&
                !rightDrawerOpen)

            return (
              <div key={mod.id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleModuleClick(mod.id)}
                  className={clsx(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors',
                    isActive
                      ? 'bg-[var(--ak-color-accent)] text-white'
                      : 'bg-transparent hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <span className="sr-only">{mod.label}</span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-14 top-1/2 z-50 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-full bg-[var(--ak-color-accent)] px-3 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                  {mod.label}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="relative flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end bg-white/50 px-4 backdrop-blur-xl border-b border-white/40">
          <button
            type="button"
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-slate-600 ring-1 ring-white/60 shadow-sm hover:bg-white/70 hover:text-slate-900 transition-colors"
            aria-label="Benachrichtigungen"
          >
            <BellIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ak-color-accent)] text-xs font-semibold text-white"
          >
            N
          </button>
        </header>

        <main className="relative flex-1 overflow-hidden">
          <div
            className="h-full min-h-0 transition-[margin] duration-200 ease-out"
            style={chatStyle}
          >
            {children}
          </div>

          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 left-0 flex',
              showLeft ? 'z-30' : 'z-20'
            )}
          >
            <div
              className={clsx(
                'pointer-events-auto flex h-full flex-col bg-[var(--ak-color-bg-surface)] shadow-xl transition-transform duration-200 ease-out',
                showLeft ? 'translate-x-0' : '-translate-x-full'
              )}
              style={leftDrawerStyle}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <div className="truncate text-sm font-medium text-slate-900">
                  {getModuleLabel(activeModuleToken)}
                </div>
                <button
                  type="button"
                  onClick={() => setLeftDrawerOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="sr-only">Panel einklappen</span>
                  <span aria-hidden="true" className="text-xs">
                    ‹
                  </span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 text-sm text-slate-600">
                {activeModuleToken === 'inbox' ? (
                  <InboxDrawerWidget onItemClick={handleInboxItemClick} />
                ) : (
                  <>
                    <p className="text-slate-500">
                      Hier kommen später die Widgets für{' '}
                      <span className="font-medium text-slate-900">
                        {getModuleLabel(activeModuleToken)}
                      </span>{' '}
                      hin.
                    </p>
                    <p className="mt-2">
                      Zum Beispiel Karten, Listen, Formulare oder Kalender, die mit
                      deinem Orchestrator synchronisiert sind.
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleOpenDetails}
                        className="inline-flex items-center gap-x-2 rounded-md bg-[var(--ak-color-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        <span>Beispiel-Detailpanel öffnen</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 right-0 flex',
              rightDrawerOpen ? 'z-40' : 'z-30'
            )}
            style={rightContainerStyle}
          >
            <div
              className={clsx(
                'pointer-events-auto flex h-full w-full flex-col bg-[var(--ak-color-bg-surface)] shadow-2xl transition-transform duration-200 ease-out',
                rightDrawerOpen ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="sr-only">Detailpanel einklappen</span>
                  <span aria-hidden="true" className="text-xs">
                    ›
                  </span>
                </button>
                <div className="truncate text-sm font-medium text-slate-900">
                  {selectedInboxItem?.title ?? 'Details'}
                </div>
                <div className="w-7" />
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 text-sm text-slate-600">
                <InboxDetailPanel item={selectedInboxItem} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
