'use client'

import type { ReactNode, ComponentType, CSSProperties } from 'react'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  InboxIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  BellIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'
import { ChatQuickActionsWidget } from '@/components/chat/ChatQuickActionsWidget'
import { MarketingQuickActionsWidget } from '@/components/MarketingQuickActionsWidget'
import { InboxDrawerWidget } from '@/components/InboxDrawerWidget'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { InboxDetailPanel } from '@/components/InboxDetailPanel'
import { ChatSidebarWidget, type ChatSidebarConversation } from '@/components/chat/ChatSidebarWidget'
import { CalendarSidebarWidget } from '@/components/calendar/CalendarSidebarWidget'
import { CalendarDetailPanel } from '@/components/calendar/CalendarDetailPanel'
import { ProfileMenu, type ProfileMenuAction, type ProfileUserState } from '@/components/ProfileMenu'



type WorkspaceModuleToken =
  | 'chat'
  | 'inbox'
  | 'memory'
  | 'marketing'
  | 'calendar'
  | 'automation'
  | 'notifications'
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
  { id: 'memory', label: 'Speicher & CRM', icon: ArchiveBoxIcon, href: '/memory' },
  { id: 'marketing', label: 'Marketing', icon: MegaphoneIcon },
  { id: 'calendar', label: 'Kalender', icon: CalendarDaysIcon },
  { id: 'automation', label: 'Automatisierung', icon: Cog6ToothIcon },
]

const LEFT_DRAWER_WIDTH = 420

const MOCK_CHAT_CONVERSATIONS: ChatSidebarConversation[] = [
  {
    id: 'welcome',
    title: 'Willkommen bei Aklow',
    lastMessagePreview: 'Frag mich etwas zu deinem Projekt oder Code...',
    updatedAt: 'Jetzt',
    unreadCount: 0,
    avatarInitials: 'AK',
  },
  {
    id: 'demo-1',
    title: 'Demo-Workspace',
    lastMessagePreview: 'Die letzten Änderungen sehen gut aus.',
    updatedAt: 'Heute',
    unreadCount: 2,
    avatarInitials: 'DW',
  },
]

function getModuleLabel(token: WorkspaceModuleToken): string {
  const match = MODULES.find((m) => m.id === token)
  if (match) return match.label

  if (token === 'notifications') return 'Benachrichtigungen'
  if (token === 'settings') return 'Einstellungen'

  return token
}

type ChatWorkspaceShellProps = {
  children: ReactNode
}

export function ChatWorkspaceShell({ children }: ChatWorkspaceShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  const initialModule: WorkspaceModuleToken =
    pathname === '/memory' ? 'memory' : 'chat'

  const [activeModuleToken, setActiveModuleToken] =
    useState<WorkspaceModuleToken>(initialModule)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null)
  const [activeChatId, setActiveChatId] = useState<string | null>(MOCK_CHAT_CONVERSATIONS[0]?.id ?? null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

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

    setLeftDrawerOpen((prev) => {
      if (prev && activeModuleToken === token) {
        return false
      }
      return true
    })

    setRightDrawerOpen(false)
    setSelectedInboxItem(null)
  }

  const handleModuleNavClick = (mod: any) => {
    handleModuleClick(mod.token)
  }

  const handleProfileMenuAction = (action: ProfileMenuAction) => {
    switch (action) {
      case 'settings': {
        handleModuleClick('settings')
        break
      }
      case 'memoryCrm': {
        router.push('/memory')
        setActiveModuleToken('memory')
        setLeftDrawerOpen(false)
        setRightDrawerOpen(false)
        break
      }
      case 'personalization':
      case 'help':
      case 'logout':
      case 'login':
      default:
        break
    }

    setIsProfileMenuOpen(false)
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

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
  }

  const showLeft = leftDrawerOpen

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
    <div className="flex h-screen bg-[var(--ak-color-bg-app)] text-[var(--ak-color-text-primary)]">
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
        <div className="mb-4 flex flex-col items-center gap-y-3">
          <button
            type="button"
            onClick={() => handleModuleClick('notifications')}
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors',
              activeModuleToken === 'notifications' && leftDrawerOpen
                ? 'bg-[var(--ak-color-accent)] text-white'
                : 'bg-transparent hover:bg-slate-100 hover:text-slate-900'
            )}
            aria-label="Benachrichtigungen"
          >
            <BellIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors',
                (activeModuleToken === 'settings' && leftDrawerOpen) || isProfileMenuOpen
                  ? 'bg-[var(--ak-color-accent)] text-white'
                  : 'bg-transparent hover:bg-slate-100 hover:text-slate-900'
              )}
              aria-label="Einstellungen"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ak-color-accent)] text-xs font-semibold text-white">
                {profileUser.initials ?? 'N'}
              </span>
            </button>
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute bottom-0 left-full z-50 mb-3 ml-3 w-80 origin-bottom-left">
                  <ProfileMenu user={profileUser} onAction={handleProfileMenuAction} />
                </div>
              </>
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
                {activeModuleToken === 'chat' ? (
                  <ChatQuickActionsWidget />
                ) : activeModuleToken === 'inbox' ? (
                  <InboxDrawerWidget onItemClick={handleInboxItemClick} />
                ) : activeModuleToken === 'calendar' ? (
                  <CalendarSidebarWidget />
                ) : activeModuleToken === 'marketing' ? (
                  <MarketingQuickActionsWidget />
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
                  {activeModuleToken === 'inbox'
                    ? selectedInboxItem?.title ?? 'Details'
                    : getModuleLabel(activeModuleToken)}
                </div>
                <div className="w-7" />
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 text-sm text-slate-600">
                {activeModuleToken === 'inbox' ? (
                  <InboxDetailPanel item={selectedInboxItem} />
                ) : activeModuleToken === 'calendar' ? (
                  <CalendarDetailPanel />
                ) : activeModuleToken === 'notifications' ? (
                  <div className="space-y-2">
                    <p className="text-slate-500">
                      Hier erscheinen später die Details zu deinen{' '}
                      <span className="font-medium text-slate-900">Benachrichtigungen</span>.
                    </p>
                    <p>
                      Zum Beispiel Regeln, Kanäle und Häufigkeiten, die du mit ChatKit-Automatisierungen verknüpfen kannst.
                    </p>
                  </div>
                ) : activeModuleToken === 'settings' ? (
                  <div className="space-y-2">
                    <p className="text-slate-500">
                      Hier kannst du später deine{' '}
                      <span className="font-medium text-slate-900">Workspace-Einstellungen</span> anpassen.
                    </p>
                    <p>
                      Zum Beispiel Profile, Team-Zugänge und KI-Voreinstellungen für deinen Orchestrator.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-500">
                      Hier erscheinen später Detailansichten für{' '}
                      <span className="font-medium text-slate-900">
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