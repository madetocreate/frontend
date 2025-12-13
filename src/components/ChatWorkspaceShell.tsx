'use client'

import type { ReactNode, ComponentType, CSSProperties } from 'react'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  InboxIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent'
import { InboxDrawerWidget } from '@/components/InboxDrawerWidget'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { InboxDetailPanel } from '@/components/InboxDetailPanel'
import { NotificationsDetailPanel } from '@/components/NotificationsDetailPanel'
import type { ProfileUserState } from '@/components/ProfileMenu'
import { SettingsSidebarWidget } from '@/components/SettingsSidebarWidget'
import { SettingsDetailPanel, type SettingsCategory } from '@/components/SettingsDetailPanel'
import { MemorySidebarWidget, type MemoryCategory } from '@/components/MemorySidebarWidget'
import { MemoryDetailPanel } from '@/components/MemoryDetailPanel'
import { AutomationQuickActionsWidget } from '@/components/AutomationQuickActionsWidget'
import { AutomationDetailPanel } from '@/components/AutomationDetailPanel'



type WorkspaceModuleToken =
  | 'chat'
  | 'inbox'
  | 'automation'
  | 'settings'

type ModuleConfig = {
  id: WorkspaceModuleToken
  label: string
  icon: ComponentType<{ className?: string }>
  href?: string
}

const MODULES: ModuleConfig[] = [
  { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon, href: '/' },
  { id: 'inbox', label: 'Posteingang', icon: InboxIcon },
  { id: 'automation', label: 'Modules', icon: Squares2X2Icon },
]

const LEFT_DRAWER_WIDTH = 336 // 20% kleiner als 420

function getModuleLabel(token: WorkspaceModuleToken): string {
  const match = MODULES.find((m) => m.id === token)
  if (match) return match.label

  if (token === 'settings') return 'Einstellungen'
  return token
}

type ChatWorkspaceShellProps = {
  children: ReactNode
}

