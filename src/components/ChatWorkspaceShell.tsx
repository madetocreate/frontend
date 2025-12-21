'use client'

import type { ReactNode, ComponentType } from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import { CommandPalette } from './CommandPalette'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MegaphoneIcon,
  DocumentIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  PhoneIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { InboxDrawerWidget } from '@/components/InboxDrawerWidget'
import { ShieldSidebarWidget, type ShieldView } from '@/components/shield/ShieldSidebarWidget'
import { TelephonySidebarWidget, type TelephonyView } from '@/components/telephony/TelephonySidebarWidget'
import { WebsiteSidebarWidget, type WebsiteView } from '@/components/website/WebsiteSidebarWidget'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { useTranslation } from '../i18n'
import { SettingsSidebarWidget, SettingsView } from '@/components/settings/SettingsSidebarWidget'
import { SettingsDetailDrawer } from '@/components/settings/SettingsDetailDrawer'
import { GrowthSidebarWidget, GrowthView } from '@/components/growth/GrowthSidebarWidget'
import { DocumentsSidebarWidget, type DocumentsView } from '@/components/documents/DocumentsSidebarWidget'
import { CustomersSidebarWidget, CustomersView } from '@/components/customers/CustomersSidebarWidget'
import { NotificationCenterDrawer } from '@/components/notifications/NotificationCenterDrawer'
import { NotificationType } from '@/components/notifications/types'
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent'
import { buildCommands, AKLOW_EVENTS, type CommandContext } from '@/commands/registry'
import { ChatFirstFAB } from '@/components/chat/ChatFirstFAB'
import { DashboardOverlay } from '@/components/dashboard/DashboardOverlay'

type WorkspaceModuleToken =
  | 'chat'
  | 'inbox'
  | 'growth'
  | 'documents'
  | 'customers'
  | 'shield'
  | 'phone'
  | 'website'
  | 'settings'

type ChatWorkspaceShellProps = { children: ReactNode }

// Right drawer removed - Chat First approach

type ModuleIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
type WorkspaceModule = { id: WorkspaceModuleToken; label: string; icon: ModuleIcon }

const MODULES: WorkspaceModule[] = [
  { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { id: 'inbox', label: 'Posteingang', icon: PaperAirplaneIcon },
  { id: 'growth', label: 'Wachstum', icon: MegaphoneIcon },
  { id: 'documents', label: 'Dokumente', icon: DocumentIcon },
  { id: 'customers', label: 'Kunden', icon: UserGroupIcon },
  { id: 'shield', label: 'AI-Shield', icon: ShieldCheckIcon },
  { id: 'phone', label: 'Telefon-Bot', icon: PhoneIcon },
  { id: 'website', label: 'Website-Bot', icon: GlobeAltIcon },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon },
]

