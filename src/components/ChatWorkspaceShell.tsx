'use client'

import type { ReactNode, ComponentType, CSSProperties } from 'react'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MegaphoneIcon,
  DocumentIcon,
  UserGroupIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent'
import { InboxDrawerWidget } from '@/components/InboxDrawerWidget'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { InboxDetailPanel } from '@/components/InboxDetailPanel'
import { InboxDetailsDrawer } from '@/components/InboxDetailsDrawer'
import { NotificationsDetailPanel } from '@/components/NotificationsDetailPanel'
import type { ProfileUserState } from '@/components/ProfileMenu'
import { SettingsSidebarWidget } from '@/components/SettingsSidebarWidget'
import { SettingsDetailPanel, type SettingsCategory } from '@/components/SettingsDetailPanel'
import { MemorySidebarWidget, type MemoryCategory } from '@/components/MemorySidebarWidget'
import { MemoryDetailPanel } from '@/components/MemoryDetailPanel'
import { AutomationQuickActionsWidget } from '@/components/AutomationQuickActionsWidget'
import { AutomationDetailPanel } from '@/components/AutomationDetailPanel'
import { GrowthSidebarWidget } from '@/components/GrowthSidebarWidget'
import { DocumentsSidebarWidget } from '@/components/DocumentsSidebarWidget'
import { CustomersSidebarWidget } from '@/components/CustomersSidebarWidget'
import { CustomerDetailsDrawer } from '@/components/CustomerDetailsDrawer'
import { GrowthDetailsDrawer } from '@/components/GrowthDetailsDrawer'
import { DocumentDetailsDrawer } from '@/components/DocumentDetailsDrawer'



type WorkspaceModuleToken =
  | 'chat'
  | 'inbox'
  | 'new1'
  | 'new2'
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
  { id: 'inbox', label: 'Posteingang', icon: PaperAirplaneIcon },
  { id: 'new2', label: 'Dokumente', icon: DocumentIcon },
  { id: 'automation', label: 'Kunden', icon: UserGroupIcon },
  { id: 'new1', label: 'Wachstum', icon: MegaphoneIcon },
]

// Layout-Konstanten
// Linker Rail (Icons): 64px (Tailwind w-16)
const LEFT_RAIL_WIDTH = '64px'
// Linkes Panel ~30% Breite (mit Grenzen)
const LEFT_DRAWER_WIDTH = 'clamp(260px, 30vw, 400px)'