export function ChatWorkspaceShell({ children }: ChatWorkspaceShellProps) {
  const initialModule: WorkspaceModuleToken = 'chat'

  const [activeModuleToken, setActiveModuleToken] =
    useState<WorkspaceModuleToken>(initialModule)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null)
  const [selectedSettingsCategory, setSelectedSettingsCategory] = useState<SettingsCategory | null>(null)
  const [selectedAutomationItem, setSelectedAutomationItem] = useState<string | null>(null)
  const [selectedMemoryCategory, setSelectedMemoryCategory] = useState<MemoryCategory | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  const profileUser: ProfileUserState = {
    isAuthenticated: false,
    displayName: null,
    email: null,
    avatarUrl: null,
    plan: null,
    initials: 'AK',
  }

  const handleModuleClick = (token: WorkspaceModuleToken) => {
    setActiveModuleToken(token)
    setShowNotifications(false) // Reset notifications when switching modules

    setLeftDrawerOpen((prev) => {
      if (prev && activeModuleToken === token) {
        return false
      }
      return true
    })

    // Rechten Drawer schließen beim Modulwechsel
    setRightDrawerOpen(false)

    setSelectedInboxItem(null)
    setSelectedSettingsCategory(null)
    setSelectedAutomationItem(null)
    setSelectedMemoryCategory(null)
  }


  // Event-Listener für Modul-Öffnung von außen (z.B. Bell-Icon)
  useEffect(() => {
    const handleOpenModule = (e: CustomEvent<{ module: WorkspaceModuleToken }>) => {
      if (e.detail?.module) {
        if (e.detail.module === 'inbox') {
          // Wenn Inbox über Bell geöffnet wird, toggle Benachrichtigungen
          setShowNotifications((prev) => {
            if (prev) {
              // Schließen: Alles zurücksetzen
              setRightDrawerOpen(false)
              setLeftDrawerOpen(false)
              return false
            } else {
              // Öffnen: Vollbild rechts, keine Sidebar
              setRightDrawerOpen(true)
              setLeftDrawerOpen(false)
              setActiveModuleToken('inbox')
              return true
            }
          })
        } else {
          handleModuleClick(e.detail.module)
        }
      }
    }

    window.addEventListener('aklow-open-module', handleOpenModule as EventListener)

    return () => {
      window.removeEventListener('aklow-open-module', handleOpenModule as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenDetails = () => {
    setRightDrawerOpen(true)
  }

  const handleInboxItemClick = (item: InboxItem) => {
    // Wenn dasselbe Item nochmal geklickt wird, schließe den Drawer
    if (selectedInboxItem?.id === item.id && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedInboxItem(null)
      return
    }
    
    setSelectedInboxItem(item)
    setSelectedSettingsCategory(null)
    setSelectedAutomationItem(null)
    setSelectedMemoryCategory(null)
    handleOpenDetails()
  }

  const handleAutomationItemClick = (workflowId: string) => {
    if (selectedAutomationItem === workflowId && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedAutomationItem(null)
    } else {
      setSelectedAutomationItem(workflowId)
      setSelectedInboxItem(null)
      setSelectedSettingsCategory(null)
      setSelectedMemoryCategory(null)
      handleOpenDetails()
    }
  }

  const handleMemoryCategoryClick = (category: MemoryCategory) => {
    if (selectedMemoryCategory?.id === category.id && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedMemoryCategory(null)
    } else {
      setSelectedMemoryCategory(category)
      setSelectedInboxItem(null)
      setSelectedAutomationItem(null)
      // Wenn wir in Settings sind und memory_crm ausgewählt ist, behalten wir das bei
      if (activeModuleToken === 'settings' && selectedSettingsCategory === 'memory_crm') {
        // Settings-Kategorie bleibt memory_crm
      } else {
        // Sonst setzen wir Settings-Kategorie auf memory_crm und öffnen Settings
        setSelectedSettingsCategory('memory_crm')
        setActiveModuleToken('settings')
        setLeftDrawerOpen(true)
      }
      handleOpenDetails()
    }
  }

  const handleSettingsCategorySelect = (category: SettingsCategory | null) => {
    if (selectedSettingsCategory === category && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedSettingsCategory(null)
      setSelectedMemoryCategory(null)
    } else {
      setSelectedSettingsCategory(category)
      setSelectedInboxItem(null)
      setSelectedAutomationItem(null)
      // Wenn memory_crm ausgewählt wird, Memory-Category zurücksetzen
      if (category !== 'memory_crm') {
        setSelectedMemoryCategory(null)
      }
      if (category === 'memory_crm') {
        // Für memory_crm öffnen wir den rechten Drawer nur wenn eine Memory-Category ausgewählt ist
        // Der linke Drawer zeigt bereits MemorySidebarWidget
        if (!selectedMemoryCategory) {
          setRightDrawerOpen(false)
        }
      } else if (category) {
        handleOpenDetails()
      } else {
        setRightDrawerOpen(false)
      }
    }
  }

  const handleCloseDetails = () => {
    setRightDrawerOpen(false)
    setShowNotifications(false)
    setSelectedInboxItem(null)
    setSelectedSettingsCategory(null)
    setSelectedAutomationItem(null)
    setSelectedMemoryCategory(null)
  }

  const showLeft = leftDrawerOpen && !showNotifications // Keine Sidebar wenn Benachrichtigungen im Vollbild
  const showRight =
    rightDrawerOpen &&
    (showNotifications ||
      selectedInboxItem !== null ||
      selectedSettingsCategory !== null ||
      selectedAutomationItem !== null ||
      selectedMemoryCategory !== null)

  const chatStyle: CSSProperties = showLeft && !showNotifications
    ? { marginLeft: LEFT_DRAWER_WIDTH }
    : { marginLeft: 0 }

  const leftDrawerStyle: CSSProperties = {
    width: LEFT_DRAWER_WIDTH,
  }

  const rightContainerStyle: CSSProperties = {
    left: showNotifications ? 0 : (showLeft ? LEFT_DRAWER_WIDTH : 0), // Vollbild links bei Benachrichtigungen
  }

  return (
    <div className="flex h-screen bg-[var(--ak-color-bg-app)] text-[var(--ak-color-text-primary)]">
      <aside className="ak-glass flex w-16 flex-col items-center gap-y-4 py-3 text-[var(--ak-color-text-secondary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]">
        <nav className="mt-1 flex flex-1 flex-col items-center gap-y-4">
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
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                    e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                  }}
                  className={clsx(
                    'ak-sidebar-button flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent text-[var(--ak-color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ak-button-interactive',
                    isActive
                      ? 'bg-[var(--ak-color-bg-selected)] text-[var(--ak-color-text-primary)] shadow-sm border-[var(--ak-color-border-subtle)]'
                      : 'bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-subtle)] hover:shadow-none'
                  )}
                >
                  <span className="sr-only">{mod.label}</span>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </nav>
        <div className="mb-3 flex flex-col items-center gap-y-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => handleModuleClick('settings')}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = ((e.clientX - rect.left) / rect.width) * 100
                const y = ((e.clientY - rect.top) / rect.height) * 100
                e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
              }}
              className={clsx(
                'ak-sidebar-button flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ak-button-interactive',
                activeModuleToken === 'settings' && leftDrawerOpen
                  ? 'bg-[var(--ak-color-selected)] text-[var(--ak-color-text-primary)] shadow-sm border-[var(--ak-color-border-subtle)]'
                  : 'bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-hover)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-subtle)] hover:shadow-none'
              )}
              aria-label="Einstellungen"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ak-color-selected)] ak-caption font-semibold text-[var(--ak-color-text-primary)] shadow-sm border border-[var(--ak-color-border-subtle)]">
                {profileUser.initials ?? 'N'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col">
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
                'ak-glass pointer-events-auto flex h-full flex-col border-r transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                showLeft ? 'translate-x-0' : '-translate-x-full'
              )}
              style={leftDrawerStyle}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <div className="truncate ak-caption font-medium text-[var(--ak-color-text-primary)]">
                  {activeModuleToken === 'settings' && selectedSettingsCategory === 'memory_crm'
                    ? 'Speicher & CRM'
                    : getModuleLabel(activeModuleToken)}
                </div>
                <button
                  type="button"
                  onClick={() => setLeftDrawerOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] shadow-sm hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2"
                >
                  <span className="sr-only">Panel einklappen</span>
                  <span aria-hidden="true" className="text-xs">
                    ‹
                  </span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto ak-scrollbar ak-body text-[var(--ak-color-text-secondary)]">
                {activeModuleToken === 'chat' ? (
                  <ChatSidebarContent />
                ) : activeModuleToken === 'inbox' ? (
                  <InboxDrawerWidget onItemClick={handleInboxItemClick} />
                ) : activeModuleToken === 'automation' ? (
                  <AutomationQuickActionsWidget onSelectAction={handleAutomationItemClick} />
                ) : activeModuleToken === 'settings' ? (
                  selectedSettingsCategory === 'memory_crm' ? (
                    <MemorySidebarWidget onCategoryClick={handleMemoryCategoryClick} />
                  ) : (
                    <SettingsSidebarWidget onCategorySelect={handleSettingsCategorySelect} />
                  )
                ) : (
                  <>
                    <p className="ak-body text-[var(--ak-color-text-muted)]">
                      Hier kommen später die Widgets für{' '}
                      <span className="font-medium text-[var(--ak-color-text-primary)]">
                        {getModuleLabel(activeModuleToken)}
                      </span>{' '}
                      hin.
                    </p>
                    <p className="mt-2">
                      Zum Beispiel Karten, Listen, Formulare oder Kalender, die mit
                      deinem Orchestra verbunden sind.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 right-0 flex',
              showRight ? 'z-40' : 'z-30'
            )}
            style={rightContainerStyle}
          >
            <div
              className={clsx(
                'ak-glass pointer-events-auto flex h-full flex-col border-l transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                showRight ? 'translate-x-0' : 'translate-x-full',
                showNotifications ? 'w-full' : 'w-full' // Vollbild bei Benachrichtigungen
              )}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] shadow-sm hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2"
                >
                  <span className="sr-only">Detailpanel einklappen</span>
                  <span aria-hidden="true" className="text-xs">
                    ›
                  </span>
                </button>
                <div className="truncate ak-caption font-medium text-[var(--ak-color-text-primary)]">
                  {showNotifications
                    ? 'Benachrichtigungen'
                    : activeModuleToken === 'inbox'
                      ? selectedInboxItem?.title ?? 'Details'
                      : activeModuleToken === 'settings'
                        ? selectedSettingsCategory === 'memory_crm'
                          ? selectedMemoryCategory?.title ?? 'Speicher & CRM'
                          : (selectedSettingsCategory ? 'Allgemein' : 'Einstellungen')
                        : activeModuleToken === 'automation'
                              ? 'Modules'
                              : getModuleLabel(activeModuleToken)}
                </div>
                <div className="w-7" />
              </div>
              <div className="flex-1 overflow-y-auto ak-scrollbar px-3 py-3 text-sm text-[var(--ak-color-text-secondary)]">
                {showNotifications ? (
                  <NotificationsDetailPanel />
                ) : activeModuleToken === 'inbox' ? (
                  <InboxDetailPanel item={selectedInboxItem} />
                ) : activeModuleToken === 'settings' ? (
                  selectedSettingsCategory === 'memory_crm' ? (
                    <MemoryDetailPanel category={selectedMemoryCategory} />
                  ) : (
                    <SettingsDetailPanel category={selectedSettingsCategory} />
                  )
                ) : activeModuleToken === 'automation' ? (
                  <AutomationDetailPanel workflowId={selectedAutomationItem} />
                ) : (
                  <div className="space-y-2">
                    <p className="ak-body text-[var(--ak-color-text-muted)]">
                      Hier erscheinen später Detailansichten für{' '}
                      <span className="font-medium text-[var(--ak-color-text-primary)]">
                        {getModuleLabel(activeModuleToken)}
                      </span>
                      .
                    </p>
                    <p>
                      Zum Beispiel Timeline-Ansichten, Kontextinfos oder KI-Vorschläge, die zu diesem Modul gehören.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}