type AiAction = { title: string; desc: string }

       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       const getAiActions = (token: WorkspaceModuleToken): AiAction[] => {
         switch (token) {
           case 'chat':
             return [
               { title: 'Antwort vorschlagen', desc: 'Formuliere eine passende Reply für den aktuellen Chat.' },
               { title: 'Tonfall anpassen', desc: 'Mach die Antwort freundlicher oder formeller in einem Schritt.' },
               { title: 'Nächste Schritte', desc: 'Schlage 3 Folgeaktionen für den Nutzer vor.' },
             ]
           case 'inbox':
             return [
               { title: 'Auto-Reply Draft', desc: 'Erstelle einen Antwortentwurf basierend auf dem Thread.' },
               { title: 'Thread-Zusammenfassung', desc: 'Fasse den Verlauf kurz zusammen.' },
               { title: 'Priorität setzen', desc: 'Schlage Dringlichkeit und Zuständigkeit vor.' },
             ]
           case 'growth':
             return [
               { title: 'Kampagne starten', desc: 'Marketingkampagne inkl. Ziel & Budget vorschlagen.' },
               { title: 'Zielgruppe ableiten', desc: 'Bestimme passende Segmente aus vorhandenen Leads.' },
               { title: 'Hook-Ideen', desc: 'Formuliere 3 Hook-/Headline-Ideen für Ads oder Mailings.' },
             ]
           case 'documents':
             return [
               { title: 'Zusammenfassen', desc: 'Erzeuge eine Kurzzusammenfassung des Dokuments.' },
               { title: 'Risiken erkennen', desc: 'Markiere potenzielle Risiken oder offene Punkte.' },
               { title: 'Tasks extrahieren', desc: 'Liste To-dos und Verantwortliche automatisch auf.' },
             ]
           case 'customers':
             return [
               { title: 'Segment-Vorschlag', desc: 'Clustere Kunden in 3 sinnvolle Segmente.' },
               { title: 'Workflow-Idee', desc: 'Schlage einen neuen Automations-Flow vor.' },
               { title: 'Churn-Warnungen', desc: 'Identifiziere Risikokunden und next-best-action.' },
             ]
           case 'shield':
             return [
               { title: 'PII-Scan', desc: 'Scanne Inhalte auf personenbezogene Daten.' },
               { title: 'Policy-Check', desc: 'Prüfe Texte gegen Compliance-Richtlinien.' },
               { title: 'Risiko-Report', desc: 'Erzeuge einen kurzen Sicherheitsstatus.' },
             ]
           case 'phone':
             return [
               { title: 'Call-Script', desc: 'Erzeuge ein Gesprächsskript für den nächsten Anruf.' },
               { title: 'Follow-up SMS', desc: 'Formuliere eine Follow-up-Nachricht automatisch.' },
               { title: 'Stimmungs-Note', desc: 'Schätze Stimmung & nächste Aktion vor dem Rückruf.' },
             ]
           case 'website':
             return [
               { title: 'FAQ-Idee', desc: 'Schlage neue FAQs basierend auf Besucherfragen vor.' },
               { title: 'SEO-Snippet', desc: 'Erstelle Titel & Meta-Description automatisch.' },
               { title: 'UX-Tipp', desc: 'Gib einen kurzen Optimierungsvorschlag zur Seite.' },
             ]
           default:
             return [
               { title: 'Schnell starten', desc: 'Lass dir einen passenden nächsten Schritt vorschlagen.' },
               { title: 'Zusammenfassung', desc: 'Fasse die wichtigsten Infos kurz zusammen.' },
               { title: 'Nächste Aktion', desc: 'Empfiehl eine clevere Folgeaktion.' },
             ]
         }
       }


       export function ChatWorkspaceShell({ children }: ChatWorkspaceShellProps) {
  const { t } = useTranslation();
  const initialModule: WorkspaceModuleToken = 'chat'
  const [activeModuleToken, setActiveModuleToken] = useState<WorkspaceModuleToken>(initialModule)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const [activeShieldView, setActiveShieldView] = useState<ShieldView>('overview')
  const [activeTelephonyView, setActiveTelephonyView] = useState<TelephonyView>('overview')
  const [activeWebsiteView, setActiveWebsiteView] = useState<WebsiteView>('overview')
  const [activeGrowthView, setActiveGrowthView] = useState<GrowthView>('overview')
  const [activeSettingsView, setActiveSettingsView] = useState<SettingsView>('general')
  const [activeDocumentsView, setActiveDocumentsView] = useState<DocumentsView>('all')
  const [activeCustomersView, setActiveCustomersView] = useState<CustomersView>('all')
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true)
  const [isDashboardOverlayOpen, setIsDashboardOverlayOpen] = useState(false)
  
  // Chat First: Context system for FAB
  const [activeContext, setActiveContext] = useState<{
    type: 'inbox' | 'customer' | 'document' | 'growth' | 'none'
    item: InboxItem | null
    id: string | null
  }>({ type: 'none', item: null, id: null })

  // Accent Color Logic
  useEffect(() => {
    const root = document.documentElement;
    let accentColor = '#007aff'; // Default Blue
    let accentSoft = 'rgba(0, 122, 255, 0.1)';
    // let accentStrong = '#0051d5';

    switch (activeModuleToken) {
      case 'inbox':
      case 'chat':
        accentColor = 'var(--ak-accent-inbox)';
        accentSoft = 'var(--ak-accent-inbox-soft)';
        break;
      case 'customers':
        accentColor = 'var(--ak-accent-customers)';
        accentSoft = 'var(--ak-accent-customers-soft)';
        break;
      case 'documents':
        accentColor = 'var(--ak-accent-documents)';
        accentSoft = 'var(--ak-accent-documents-soft)';
        break;
      case 'growth':
        accentColor = 'var(--ak-accent-growth)';
        accentSoft = 'var(--ak-accent-growth-soft)';
        break;
      case 'shield':
        accentColor = 'var(--ak-accent-shield)';
        accentSoft = 'var(--ak-accent-shield-soft)';
        break;
      case 'phone':
        accentColor = 'var(--ak-accent-phone)';
        accentSoft = 'var(--ak-accent-phone-soft)';
        break;
       case 'website':
        accentColor = 'var(--ak-accent-website)';
        accentSoft = 'var(--ak-accent-website-soft)';
        break;
    }

    // Set globally for components using var(--ak-color-accent)
    root.style.setProperty('--ak-color-accent', accentColor);
    root.style.setProperty('--ak-color-accent-soft', accentSoft);
  }, [activeModuleToken]);

  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedInboxThreadId, setSelectedInboxThreadId] = useState<string | null>(null)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false)

  const handleModuleClick = useCallback((token: WorkspaceModuleToken) => {
    // Chat First: Clear context when switching modules
    setActiveContext({ type: 'none', item: null, id: null })

    if (token === activeModuleToken) {
      // Toggle sidebar if clicking same module
      setLeftDrawerOpen(prev => !prev)
    } else {
      // Switch module and ensure sidebar is open
      setActiveModuleToken(token)
      setLeftDrawerOpen(true)
      
      // Chat First: Always show chat, dashboards via overlay only
      // NEW: Trigger overview card in chat when switching module
      if (token !== 'chat' && token !== 'settings') {
        window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
          detail: { type: token, item: null, id: `overview-${token}` }
        }))
      } else if (token === 'chat') {
        window.dispatchEvent(new CustomEvent('aklow-clear-context'))
      } else if (token === 'settings') {
        // Open settings drawer when switching to settings module
        setIsSettingsDrawerOpen(true)
        window.dispatchEvent(new CustomEvent('aklow-clear-context'))
      }

      // Reset secondary states on module switch only
      setSelectedInboxItem(null)
      setSelectedInboxThreadId(null)
      setSelectedCustomerId(null)
      setSelectedDocumentId(null)
    }
  }, [activeModuleToken])

  const handleNotificationNavigate = useCallback((type: NotificationType, id?: string) => {
    // 1. Reset selection states
    setSelectedInboxItem(null)
    setSelectedInboxThreadId(null)
    setSelectedCustomerId(null)
    setSelectedDocumentId(null)

    // 2. Navigate to module and set context for Chat First
    switch (type) {
      case 'inbox':
        setActiveModuleToken('inbox')
        if (id) {
          const item: InboxItem = {
            id,
            title: 'Nachricht aus Benachrichtigung',
            sender: 'System',
            snippet: 'Details zur Benachrichtigung...',
            time: 'Gerade eben',
            channel: 'email'
          }
          setSelectedInboxThreadId(id)
          setSelectedInboxItem(item)
          // Chat First: Set context, content will be rendered in chat
          setActiveContext({ type: 'inbox', item, id })
        }
        break
      case 'customer':
        setActiveModuleToken('customers')
        if (id) {
          setSelectedCustomerId(id)
          setActiveContext({ type: 'customer', item: null, id })
        }
        break
      case 'document':
        setActiveModuleToken('documents')
        if (id) {
          setSelectedDocumentId(id)
          setActiveContext({ type: 'document', item: null, id })
        }
        break
      case 'review':
        setActiveModuleToken('inbox')
        if (id) {
          const item: InboxItem = {
            id,
            title: 'Bewertung aus Benachrichtigung',
            sender: 'Google Reviews',
            snippet: 'Details zur Bewertung...',
            time: 'Gerade eben',
            channel: 'reviews'
          }
          setSelectedInboxThreadId(id)
          setSelectedInboxItem(item)
          setActiveContext({ type: 'inbox', item, id })
        }
        break
      case 'growth':
        setActiveModuleToken('growth')
        if (id) {
          setActiveContext({ type: 'growth', item: null, id })
        }
        break
    }
  }, [])

  // Chat First: Toggle dashboard overlay (Info button in sidebar)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleToggleDashboardOverlay = useCallback(() => {
    setIsDashboardOverlayOpen(prev => !prev)
  }, [])

  // Register global Cmd+K shortcut via event from KeyboardShortcutsProvider
  useEffect(() => {
    const handleTogglePalette = () => {
      setIsCommandPaletteOpen((prev) => !prev)
    }
    window.addEventListener('aklow-toggle-command-palette', handleTogglePalette)
    return () => window.removeEventListener('aklow-toggle-command-palette', handleTogglePalette)
  }, [])

  // Global ESC Handler (Prioritized closing)
  useEffect(() => {
    const handleEscape = () => {
      // 1) Command Palette
      if (isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false)
        return
      }
      // 2) Dashboard Overlay
      if (isDashboardOverlayOpen) {
        setIsDashboardOverlayOpen(false)
        return
      }
      // 3) Notification Center
      if (isNotificationCenterOpen) {
        setIsNotificationCenterOpen(false)
        return
      }
      // 4) Clear active context
      if (activeContext.type !== 'none') {
        setActiveContext({ type: 'none', item: null, id: null })
        return
      }
    }

    window.addEventListener('ak-escape-pressed', handleEscape)
    return () => window.removeEventListener('ak-escape-pressed', handleEscape)
  }, [
    isCommandPaletteOpen, 
    isDashboardOverlayOpen,
    isNotificationCenterOpen, 
    activeContext
  ])

  const commandContext: CommandContext = useMemo(() => ({
    activeModuleToken,
    activeSettingsView,
    activeDocumentsView,
    selectedDocumentId,
    selectedInboxItem,
    selectedInboxThreadId,
    showRightDrawer: false, // Chat First: No right drawer
  }), [
    activeModuleToken, 
    activeSettingsView, 
    activeDocumentsView, 
    selectedDocumentId, 
    selectedInboxItem, 
    selectedInboxThreadId
  ])

  const allCommands = useMemo(() => buildCommands(commandContext), [commandContext])


  // Event-Listener für Modul-Öffnung von außen (z.B. Bell-Icon)
  useEffect(() => {
    const handleOpenModule = (e: CustomEvent<{ module: WorkspaceModuleToken }>) => {
      if (e.detail?.module) {
        handleModuleClick(e.detail.module)
      }
    }

    const handleOpenSettingsView = (e: CustomEvent<{ view: SettingsView }>) => {
      if (e.detail?.view) {
        setActiveSettingsView(e.detail.view)
        setActiveModuleToken('settings')
      }
    }

    const handleOpenDocumentsView = (e: CustomEvent<{ view: DocumentsView }>) => {
      if (e.detail?.view) {
        setActiveDocumentsView(e.detail.view)
        setActiveModuleToken('documents')
      }
    }

    const handleToggleDrawer = () => setIsDashboardOverlayOpen(prev => !prev) // Chat First: Toggle dashboard overlay instead
    const handleShowShortcuts = () => {
      // Trigger global show shortcuts (KeyboardShortcutsProvider handles the UI)
      window.dispatchEvent(new CustomEvent('aklow-toggle-shortcuts'))
    }
    const handleToggleTheme = () => {
      console.log('Theme toggle triggered (mock)')
      // TODO: Implement theme switch logic
    }

    // Chat First: Actions now prefill chat instead of opening drawers
    const handleRunShieldAction = (e: CustomEvent<{ action: string }>) => {
      console.log('Shield action:', e.detail.action)
      setActiveModuleToken('shield')
      // Prefill chat with action
      window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
        detail: { prompt: `Shield: ${e.detail.action}`, context: 'shield' }
      }))
    }

    const handleRunDocumentsAction = (e: CustomEvent<{ action: string }>) => {
      console.log('Documents action:', e.detail.action)
      setActiveModuleToken('documents')
      if (e.detail.action === 'summarize' || e.detail.action === 'ask' || e.detail.action === 'extract') {
        if (!selectedDocumentId) {
          alert('Bitte wähle zuerst ein Dokument aus.')
        } else {
          window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
            detail: { prompt: `Dokument: ${e.detail.action}`, context: 'document', documentId: selectedDocumentId }
          }))
        }
      }
    }

    const handleRunSettingsAction = (e: CustomEvent<{ action: string }>) => {
      console.log('Settings action:', e.detail.action)
      setActiveModuleToken('settings')
      // Settings don't need chat prefill
    }

    const handleRunPhoneAction = (e: CustomEvent<{ action: string }>) => {
      console.log('Phone action:', e.detail.action)
      setActiveModuleToken('phone')
      window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
        detail: { prompt: `Telefonie: ${e.detail.action}`, context: 'phone' }
      }))
    }

    const handleRunWebsiteAction = (e: CustomEvent<{ action: string }>) => {
      console.log('Website action:', e.detail.action)
      setActiveModuleToken('website')
      window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
        detail: { prompt: `Website: ${e.detail.action}`, context: 'website' }
      }))
    }

    window.addEventListener(AKLOW_EVENTS.OPEN_MODULE, handleOpenModule as EventListener)
    window.addEventListener(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, handleOpenSettingsView as EventListener)
    window.addEventListener(AKLOW_EVENTS.OPEN_DOCUMENTS_VIEW, handleOpenDocumentsView as EventListener)
    window.addEventListener(AKLOW_EVENTS.TOGGLE_DRAWER, handleToggleDrawer as EventListener)
    window.addEventListener(AKLOW_EVENTS.SHOW_SHORTCUTS, handleShowShortcuts as EventListener)
    window.addEventListener(AKLOW_EVENTS.TOGGLE_THEME, handleToggleTheme as EventListener)
    window.addEventListener(AKLOW_EVENTS.RUN_SHIELD_ACTION, handleRunShieldAction as EventListener)
    window.addEventListener(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, handleRunDocumentsAction as EventListener)
    window.addEventListener(AKLOW_EVENTS.RUN_SETTINGS_ACTION, handleRunSettingsAction as EventListener)
    window.addEventListener(AKLOW_EVENTS.RUN_PHONE_ACTION, handleRunPhoneAction as EventListener)
    window.addEventListener(AKLOW_EVENTS.RUN_WEBSITE_ACTION, handleRunWebsiteAction as EventListener)
    
    // Support toggle from anywhere
    window.addEventListener('aklow-toggle-command-palette', (() => setIsCommandPaletteOpen(prev => !prev)) as EventListener)

    return () => {
      window.removeEventListener(AKLOW_EVENTS.OPEN_MODULE, handleOpenModule as EventListener)
      window.removeEventListener(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, handleOpenSettingsView as EventListener)
      window.removeEventListener(AKLOW_EVENTS.OPEN_DOCUMENTS_VIEW, handleOpenDocumentsView as EventListener)
      window.removeEventListener(AKLOW_EVENTS.TOGGLE_DRAWER, handleToggleDrawer as EventListener)
      window.removeEventListener(AKLOW_EVENTS.SHOW_SHORTCUTS, handleShowShortcuts as EventListener)
      window.removeEventListener(AKLOW_EVENTS.TOGGLE_THEME, handleToggleTheme as EventListener)
      window.removeEventListener(AKLOW_EVENTS.RUN_SHIELD_ACTION, handleRunShieldAction as EventListener)
      window.removeEventListener(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, handleRunDocumentsAction as EventListener)
      window.removeEventListener(AKLOW_EVENTS.RUN_SETTINGS_ACTION, handleRunSettingsAction as EventListener)
      window.removeEventListener(AKLOW_EVENTS.RUN_PHONE_ACTION, handleRunPhoneAction as EventListener)
      window.removeEventListener(AKLOW_EVENTS.RUN_WEBSITE_ACTION, handleRunWebsiteAction as EventListener)
    }
  }, [
    handleModuleClick, 
    activeSettingsView, 
    activeDocumentsView, 
    selectedDocumentId
  ])

  // Chat First: Listen for context card events (render content in chat)
  useEffect(() => {
    const handleShowContextCard = (event: CustomEvent<{ type: string; item: InboxItem | null; id: string }>) => {
      const { type, item, id } = event.detail
      setActiveContext({ type: type as 'inbox' | 'customer' | 'document' | 'growth', item, id })
    }

    window.addEventListener('aklow-show-context-card', handleShowContextCard as EventListener)
    return () => window.removeEventListener('aklow-show-context-card', handleShowContextCard as EventListener)
  }, [])

  // Chat First: Info button opens dashboard overlay
  const handleToggleInspector = useCallback(() => {
    setIsDashboardOverlayOpen(prev => !prev)
  }, [])

  // Chat First: Item clicks set context and trigger context card in chat
  const handleInboxItemClick = (item: InboxItem) => {
    const threadId = item.threadId || item.id
    if (selectedInboxThreadId === threadId && activeContext.type === 'inbox') {
      // Deselect if clicking same item
      setSelectedInboxItem(null)
      setSelectedInboxThreadId(null)
      setActiveContext({ type: 'none', item: null, id: null })
    } else {
      setSelectedInboxItem(item)
      setSelectedInboxThreadId(threadId)
      // Chat First: Set context, FAB will show actions, chat will show content
      setActiveContext({ type: 'inbox', item, id: threadId })
      // Dispatch event to show context card in chat
      window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
        detail: { type: 'inbox', item, id: threadId }
      }))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleCustomerClick = (customerId: string) => {
    if (selectedCustomerId === customerId && activeContext.type === 'customer') {
      setSelectedCustomerId(null)
      setActiveContext({ type: 'none', item: null, id: null })
    } else {
      setSelectedCustomerId(customerId)
      setActiveContext({ type: 'customer', item: null, id: customerId })
      window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
        detail: { type: 'customer', item: null, id: customerId }
      }))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDocumentClick = (docId: string) => {
    if (selectedDocumentId === docId && activeContext.type === 'document') {
      setSelectedDocumentId(null)
      setActiveContext({ type: 'none', item: null, id: null })
    } else {
      setSelectedDocumentId(docId)
      setActiveContext({ type: 'document', item: null, id: docId })
      window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
        detail: { type: 'document', item: null, id: docId }
      }))
    }
  }

  // Chat First: No inspector content needed - everything renders in chat

  // Mobile detection
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // No more splitting, just primary modules (all except settings)
  const primaryModules = MODULES.filter(m => m.id !== 'settings')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const settingsModule = MODULES.find(m => m.id === 'settings')!

  const tooltipClasses = "absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap"
  // const cornerTooltipClasses = "absolute top-full right-0 mt-2 px-2.5 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap" // Reserved for future use

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-[var(--ak-color-text-primary)]">
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        commands={allCommands} 
      />
      <aside suppressHydrationWarning className="hidden md:flex w-16 flex-col items-center py-4 text-[var(--ak-color-text-secondary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] border-r border-slate-100 bg-[#F9FAFB] z-50">
        
        <div suppressHydrationWarning className="flex flex-1 flex-col items-center w-full gap-3 py-2">
            {/* All Modules */}
            {primaryModules.map((mod) => {
                const Icon = mod.icon
                const isActive = mod.id === activeModuleToken

                return (
                <div key={mod.id} className="relative group flex justify-center w-full">
                    <button
                    type="button"
                    onClick={() => handleModuleClick(mod.id)}
                    className={clsx(
                        'relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                        isActive
                        ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                        : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                    )}
                    >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--ak-color-accent)] rounded-r-full" />
                    )}
                    <span className="sr-only">{mod.label}</span>
                    <Icon className="h-6 w-6 stroke-[1.5]" aria-hidden={true} />
                    </button>
                    
                    <span className={tooltipClasses}>
                        {mod.label}
                        <svg className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px] text-gray-900 h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 0l-24 12 24 12z" />
                        </svg>
                    </span>
                </div>
                )
            })}
        </div>

      <div className="flex flex-col items-center w-full mt-auto gap-3 pb-2">
        {/* Settings bottom-pinned */}
        <div suppressHydrationWarning className="relative group flex justify-center w-full">
            <button
                type="button"
                onClick={() => handleModuleClick('settings')}
                className={clsx(
                    'relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                    activeModuleToken === 'settings'
                    ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                    : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                )}
                aria-label={t('workspace.settings')}
            >
                {activeModuleToken === 'settings' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--ak-color-accent)] rounded-r-full" />
                )}
                <Cog6ToothIcon className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
            </button>
            
            <span className={tooltipClasses}>
                {t('workspace.settings')}
                <svg className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px] text-gray-900 h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 0l-24 12 24 12z" />
                </svg>
            </span>
        </div>
      </div>
    </aside>

      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Right Actions */}
        <div className="absolute right-4 top-4 z-50 flex items-center gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2">
             {/* Bell Icon - Only show in chat module */}
             {activeModuleToken === 'chat' && (
                <button
                  type="button"
                  onClick={() => setIsNotificationCenterOpen(prev => !prev)}
                  className="flex items-center justify-center p-2 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors"
                  title={t('workspace.notifications')}
                >
                  <BellIcon className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
                </button>
             )}
          </div>
        </div>


        <main className="relative flex-1 overflow-hidden min-w-0 w-full flex flex-row">
          <div
            className="relative flex-1 h-full min-w-0 transition-all duration-200 ease-out overflow-x-hidden box-border"
          >
            {/* Main Content is ALWAYS the Chat (children), regardless of active module token 
                This ensures "Chat First" logic. The sidebar changes, but the main view stays chat.
                Exceptions: If the user specifically wants a full page dashboard, but they said "Rechts immer der Chat offen".
                So we render the Sidebar based on module, and children in center.
            */}
             <div className="flex h-full w-full bg-white">
                {leftDrawerOpen && (
                  <div className="w-[280px] h-full border-r border-slate-100 bg-[#F9FAFB] flex-shrink-0" suppressHydrationWarning>
                     {activeModuleToken === 'chat' && (
                       <div suppressHydrationWarning>
                         <ChatSidebarContent onToggleInspector={handleToggleInspector} />
                       </div>
                     )}
                     {activeModuleToken === 'inbox' && (
                        <InboxDrawerWidget 
                          onItemClick={handleInboxItemClick} 
                          activeThreadId={selectedInboxThreadId}
                          onToggleInspector={handleToggleInspector}
                        />
                     )}
                     {activeModuleToken === 'growth' && (
                        <GrowthSidebarWidget 
                          activeView={activeGrowthView} 
                          onToggleInspector={handleToggleInspector}
                          onViewSelect={(v) => {
                            setActiveGrowthView(v)
                            window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                              detail: { type: 'growth', item: null, id: v }
                            }))
                          }} 
                        />
                     )}
                     {activeModuleToken === 'documents' && (
                        <DocumentsSidebarWidget 
                          activeView={activeDocumentsView} 
                          onToggleInspector={handleToggleInspector}
                          onViewSelect={(v) => {
                            setActiveDocumentsView(v)
                            window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                              detail: { type: 'document', item: null, id: v }
                            }))
                          }} 
                        />
                     )}
                     {activeModuleToken === 'customers' && (
                        <CustomersSidebarWidget 
                          activeView={activeCustomersView} 
                          onToggleInspector={handleToggleInspector}
                          onViewSelect={(v) => {
                            setActiveCustomersView(v)
                            window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                              detail: { type: 'customer', item: null, id: v }
                            }))
                          }} 
                        />
                     )}
                     {activeModuleToken === 'shield' && (
                        <ShieldSidebarWidget 
                          activeView={activeShieldView} 
                          onToggleInspector={handleToggleInspector}
                          onViewSelect={(v) => {
                            setActiveShieldView(v)
                            window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                              detail: { type: 'shield', item: null, id: v }
                            }))
                          }} 
                        />
                     )}
                     {activeModuleToken === 'phone' && (
                        <TelephonySidebarWidget 
                          activeView={activeTelephonyView}
                          onToggleInspector={handleToggleInspector}
                          onViewSelect={(v) => {
                            setActiveTelephonyView(v)
                            window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                              detail: { type: 'phone', item: null, id: v }
                            }))
                          }}
                        />
                     )}
                     {activeModuleToken === 'website' && (
                        <WebsiteSidebarWidget 
                          activeView={activeWebsiteView} 
                          onToggleInspector={handleToggleInspector}
                          onViewSelect={(v) => {
                            setActiveWebsiteView(v)
                            window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                              detail: { type: 'website', item: null, id: v }
                            }))
                          }}
                        />
                     )}
                     {activeModuleToken === 'settings' && (
                        <SettingsSidebarWidget 
                          activeView={activeSettingsView} 
                          onToggleInspector={handleToggleInspector}
                          onViewSelect={(v) => {
                            setActiveSettingsView(v)
                            setIsSettingsDrawerOpen(true)
                          }} 
                        />
                     )}
                  </div>
                )}
                {/* Chat First: Main content area - Chat takes full width */}
                <div className="flex-1 h-full min-w-0 overflow-hidden relative flex">
                  <div className="flex-1 h-full min-w-0 overflow-hidden relative">
                    {children}
                    
                    {/* Chat First: FAB for context actions */}
                    <ChatFirstFAB 
                      context={activeContext}
                      onAction={(action) => {
                        // Prefill chat with action
                        window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
                          detail: { 
                            prompt: action.prompt,
                            context: activeContext.type,
                            item: activeContext.item,
                            id: activeContext.id
                          }
                        }))
                      }}
                    />
                  </div>

                  {/* Settings Detail Drawer - Right side */}
                  {activeModuleToken === 'settings' && (
                    <SettingsDetailDrawer
                      view={activeSettingsView}
                      isOpen={isSettingsDrawerOpen}
                      onClose={() => setIsSettingsDrawerOpen(false)}
                    />
                  )}
                </div>
            </div>
          </div>
        </main>
      </div>

      {/* Chat First: Dashboard Overlay (replaces right drawers) */}
      <DashboardOverlay
        isOpen={isDashboardOverlayOpen}
        onClose={() => setIsDashboardOverlayOpen(false)}
        activeModule={activeModuleToken}
        views={{
          growth: activeGrowthView,
          documents: activeDocumentsView,
          customers: activeCustomersView,
          shield: activeShieldView,
          phone: activeTelephonyView,
          website: activeWebsiteView,
          settings: activeSettingsView,
        }}
      />

      <NotificationCenterDrawer 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNavigate={handleNotificationNavigate}
      />
    </div>
  )
}