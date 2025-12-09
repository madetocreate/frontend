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
  ArchiveBoxIcon,
  NewspaperIcon,
  PhoneIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent'
import { MarketingQuickActionsWidget } from '@/components/MarketingQuickActionsWidget'
import { InboxDrawerWidget } from '@/components/InboxDrawerWidget'
import { NewsSidebarWidget } from '@/components/NewsSidebarWidget'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { InboxDetailPanel } from '@/components/InboxDetailPanel'
import { CalendarSidebarWidget } from '@/components/calendar/CalendarSidebarWidget'
import { CalendarDetailPanel } from '@/components/calendar/CalendarDetailPanel'
import { ProfileMenu, type ProfileMenuAction, type ProfileUserState } from '@/components/ProfileMenu'
import { SettingsSidebarWidget } from '@/components/SettingsSidebarWidget'
import { AutomationQuickActionsWidget } from '@/components/AutomationQuickActionsWidget'
import { NewsDetailPanel } from '@/components/NewsDetailPanel'
import type { NewsStory } from '@/components/NewsSidebarWidget'
import { SettingsDetailPanel } from '@/components/SettingsDetailPanel'
import { TelephonySidebarWidget, type TelephonyItem } from '@/components/TelephonySidebarWidget'
import { TelephonyDetailPanel } from '@/components/TelephonyDetailPanel'



type WorkspaceModuleToken =
  | 'chat'
  | 'inbox'
  | 'news'
  | 'memory'
  | 'marketing'
  | 'calendar'
  | 'automation'
  | 'telephony'
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
  { id: 'news', label: 'News', icon: NewspaperIcon, href: '/news' },
  { id: 'memory', label: 'Speicher & CRM', icon: ArchiveBoxIcon, href: '/memory' },
  { id: 'marketing', label: 'Marketing', icon: MegaphoneIcon },
  { id: 'calendar', label: 'Kalender', icon: CalendarDaysIcon },
  { id: 'telephony', label: 'Telephone Bot', icon: PhoneIcon },
  { id: 'automation', label: 'Automatisierung', icon: BoltIcon },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon },
]

const LEFT_DRAWER_WIDTH = 336 // 20% kleiner als 420

function getModuleLabel(token: WorkspaceModuleToken): string {
  const match = MODULES.find((m) => m.id === token)
  if (match) return match.label

  if (token === 'settings') return 'Einstellungen'
  if (token === 'news') return 'News'
  if (token === 'telephony') return 'Telephone Bot'

  return token
}

type ChatWorkspaceShellProps = {
  children: ReactNode
}