function getModuleLabel(token: WorkspaceModuleToken): string {
  const match = MODULES.find((m) => m.id === token)
  if (match) return match.label

  if (token === 'settings') return 'Einstellungen'
  if (token === 'new1') return 'Wachstum'
  if (token === 'new2') return 'Dokumente'
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedGrowthItemId, setSelectedGrowthItemId] = useState<string | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedInboxThreadId, setSelectedInboxThreadId] = useState<string | null>(null)
  const [showInboxOverview, setShowInboxOverview] = useState(false)
  const [showGrowthOverview, setShowGrowthOverview] = useState(false)
  const [showDocumentsOverview, setShowDocumentsOverview] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [hoveredSidebarTooltip, setHoveredSidebarTooltip] = useState<string | null>(null)

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
    setSelectedInboxThreadId(null)
    setSelectedSettingsCategory(null)
    setSelectedAutomationItem(null)
    setSelectedMemoryCategory(null)
    setSelectedCustomerId(null)
    setSelectedGrowthItemId(null)
    setSelectedDocumentId(null)
    setShowInboxOverview(false)
    setShowGrowthOverview(false)
    setShowDocumentsOverview(false)
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
      setSelectedInboxThreadId(null)
      return
    }
    
    setSelectedInboxItem(item)
    setSelectedInboxThreadId(item.threadId || null)
    setSelectedSettingsCategory(null)
    setSelectedAutomationItem(null)
    setSelectedMemoryCategory(null)
    setSelectedCustomerId(null)
    setSelectedGrowthItemId(null)
    setSelectedDocumentId(null)
    setShowInboxOverview(false)
    setShowGrowthOverview(false)
    setShowDocumentsOverview(false)
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
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowInboxOverview(false)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
      handleOpenDetails()
    }
  }

  const handleCustomerClick = (customerId: string) => {
    if (selectedCustomerId === customerId && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedCustomerId(null)
    } else {
      setSelectedCustomerId(customerId)
      setSelectedInboxItem(null)
      setSelectedSettingsCategory(null)
      setSelectedAutomationItem(null)
      setSelectedMemoryCategory(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowInboxOverview(false)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
      handleOpenDetails()
    }
  }

  const handleGrowthItemClick = (itemId: string) => {
    if (selectedGrowthItemId === itemId && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedGrowthItemId(null)
    } else {
      setSelectedGrowthItemId(itemId)
      setSelectedInboxItem(null)
      setSelectedSettingsCategory(null)
      setSelectedAutomationItem(null)
      setSelectedMemoryCategory(null)
      setSelectedCustomerId(null)
      setSelectedDocumentId(null)
      setShowInboxOverview(false)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
      handleOpenDetails()
    }
  }

  const handleDocumentClick = (documentId: string) => {
    if (selectedDocumentId === documentId && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedDocumentId(null)
    } else {
      setSelectedDocumentId(documentId)
      setSelectedInboxItem(null)
      setSelectedSettingsCategory(null)
      setSelectedAutomationItem(null)
      setSelectedMemoryCategory(null)
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setShowInboxOverview(false)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
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
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowInboxOverview(false)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
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
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowInboxOverview(false)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
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
    setSelectedInboxThreadId(null)
    setSelectedSettingsCategory(null)
    setSelectedAutomationItem(null)
    setSelectedMemoryCategory(null)
    setSelectedCustomerId(null)
    setSelectedGrowthItemId(null)
    setSelectedDocumentId(null)
    setShowInboxOverview(false)
    setShowGrowthOverview(false)
    setShowDocumentsOverview(false)
  }

  const handleInboxOverviewToggle = () => {
    if (showInboxOverview && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setShowInboxOverview(false)
    } else {
      setShowInboxOverview(true)
      setSelectedInboxItem(null)
      setSelectedInboxThreadId(null)
      setSelectedSettingsCategory(null)
      setSelectedAutomationItem(null)
      setSelectedMemoryCategory(null)
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
      handleOpenDetails()
    }
  }

  const handleInboxInfoClick = () => {
    // Öffne InboxDetailsDrawer für ersten Thread mit threadId
    // Mock-Daten: Erster Thread aus DEFAULT_ITEMS
    const mockFirstItem = {
      id: 't_101',
      channel: 'email' as const,
      icon: 'mail',
      title: 'Re: Angebot für Q1',
      snippet: 'Max Mustermann – Können wir den Umfang am Montag finalisieren?',
      time: '09:12',
      unread: true,
      badge: 'Wichtig' as const,
      threadId: 'th_12345',
    }
    
    if (mockFirstItem.threadId) {
      setSelectedInboxThreadId(mockFirstItem.threadId)
      setSelectedInboxItem(mockFirstItem)
      setShowInboxOverview(false)
      setSelectedSettingsCategory(null)
      setSelectedAutomationItem(null)
      setSelectedMemoryCategory(null)
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowGrowthOverview(false)
      setShowDocumentsOverview(false)
      handleOpenDetails()
    } else {
      handleInboxOverviewToggle()
    }
  }

  const handleGrowthOverviewToggle = () => {
    if (showGrowthOverview && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setShowGrowthOverview(false)
    } else {
      setShowGrowthOverview(true)
      setSelectedInboxItem(null)
      setSelectedSettingsCategory(null)
      setSelectedAutomationItem(null)
      setSelectedMemoryCategory(null)
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowInboxOverview(false)
      setShowDocumentsOverview(false)
      handleOpenDetails()
    }
  }

  const handleDocumentsOverviewToggle = () => {
    if (showDocumentsOverview && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setShowDocumentsOverview(false)
    } else {
      setShowDocumentsOverview(true)
      setSelectedInboxItem(null)
      setSelectedSettingsCategory(null)
      setSelectedAutomationItem(null)
      setSelectedMemoryCategory(null)
      setSelectedCustomerId(null)
      setSelectedGrowthItemId(null)
      setSelectedDocumentId(null)
      setShowInboxOverview(false)
      setShowGrowthOverview(false)
      handleOpenDetails()
    }
  }

  const showLeft = leftDrawerOpen && !showNotifications // Keine Sidebar wenn Benachrichtigungen im Vollbild
  const showRight =
    rightDrawerOpen &&
    (showNotifications ||
      selectedInboxItem !== null ||
      selectedInboxThreadId !== null ||
      selectedSettingsCategory !== null ||
      selectedAutomationItem !== null ||
      selectedMemoryCategory !== null ||
      selectedCustomerId !== null ||
      selectedGrowthItemId !== null ||
      selectedDocumentId !== null ||
      showInboxOverview ||
      showGrowthOverview ||
      showDocumentsOverview)

  const chatStyle: CSSProperties =
    showLeft && !showNotifications ? { marginLeft: LEFT_DRAWER_WIDTH } : { marginLeft: 0 }

  const leftDrawerStyle: CSSProperties = {
    width: LEFT_DRAWER_WIDTH,
  }

  // Rechtes Panel: Positionierung abhängig vom Zustand
  const rightContainerStyle: CSSProperties = {
    right: 0,
    left: showNotifications 
      ? 0 
      : showLeft 
        ? LEFT_DRAWER_WIDTH 
        : LEFT_RAIL_WIDTH, // Bei geschlossener Sidebar: bei Logos (64px) starten
  }

  return (
    <div className="flex h-screen bg-[var(--ak-color-bg-app)] text-[var(--ak-color-text-primary)]">
      <aside className="ak-glass flex w-16 flex-col items-center gap-y-4 py-3 text-[var(--ak-color-text-secondary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] border-r-0">
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
              <div key={mod.id} className="relative">
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
                  onMouseEnter={() => setHoveredSidebarTooltip(mod.id)}
                  onMouseLeave={() => setHoveredSidebarTooltip(null)}
                  className={clsx(
                    'ak-sidebar-button flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent text-[var(--ak-color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ak-button-interactive',
                    isActive
                      ? 'bg-[var(--ak-color-bg-selected)] text-[var(--ak-color-text-primary)] shadow-sm border-[var(--ak-color-border-subtle)]'
                      : 'bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-subtle)] hover:shadow-none'
                  )}
                >
                  <span className="sr-only">{mod.label}</span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </button>
                {hoveredSidebarTooltip === mod.id && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                    {mod.label}
                  </span>
                )}
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
              onMouseEnter={() => setHoveredSidebarTooltip('settings')}
              onMouseLeave={() => setHoveredSidebarTooltip(null)}
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
            {hoveredSidebarTooltip === 'settings' && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[10px] text-gray-500 bg-transparent whitespace-nowrap pointer-events-none z-50">
                Einstellungen
              </span>
            )}
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
                'ak-glass pointer-events-auto flex h-full flex-col border-r-0 transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
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
                
                <div className="flex-1 flex justify-center">
                  {/* Info Button - öffnet rechten Drawer mit Details */}
                  {(activeModuleToken === 'inbox' || activeModuleToken === 'new1' || activeModuleToken === 'new2' || activeModuleToken === 'automation') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeModuleToken === 'inbox') {
                          handleInboxInfoClick()
                        } else if (activeModuleToken === 'new1') {
                          // Öffne GrowthDetailsDrawer
                          setSelectedGrowthItemId('gi_2025_001')
                          setSelectedInboxItem(null)
                          setSelectedInboxThreadId(null)
                          setSelectedSettingsCategory(null)
                          setSelectedAutomationItem(null)
                          setSelectedMemoryCategory(null)
                          setSelectedCustomerId(null)
                          setSelectedDocumentId(null)
                          setShowInboxOverview(false)
                          setShowGrowthOverview(false)
                          setShowDocumentsOverview(false)
                          handleOpenDetails()
                        } else if (activeModuleToken === 'new2') {
                          // Öffne DocumentDetailsDrawer
                          setSelectedDocumentId('d_123')
                          setSelectedInboxItem(null)
                          setSelectedInboxThreadId(null)
                          setSelectedSettingsCategory(null)
                          setSelectedAutomationItem(null)
                          setSelectedMemoryCategory(null)
                          setSelectedCustomerId(null)
                          setSelectedGrowthItemId(null)
                          setShowInboxOverview(false)
                          setShowGrowthOverview(false)
                          setShowDocumentsOverview(false)
                          handleOpenDetails()
                        } else if (activeModuleToken === 'automation') {
                          // Öffne CustomerDetailsDrawer
                          setSelectedCustomerId('c1')
                          setSelectedInboxItem(null)
                          setSelectedInboxThreadId(null)
                          setSelectedSettingsCategory(null)
                          setSelectedAutomationItem(null)
                          setSelectedMemoryCategory(null)
                          setSelectedGrowthItemId(null)
                          setSelectedDocumentId(null)
                          setShowInboxOverview(false)
                          setShowGrowthOverview(false)
                          setShowDocumentsOverview(false)
                          handleOpenDetails()
                        }
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2"
                      aria-label="Details öffnen"
                    >
                      <InformationCircleIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Collapse Button */}
                <button
                  type="button"
                  onClick={() => setLeftDrawerOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] shadow-sm hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2"
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
                  <InboxDrawerWidget 
                    onItemClick={handleInboxItemClick} 
                    onInfoClick={handleInboxInfoClick}
                  />
                ) : activeModuleToken === 'automation' ? (
                  <CustomersSidebarWidget 
                    onCustomerClick={handleCustomerClick}
                    onOverviewClick={() => {
                      // Öffne CustomerDetailsDrawer für ersten Kunden
                      setSelectedCustomerId('c1')
                      setSelectedInboxItem(null)
                      setSelectedInboxThreadId(null)
                      setSelectedSettingsCategory(null)
                      setSelectedAutomationItem(null)
                      setSelectedMemoryCategory(null)
                      setSelectedGrowthItemId(null)
                      setSelectedDocumentId(null)
                      setShowInboxOverview(false)
                      setShowGrowthOverview(false)
                      setShowDocumentsOverview(false)
                      handleOpenDetails()
                    }}
                  />
                ) : activeModuleToken === 'settings' ? (
                  selectedSettingsCategory === 'memory_crm' ? (
                    <MemorySidebarWidget onCategoryClick={handleMemoryCategoryClick} />
                  ) : (
                    <SettingsSidebarWidget onCategorySelect={handleSettingsCategorySelect} />
                  )
                ) : activeModuleToken === 'new1' ? (
                  <GrowthSidebarWidget 
                    onItemClick={handleGrowthItemClick}
                    onOverviewClick={() => {
                      // Öffne GrowthDetailsDrawer für erstes Item
                      setSelectedGrowthItemId('gi_2025_001')
                      setSelectedInboxItem(null)
                      setSelectedInboxThreadId(null)
                      setSelectedSettingsCategory(null)
                      setSelectedAutomationItem(null)
                      setSelectedMemoryCategory(null)
                      setSelectedCustomerId(null)
                      setSelectedDocumentId(null)
                      setShowInboxOverview(false)
                      setShowGrowthOverview(false)
                      setShowDocumentsOverview(false)
                      handleOpenDetails()
                    }}
                  />
                ) : activeModuleToken === 'new2' ? (
                  <DocumentsSidebarWidget 
                    onDocumentClick={handleDocumentClick} 
                    onOverviewClick={() => {
                      // Öffne DocumentDetailsDrawer für erstes Dokument
                      setSelectedDocumentId('d_123')
                      setSelectedInboxItem(null)
                      setSelectedInboxThreadId(null)
                      setSelectedSettingsCategory(null)
                      setSelectedAutomationItem(null)
                      setSelectedMemoryCategory(null)
                      setSelectedCustomerId(null)
                      setSelectedGrowthItemId(null)
                      setShowInboxOverview(false)
                      setShowGrowthOverview(false)
                      setShowDocumentsOverview(false)
                      handleOpenDetails()
                    }}
                  />
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
              'ak-glass pointer-events-auto flex h-full flex-col transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
              showRight ? 'translate-x-0' : 'translate-x-full'
            )}
            style={{ width: '100%' }} // Füllt immer den gesamten Container
            >
              <div className="ak-glass-drawer-header flex items-center justify-between" style={{ padding: 'var(--ak-space-3) var(--ak-space-4)' }}>
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md ak-surface-2 text-[var(--ak-text-secondary)] transition-colors hover:ak-surface-2-hover hover:text-[var(--ak-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-accent-inbox)]/25 focus-visible:ring-offset-2"
                >
                  <span className="sr-only">Detailpanel einklappen</span>
                  <span aria-hidden="true" className="text-xs">
                    ›
                  </span>
                </button>
                <div className="truncate ak-caption font-medium text-[var(--ak-text-primary)]" style={{ fontSize: 'var(--ak-font-size-sm)' }}>
                  {showNotifications
                    ? 'Benachrichtigungen'
                    : showInboxOverview
                      ? 'Posteingang Übersicht'
                      : showGrowthOverview
                        ? 'Wachstum Übersicht'
                        : showDocumentsOverview
                          ? 'Dokumente Übersicht'
                          : activeModuleToken === 'inbox'
                            ? selectedInboxItem?.title ?? 'Details'
                            : activeModuleToken === 'settings'
                        ? selectedSettingsCategory === 'memory_crm'
                          ? selectedMemoryCategory?.title ?? 'Speicher & CRM'
                          : (selectedSettingsCategory ? 'Allgemein' : 'Einstellungen')
                        : activeModuleToken === 'automation'
                          ? selectedCustomerId
                            ? 'Kundendetails'
                            : 'Kunden'
                          : activeModuleToken === 'new1'
                            ? selectedGrowthItemId
                              ? 'Wachstum Details'
                              : 'Wachstum'
                            : activeModuleToken === 'new2'
                              ? selectedDocumentId
                                ? 'Dokument Details'
                                : 'Dokumente'
                              : getModuleLabel(activeModuleToken)}
                </div>
                <div className="w-7" />
              </div>
              <div
                className="flex-1 overflow-y-auto ak-scrollbar px-3 py-3 text-sm text-[var(--ak-color-text-secondary)]"
                style={{ scrollbarWidth: 'thin' }}
              >
                {showNotifications ? (
                  <NotificationsDetailPanel />
                ) : showInboxOverview ? (
                  <div className="space-y-2">
                    <h3 className="ak-heading text-base">Posteingang Übersicht</h3>
                    <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
                      Hier erscheint die Übersicht des Posteingangs.
                    </p>
                  </div>
                ) : activeModuleToken === 'inbox' ? (
                  selectedInboxThreadId && selectedInboxItem ? (
                    <InboxDetailsDrawer
                      threadId={selectedInboxThreadId}
                      channel={selectedInboxItem.channel}
                      sender={selectedInboxItem.snippet.split(' – ')[0] || selectedInboxItem.title}
                      dateShort={selectedInboxItem.time}
                      statusOptions={[
                        { label: 'Offen', value: 'open' },
                        { label: 'In Arbeit', value: 'in_progress' },
                        { label: 'Erledigt', value: 'done' },
                      ]}
                      status="open"
                      important={false}
                      assigneeOptions={[
                        { label: 'Unzugewiesen', value: '' },
                        { label: 'Anna', value: 'anna' },
                        { label: 'Ben', value: 'ben' },
                        { label: 'Du', value: 'me' },
                      ]}
                      assignee=""
                      tags="onboarding, follow-up"
                      customer="Acme GmbH"
                      project=""
                      lastSync="13:22 Uhr"
                      connectionStatus="OK"
                      advancedVisible={false}
                      ids={{
                        conversationId: 'conv_987654',
                        providerId: 'gmail',
                        messageId: '174a-ef23-9912',
                      }}
                      canSpamControls={true}
                      state="loaded"
                      onClose={() => {
                        setSelectedInboxThreadId(null)
                        setSelectedInboxItem(null)
                        setRightDrawerOpen(false)
                      }}
                    />
                  ) : selectedInboxItem ? (
                    <InboxDetailPanel item={selectedInboxItem} />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4">
                      <div className="max-w-xs text-center text-xs text-slate-500">
                        <p className="font-medium text-slate-600">Kein Thread ausgewählt</p>
                        <p className="mt-1">
                          Wähle links im Posteingang eine Nachricht aus, um Details anzuzeigen.
                        </p>
                      </div>
                    </div>
                  )
                ) : showGrowthOverview ? (
                  <div className="space-y-2">
                    <h3 className="ak-heading text-base">Wachstum Übersicht</h3>
                    <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
                      Hier erscheint die Übersicht des Wachstums.
                    </p>
                  </div>
                ) : showDocumentsOverview ? (
                  <div className="space-y-2">
                    <h3 className="ak-heading text-base">Dokumente Übersicht</h3>
                    <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
                      Hier erscheint die Übersicht der Dokumente.
                    </p>
                  </div>
                ) : activeModuleToken === 'settings' ? (
                  selectedSettingsCategory === 'memory_crm' ? (
                    <MemoryDetailPanel category={selectedMemoryCategory} />
                  ) : (
                    <SettingsDetailPanel category={selectedSettingsCategory} />
                  )
                ) : activeModuleToken === 'automation' ? (
                  selectedCustomerId ? (
                    <CustomerDetailsDrawer
                      customerId={selectedCustomerId}
                      onClose={() => {
                        setSelectedCustomerId(null)
                        setRightDrawerOpen(false)
                      }}
                    />
                  ) : (
                    <AutomationDetailPanel workflowId={selectedAutomationItem} />
                  )
                ) : activeModuleToken === 'new1' ? (
                  selectedGrowthItemId ? (
                    <GrowthDetailsDrawer
                      growthItemId={selectedGrowthItemId}
                      onClose={() => {
                        setSelectedGrowthItemId(null)
                        setRightDrawerOpen(false)
                      }}
                    />
                  ) : (
                    <div className="space-y-2">
                      <p className="ak-body text-[var(--ak-color-text-muted)]">
                        Wähle ein Wachstum-Item aus, um Details zu sehen.
                      </p>
                    </div>
                  )
                ) : activeModuleToken === 'new2' ? (
                  selectedDocumentId ? (
                    <DocumentDetailsDrawer
                      documentId={selectedDocumentId}
                      onClose={() => {
                        setSelectedDocumentId(null)
                        setRightDrawerOpen(false)
                      }}
                    />
                  ) : (
                    <div className="space-y-2">
                      <p className="ak-body text-[var(--ak-color-text-muted)]">
                        Wähle ein Dokument aus, um Details zu sehen.
                      </p>
                    </div>
                  )
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