export function ChatWorkspaceShell({ children }: ChatWorkspaceShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  const initialModule: WorkspaceModuleToken =
    pathname === '/memory' ? 'memory' : pathname === '/news' ? 'news' : 'chat'

  const [activeModuleToken, setActiveModuleToken] =
    useState<WorkspaceModuleToken>(initialModule)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null)
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsStory | null>(null)
  const [selectedSettingsCategory, setSelectedSettingsCategory] = useState<string | null>(null)
  const [selectedTelephonyItem, setSelectedTelephonyItem] = useState<TelephonyItem | null>(null)
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
    setSelectedNewsItem(null)
    setSelectedSettingsCategory(null)
    setSelectedTelephonyItem(null)
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
    // Wenn dasselbe Item nochmal geklickt wird, schließe den Drawer
    if (selectedInboxItem?.id === item.id && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedInboxItem(null)
      return
    }
    
    setSelectedInboxItem(item)
    setSelectedNewsItem(null)
    setSelectedSettingsCategory(null)
    setSelectedTelephonyItem(null)
    handleOpenDetails()
  }

  const handleNewsItemClick = (story: NewsStory) => {
    // Wenn dieselbe Story nochmal geklickt wird, schließe den Drawer
    if (selectedNewsItem?.id === story.id && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedNewsItem(null)
      return
    }
    
    setSelectedNewsItem(story)
    setSelectedInboxItem(null)
    setSelectedSettingsCategory(null)
    setSelectedTelephonyItem(null)
    handleOpenDetails()
  }

  const handleTelephonyItemClick = (item: TelephonyItem) => {
    if (selectedTelephonyItem?.id === item.id && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedTelephonyItem(null)
    } else {
      setSelectedTelephonyItem(item)
      setSelectedInboxItem(null)
      setSelectedNewsItem(null)
      setSelectedSettingsCategory(null)
      handleOpenDetails()
    }
  }

  const handleSettingsCategorySelect = (category: string | null) => {
    if (selectedSettingsCategory === category && rightDrawerOpen) {
      setRightDrawerOpen(false)
      setSelectedSettingsCategory(null)
    } else {
      setSelectedSettingsCategory(category)
      setSelectedInboxItem(null)
      setSelectedNewsItem(null)
      setSelectedTelephonyItem(null)
      if (category) {
        handleOpenDetails()
      } else {
        setRightDrawerOpen(false)
      }
    }
  }

  const handleCloseDetails = () => {
    setRightDrawerOpen(false)
    setSelectedInboxItem(null)
    setSelectedNewsItem(null)
    setSelectedSettingsCategory(null)
    setSelectedTelephonyItem(null)
  }

  const showLeft = leftDrawerOpen
  const showRight = rightDrawerOpen && (selectedInboxItem !== null || selectedNewsItem !== null || selectedSettingsCategory !== null || selectedTelephonyItem !== null)

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
      <aside className="flex w-16 flex-col items-center gap-y-3 bg-[var(--ak-color-bg-sidebar)]/90 py-4 text-slate-700 shadow-[var(--ak-shadow-soft)] backdrop-blur-xl border-r border-[var(--ak-color-border-subtle)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-blue-500 bg-white ak-caption font-semibold text-slate-700 shadow-sm">
          <span className="text-xs">AK</span>
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
                    'flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                    isActive
                      ? 'bg-slate-100 text-slate-900 shadow-sm border-slate-200'
                      : 'bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-bg-surface)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-subtle)] hover:shadow-none'
                  )}
                >
                  <span className="sr-only">{mod.label}</span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-14 top-1/2 z-50 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 ak-caption font-medium text-slate-700 opacity-0 shadow-sm transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                  {mod.label}
                </div>
              </div>
            )
          })}
        </nav>
        <div className="mb-4 flex flex-col items-center gap-y-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                (activeModuleToken === 'settings' && leftDrawerOpen) || isProfileMenuOpen
                  ? 'bg-slate-100 text-slate-900 shadow-sm border-slate-200'
                  : 'bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-bg-surface)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-subtle)] hover:shadow-none'
              )}
              aria-label="Einstellungen"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 ak-caption font-semibold text-slate-700 shadow-sm border border-slate-200">
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
                'pointer-events-auto flex h-full flex-col bg-[var(--ak-color-bg-surface)]/95 border-r border-[var(--ak-color-border-subtle)] shadow-[var(--ak-shadow-soft)] transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] backdrop-blur-xl',
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
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2"
                >
                  <span className="sr-only">Panel einklappen</span>
                  <span aria-hidden="true" className="text-xs">
                    ‹
                  </span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto text-sm text-slate-600">
                {activeModuleToken === 'chat' ? (
                  <ChatSidebarContent />
                ) : activeModuleToken === 'inbox' ? (
                  <InboxDrawerWidget onItemClick={handleInboxItemClick} />
                ) : activeModuleToken === 'calendar' ? (
                  <CalendarSidebarWidget />
                ) : activeModuleToken === 'marketing' ? (
                  <MarketingQuickActionsWidget />
                ) : activeModuleToken === 'automation' ? (
                  <AutomationQuickActionsWidget />
                ) : activeModuleToken === 'settings' ? (
                  <SettingsSidebarWidget onCategorySelect={handleSettingsCategorySelect} />
                ) : activeModuleToken === 'news' ? (
                  <NewsSidebarWidget onStoryClick={handleNewsItemClick} />
                ) : activeModuleToken === 'telephony' ? (
                  <TelephonySidebarWidget onItemClick={handleTelephonyItemClick} />
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
              showRight ? 'z-40' : 'z-30'
            )}
            style={rightContainerStyle}
          >
            <div
              className={clsx(
                'pointer-events-auto flex h-full w-full flex-col bg-[var(--ak-color-bg-surface)]/97 border-l border-[var(--ak-color-border-subtle)] shadow-[var(--ak-shadow-strong)] transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] backdrop-blur-xl',
                showRight ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2"
                >
                  <span className="sr-only">Detailpanel einklappen</span>
                  <span aria-hidden="true" className="text-xs">
                    ›
                  </span>
                </button>
                <div className="truncate text-sm font-medium text-slate-900">
                  {activeModuleToken === 'inbox'
                    ? selectedInboxItem?.title ?? 'Details'
                    : activeModuleToken === 'news'
                      ? selectedNewsItem?.title ?? 'Details'
                      : activeModuleToken === 'settings'
                        ? (selectedSettingsCategory ? 'Allgemein' : 'Einstellungen')
                        : activeModuleToken === 'telephony'
                          ? selectedTelephonyItem?.title ?? 'Details'
                          : getModuleLabel(activeModuleToken)}
                </div>
                <div className="w-7" />
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 text-sm text-slate-600">
                {activeModuleToken === 'inbox' ? (
                  <InboxDetailPanel item={selectedInboxItem} />
                ) : activeModuleToken === 'news' ? (
                  <NewsDetailPanel story={selectedNewsItem} />
                ) : activeModuleToken === 'calendar' ? (
                  <CalendarDetailPanel />
                ) : activeModuleToken === 'settings' ? (
                  <SettingsDetailPanel category={selectedSettingsCategory} />
                ) : activeModuleToken === 'telephony' ? (
                  <TelephonyDetailPanel item={selectedTelephonyItem} />
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