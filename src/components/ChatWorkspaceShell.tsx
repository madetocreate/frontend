'use client'

import type { ReactNode, ComponentType, CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import clsx from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MegaphoneIcon,
  DocumentIcon,
  UserGroupIcon,
  InformationCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
  PhoneIcon,
  GlobeAltIcon,
  EllipsisHorizontalIcon,
  Squares2X2Icon,
  CloudArrowUpIcon,
  ClockIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  HeartIcon,
  RectangleStackIcon,
  SparklesIcon,
  AcademicCapIcon,
  StarIcon,
  CakeIcon,
} from '@heroicons/react/24/outline'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent'
import { ChatOverviewWidget } from '@/components/chat/ChatOverviewWidget'
import { InboxDrawerWidget } from '@/components/InboxDrawerWidget'
import { ShieldSidebarWidget, ShieldView } from '@/components/shield/ShieldSidebarWidget'
import { ShieldDashboard } from '@/components/shield/ShieldDashboard'
import { TelephonySidebarWidget, TelephonyView } from '@/components/telephony/TelephonySidebarWidget'
import { TelephonyDashboard } from '@/components/telephony/TelephonyDashboard'
import { WebsiteSidebarWidget, WebsiteView } from '@/components/website/WebsiteSidebarWidget'
import { WebsiteDashboard } from '@/components/website/WebsiteDashboard'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { InboxDetailPanel } from '@/components/InboxDetailPanel'
import { InboxDetailsDrawer } from '@/components/InboxDetailsDrawer'
import { NotificationsSidebarWidget } from '@/components/notifications/NotificationsSidebarWidget'
import { NotificationsSettingsDrawer } from '@/components/notifications/NotificationsSettingsDrawer'
import { SettingsSidebarWidget, SettingsView } from '@/components/settings/SettingsSidebarWidget'
import { SettingsDashboard } from '@/components/settings/SettingsDashboard'
import { SettingsDetailPanel, type SettingsCategory } from '@/components/SettingsDetailPanel'
import type { MemoryCategory } from '@/components/MemorySidebarWidget'
import { MemoryDetailPanel } from '@/components/MemoryDetailPanel'
import { AutomationDetailPanel } from '@/components/AutomationDetailPanel'
import { GrowthSidebarWidget, GrowthView } from '@/components/growth/GrowthSidebarWidget'
import { GrowthDashboard } from '@/components/growth/GrowthDashboard'
import { DocumentsSidebarWidget, DocumentsView } from '@/components/documents/DocumentsSidebarWidget'
import { DocumentsDashboard } from '@/components/documents/DocumentsDashboard'
import { CustomersSidebarWidget, CustomersView } from '@/components/customers/CustomersSidebarWidget'
import { CustomersDashboard } from '@/components/customers/CustomersDashboard'
import { CustomerDetailsDrawer } from '@/components/customers/CustomerDetailsDrawer'
import { GrowthDetailsDrawer } from '@/components/growth/GrowthDetailsDrawer'
import { DocumentDetailsDrawer } from '@/components/documents/DocumentDetailsDrawer'
import IntegrationsDashboard from '@/components/integrations/IntegrationsDashboard'
import MarketplaceDashboard from '@/components/marketplace/MarketplaceDashboard'
import { PracticeSidebarWidget, type PracticeView } from '@/components/practice/PracticeSidebarWidget'
import { PracticeDashboard } from '@/components/practice/PracticeDashboard'
import { RealEstateSidebarWidget, type RealEstateView } from '@/components/realestate/RealEstateSidebarWidget'
import { RealEstateDashboard } from '@/components/realestate/RealEstateDashboard'
import { HotelSidebarWidget, type HotelView } from '@/components/hotel/HotelSidebarWidget'
import { HotelDashboard } from '@/components/hotel/HotelDashboard'
import { HotelKeyboardShortcuts } from '@/components/hotel/HotelKeyboardShortcuts'
import { ReviewProfiSidebarWidget, type ReviewProfiView } from '@/components/reviews/ReviewProfiSidebarWidget'
import { ReviewProfiDashboard } from '@/components/reviews/ReviewProfiDashboard'
import { GastronomieSidebarWidget, type GastronomieView } from '@/components/gastronomie/GastronomieSidebarWidget'
import { GastronomieDashboard } from '@/components/gastronomie/GastronomieDashboard'
import { AIActionWizard } from '@/components/ui/AIActionWizard'
import type { AIAction, AIActionContext } from '@/components/ui/AIActions'
import { UserMenu } from '@/components/UserMenu'



type WorkspaceModuleToken =
  | 'chat'
  | 'shield'
  | 'phone'
  | 'website'
  | 'inbox'
  | 'new1'
  | 'new2'
  | 'automation'
  | 'notifications'
  | 'settings'
  | 'integrations'
  | 'marketplace'
  | 'practice'
  | 'realestate'
  | 'hotel'
  | 'reviews'
  | 'gastronomie'

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
  { id: 'new1', label: 'Wachstum', icon: MegaphoneIcon },
  { id: 'automation', label: 'Kunden', icon: UserGroupIcon },
  { id: 'shield', label: 'AI Shield', icon: ShieldCheckIcon },
  { id: 'website', label: 'Website', icon: GlobeAltIcon },
  { id: 'phone', label: 'Telefon', icon: PhoneIcon },
  { id: 'integrations', label: 'Integrationen', icon: Squares2X2Icon, href: '/integrations' },
  { id: 'marketplace', label: 'Marktplatz', icon: ShoppingBagIcon, href: '/marketplace' },
  { id: 'practice', label: 'Praxis', icon: HeartIcon },
  { id: 'realestate', label: 'Immobilien', icon: BuildingOfficeIcon },
  { id: 'hotel', label: 'Hotel & Gastgewerbe', icon: BuildingOffice2Icon },
  { id: 'reviews', label: 'Review Profi', icon: StarIcon },
  { id: 'gastronomie', label: 'Gastronomie', icon: CakeIcon },
]

// Layout-Konstanten
// Linker Rail (Icons): 64px (Tailwind w-16)
const LEFT_RAIL_WIDTH = '64px'
// Linkes Panel Breite (Pixelgenau für Apple-Style Präzision)
const LEFT_DRAWER_WIDTH = '320px'
// Rechtes Panel Breite (Inspector/Drawer)
const RIGHT_DRAWER_WIDTH = '420px'
const MIN_INSPECTOR_WIDTH = 320

type AiAction = { title: string; desc: string }

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
    case 'new1':
      return [
        { title: 'Kampagne starten', desc: 'Marketingkampagne inkl. Ziel & Budget vorschlagen.' },
        { title: 'Zielgruppe ableiten', desc: 'Bestimme passende Segmente aus vorhandenen Leads.' },
        { title: 'Hook-Ideen', desc: 'Formuliere 3 Hook-/Headline-Ideen für Ads oder Mailings.' },
      ]
    case 'new2':
      return [
        { title: 'Zusammenfassen', desc: 'Erzeuge eine Kurzzusammenfassung des Dokuments.' },
        { title: 'Risiken erkennen', desc: 'Markiere potenzielle Risiken oder offene Punkte.' },
        { title: 'Tasks extrahieren', desc: 'Liste To-dos und Verantwortliche automatisch auf.' },
      ]
    case 'automation':
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
    case 'notifications':
      return [
        { title: 'Alarm-Regel', desc: 'Empfohlene Benachrichtigungsregel für wichtige Events.' },
        { title: 'Ruhigzeiten', desc: 'Schlage stille Zeiten für weniger Lärm vor.' },
        { title: 'Kanäle optimieren', desc: 'Empfiehl passende Kanäle je Ereignis.' },
      ]
    default:
      return [
        { title: 'Schnell starten', desc: 'Lass dir einen passenden nächsten Schritt vorschlagen.' },
        { title: 'Zusammenfassung', desc: 'Fasse die wichtigsten Infos kurz zusammen.' },
        { title: 'Nächste Aktion', desc: 'Empfiehl eine clevere Folgeaktion.' },
      ]
  }
}

const AIActionStrip = ({
  token,
  label = 'KI Vorschläge',
  compact = false,
}: {
  token: WorkspaceModuleToken
  label?: string
  compact?: boolean
}) => {
  const actions = getAiActions(token)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleActionClick = (title: string, desc: string) => {
    // Frontend-only wiring: no backend call here
    try {
      setFeedback(`Ausgeführt: ${title}`)
      window.dispatchEvent(
        new CustomEvent('aklow-ai-action', { detail: { token, title, desc, source: 'frontend-only' } })
      )
    } catch {
      setFeedback(`Aktion: ${title}`)
    } finally {
      setTimeout(() => setFeedback(null), 2200)
    }
  }

  return (
    <div className={compact ? 'mb-3' : 'mb-4'}>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleActionClick(action.title, action.desc)}
            className="text-left rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            <div className="text-sm font-semibold text-gray-900">{action.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{action.desc}</div>
          </button>
        ))}
      </div>
      {feedback && (
        <div className="mt-2 px-1 text-[11px] font-semibold text-blue-600">
          {feedback}
        </div>
      )}
    </div>
  )
}

function getModuleLabel(token: WorkspaceModuleToken): string {
  const match = MODULES.find((m) => m.id === token)
  if (match) return match.label

  if (token === 'settings') return 'Einstellungen'
  if (token === 'shield') return 'AI Shield'
  if (token === 'phone') return 'Telefon-Assistent'
  if (token === 'website') return 'Website-Bot'
  if (token === 'notifications') return 'Benachrichtigungen'
  if (token === 'new1') return 'Wachstum'
  if (token === 'new2') return 'Dokumente'
  if (token === 'integrations') return 'Integrationen'
  if (token === 'marketplace') return 'Marktplatz'
  if (token === 'practice') return 'Praxis'
  if (token === 'realestate') return 'Immobilien'
  if (token === 'hotel') return 'Hotel & Gastgewerbe'
  return token
}

type ChatWorkspaceShellProps = {
  children: ReactNode
}

export function ChatWorkspaceShell({ children }: ChatWorkspaceShellProps) {
  const initialModule: WorkspaceModuleToken = 'chat'

  const [activeModuleToken, setActiveModuleToken] =
    useState<WorkspaceModuleToken>(initialModule)
  const [activeShieldView, setActiveShieldView] = useState<ShieldView>('overview')
  const [activeTelephonyView, setActiveTelephonyView] = useState<TelephonyView>('overview')
  const [activeWebsiteView, setActiveWebsiteView] = useState<WebsiteView>('overview')
  const [activeGrowthView, setActiveGrowthView] = useState<GrowthView>('overview')
  const [activeSettingsView, setActiveSettingsView] = useState<SettingsView>('general')
  const [activeDocumentsView, setActiveDocumentsView] = useState<DocumentsView>('all')
  const [activeCustomersView, setActiveCustomersView] = useState<CustomersView>('all')
  const [activePracticeView, setActivePracticeView] = useState<PracticeView>('overview')
  const [activeRealEstateView, setActiveRealEstateView] = useState<RealEstateView>('overview')
  const [activeHotelView, setActiveHotelView] = useState<HotelView>('overview')
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showDashboardsMenu, setShowDashboardsMenu] = useState(false)
  const [showWizardsMenu, setShowWizardsMenu] = useState(false)
  const [aiActionWizardOpen, setAiActionWizardOpen] = useState(false)
  const [aiActionWizardContext, setAiActionWizardContext] = useState<AIActionContext>('inbox')
  const [aiActionWizardAction, setAiActionWizardAction] = useState<AIAction | null>(null)
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
  const [showAutomationOverview, setShowAutomationOverview] = useState(false)
  const [showShieldOverview, setShowShieldOverview] = useState(false)
  const [showTelephonyOverview, setShowTelephonyOverview] = useState(false)
  const [showWebsiteOverview, setShowWebsiteOverview] = useState(false)
  const [showChatOverview, setShowChatOverview] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [inspectorExpanded, setInspectorExpanded] = useState(false)
  const [inspectorWidth, setInspectorWidth] = useState<number>(parseFloat(RIGHT_DRAWER_WIDTH))
  const [isResizingInspector, setIsResizingInspector] = useState(false)
  const inspectorRef = useRef<HTMLDivElement | null>(null)
  
  // Apps Menu State
  const [appsMenuOpen, setAppsMenuOpen] = useState(false)

  const closeRightDrawer = () => {
    setRightDrawerOpen(false)
    setInspectorExpanded(false)
  }

  const handleModuleClick = (token: WorkspaceModuleToken) => {
    // Notifications öffnen - linke Sidebar öffnen, rechte leer lassen
    if (token === 'notifications') {
      const wasNotifications = activeModuleToken === 'notifications'
      setActiveModuleToken('notifications')
      setShowNotifications(true)
      setLeftDrawerOpen((prev) => {
        if (prev && wasNotifications) {
          return false
        }
        return true
      })
      // Rechten Drawer schließen
      closeRightDrawer()
      return
    }

    // Integrations und Marketplace: Linke Sidebar schließen, direkt zur Seite
    if (token === 'integrations' || token === 'marketplace') {
      setActiveModuleToken(token)
      setShowNotifications(false)
      setLeftDrawerOpen(false)
      closeRightDrawer()
      // Navigation zur Seite (falls href vorhanden)
      if (token === 'integrations' && typeof window !== 'undefined') {
        window.location.href = '/integrations'
      } else if (token === 'marketplace' && typeof window !== 'undefined') {
        window.location.href = '/marketplace'
      }
      return
    }

    setActiveModuleToken(token)
    setShowNotifications(false) // Reset notifications when switching modules

    setLeftDrawerOpen((prev) => {
      if (prev && activeModuleToken === token) {
        return false
      }
      return true
    })

    // Rechten Drawer schließen beim Modulwechsel
    closeRightDrawer()

    setSelectedInboxItem(null)
    setSelectedInboxThreadId(null)
    setSelectedSettingsCategory(null)
    setSelectedAutomationItem(null)
    setSelectedMemoryCategory(null)
    setSelectedCustomerId(null)
    setSelectedGrowthItemId(null)
    setSelectedDocumentId(null)
    // Shield View behalten wir bei
    setShowInboxOverview(false)
    setShowGrowthOverview(false)
    setShowDocumentsOverview(false)
    setShowAutomationOverview(false)
    setShowShieldOverview(false)
    setShowTelephonyOverview(false)
    setShowWebsiteOverview(false)
  }

  const handleNotificationsInfoClick = () => {
    // Toggle rechten Drawer für Notifications
    if (rightDrawerOpen && showNotifications) {
      closeRightDrawer()
    } else {
      setRightDrawerOpen(true)
      // Alle anderen States zurücksetzen
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
      setShowAutomationOverview(false)
      setShowShieldOverview(false)
      setShowTelephonyOverview(false)
      setShowWebsiteOverview(false)
      setShowNotifications(true)
    }
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
              closeRightDrawer()
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

    // Command Palette Event Handlers
    const handleArchiveThread = () => {
      // Trigger archive for active thread - handled by ChatSidebarContent
      window.dispatchEvent(new CustomEvent('aklow-archive-thread-command'))
    }

    const handleDeleteThread = () => {
      // Trigger delete for active thread - handled by ChatSidebarContent
      window.dispatchEvent(new CustomEvent('aklow-delete-thread-command'))
    }

    const handleRenameThread = () => {
      // Trigger rename for active thread - handled by ChatSidebarContent
      window.dispatchEvent(new CustomEvent('aklow-rename-thread-command'))
    }

    const handleFocusThreadSearch = () => {
      // Focus on thread search in sidebar
      try {
        const searchInput = document.querySelector('input[placeholder*="Suchen"], input[placeholder*="suchen"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      } catch {
        // Ignore selector errors
      }
    }

    const handleToggleSidebar = () => {
      setLeftDrawerOpen((prev) => !prev)
    }

    const handleToggleDrawer = () => {
      setRightDrawerOpen((prev) => !prev)
    }

    const handleShowNotifications = () => {
      setShowNotifications(true)
      setRightDrawerOpen(true)
      setLeftDrawerOpen(false)
      setActiveModuleToken('inbox')
    }

    // Quick Actions - switch to chat and forward to ChatShell
    const handleQuickAction = (e: CustomEvent<{ actionId: string }>) => {
      const actionId = e.detail?.actionId
      if (actionId) {
        // Switch to chat module
        setActiveModuleToken('chat')
        setLeftDrawerOpen(false)
        // Forward to ChatShell (it will handle the message)
      }
    }

    window.addEventListener('aklow-archive-thread-command', handleArchiveThread as EventListener)
    window.addEventListener('aklow-delete-thread-command', handleDeleteThread as EventListener)
    window.addEventListener('aklow-rename-thread-command', handleRenameThread as EventListener)
    window.addEventListener('aklow-focus-thread-search', handleFocusThreadSearch as EventListener)
    window.addEventListener('aklow-toggle-sidebar', handleToggleSidebar as EventListener)
    window.addEventListener('aklow-toggle-drawer', handleToggleDrawer as EventListener)
    window.addEventListener('aklow-show-notifications', handleShowNotifications as EventListener)
    window.addEventListener('aklow-send-quick-action', handleQuickAction as EventListener)

    return () => {
      window.removeEventListener('aklow-open-module', handleOpenModule as EventListener)
      window.removeEventListener('aklow-archive-thread-command', handleArchiveThread as EventListener)
      window.removeEventListener('aklow-delete-thread-command', handleDeleteThread as EventListener)
      window.removeEventListener('aklow-rename-thread-command', handleRenameThread as EventListener)
      window.removeEventListener('aklow-focus-thread-search', handleFocusThreadSearch as EventListener)
      window.removeEventListener('aklow-toggle-sidebar', handleToggleSidebar as EventListener)
      window.removeEventListener('aklow-toggle-drawer', handleToggleDrawer as EventListener)
      window.removeEventListener('aklow-show-notifications', handleShowNotifications as EventListener)
      window.removeEventListener('aklow-send-quick-action', handleQuickAction as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close dashboards menu when clicking outside
  useEffect(() => {
    if (!showDashboardsMenu) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dashboards-menu]')) {
        setShowDashboardsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDashboardsMenu])

  // Close wizards menu when clicking outside
  useEffect(() => {
    if (!showWizardsMenu) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-wizards-menu]')) {
        setShowWizardsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showWizardsMenu])

  // Hotel Keyboard Shortcuts (separate useEffect)
  useEffect(() => {
    if (activeModuleToken !== 'hotel') return

    const handleHotelShortcuts = (e: KeyboardEvent) => {
      // Cmd/Ctrl + 1-9 für Navigation
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const views: HotelView[] = ['overview', 'reservations', 'rooms', 'restaurant', 'events', 'guests', 'revenue', 'marketing', 'reports']
        const index = parseInt(e.key) - 1
        if (views[index]) {
          setActiveHotelView(views[index])
        }
      }
      
      // Cmd/Ctrl + / für Shortcuts anzeigen
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
    }

    window.addEventListener('keydown', handleHotelShortcuts)
    return () => window.removeEventListener('keydown', handleHotelShortcuts)
  }, [activeModuleToken, setActiveHotelView, setShowKeyboardShortcuts])

  // Listen for AI Action Wizard events
  useEffect(() => {
    const handleAIActionWizard = (event: CustomEvent) => {
      const { context, action } = event.detail
      setAiActionWizardContext(context)
      setAiActionWizardAction(action)
      setAiActionWizardOpen(true)
    }

    window.addEventListener('aklow-ai-action-wizard', handleAIActionWizard as EventListener)
    return () => {
      window.removeEventListener('aklow-ai-action-wizard', handleAIActionWizard as EventListener)
    }
  }, [])

  const handleOpenDetails = () => {
    setRightDrawerOpen(true)
  }

  const handleInboxItemClick = (item: InboxItem) => {
    // Wenn dasselbe Item nochmal geklickt wird, schließe den Drawer
    if (selectedInboxItem?.id === item.id && rightDrawerOpen) {
      closeRightDrawer()
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
    setShowAutomationOverview(false)
    setShowShieldOverview(false)
    setShowTelephonyOverview(false)
    setShowWebsiteOverview(false)
    handleOpenDetails()
  }

  const handleCustomerClick = (customerId: string) => {
    if (selectedCustomerId === customerId && rightDrawerOpen) {
      closeRightDrawer()
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
      setShowAutomationOverview(false)
      setShowShieldOverview(false)
      setShowTelephonyOverview(false)
      setShowWebsiteOverview(false)
      handleOpenDetails()
    }
  }


  const handleCloseDetails = () => {
    closeRightDrawer()
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
    setShowAutomationOverview(false)
    setShowShieldOverview(false)
    setShowTelephonyOverview(false)
    setShowWebsiteOverview(false)
  }

  const handleInboxOverviewToggle = () => {
    if (showInboxOverview && rightDrawerOpen) {
      closeRightDrawer()
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


  const showLeft = leftDrawerOpen // Sidebar kann auch bei Notifications geöffnet sein
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
      showDocumentsOverview ||
      showAutomationOverview ||
      showShieldOverview ||
      showTelephonyOverview ||
      showWebsiteOverview)

  const leftDrawerStyle: CSSProperties = {
    width: LEFT_DRAWER_WIDTH,
  }

  const rightBaseLeft = showNotifications ? '0px' : showLeft ? LEFT_DRAWER_WIDTH : LEFT_RAIL_WIDTH
  const baseLeftNumber = parseFloat(rightBaseLeft)

  const getMaxInspectorWidth = useCallback((baseLeft: number) => {
    if (typeof window === 'undefined') return parseFloat(RIGHT_DRAWER_WIDTH)
    return Math.max(MIN_INSPECTOR_WIDTH, window.innerWidth - baseLeft)
  }, [])

  // Rechtes Panel: Positionierung abhängig vom Zustand
  const rightContainerStyle: CSSProperties = {
    right: 0,
    left: rightBaseLeft, // bei geschlossener Sidebar an die Rail anlehnen
  }

  const effectiveInspectorWidth = inspectorExpanded
    ? getMaxInspectorWidth(baseLeftNumber)
    : inspectorWidth

  const showRightContent = !inspectorExpanded || effectiveInspectorWidth < (typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1000)

  const chatStyle: CSSProperties = {
    paddingLeft: showLeft ? LEFT_DRAWER_WIDTH : 0,
    paddingRight: showRight && showRightContent ? effectiveInspectorWidth : 0,
    opacity: showRight && !showRightContent ? 0 : 1,
    pointerEvents: showRight && !showRightContent ? 'none' : 'auto',
  }

  // Clamp width on viewport resize
  useEffect(() => {
    const handleResize = () => {
      const maxW = getMaxInspectorWidth(baseLeftNumber)
      setInspectorWidth((w) => {
        const next = Math.min(w, maxW)
        return next === w ? w : next
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [baseLeftNumber, getMaxInspectorWidth])

  // Drag-resize logic for the right drawer
  useEffect(() => {
    if (!isResizingInspector) return

    const handleMove = (e: MouseEvent) => {
      if (!inspectorRef.current) return
      const rect = inspectorRef.current.getBoundingClientRect()
      const rightEdge = rect.right
      let next = rightEdge - e.clientX
      const maxW = getMaxInspectorWidth(baseLeftNumber)
      next = Math.min(Math.max(next, MIN_INSPECTOR_WIDTH), maxW)
      setInspectorWidth(next)
      setInspectorExpanded(false)
    }

    const handleUp = () => setIsResizingInspector(false)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isResizingInspector, baseLeftNumber, getMaxInspectorWidth])

  const startInspectorResize = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsResizingInspector(true)
  }

  // Split modules into primary and secondary for the Add-ons menu
  const primaryModuleIds = ['chat', 'inbox']
  const primaryModules = MODULES.filter(m => primaryModuleIds.includes(m.id))
  const secondaryModules = MODULES.filter(m => !primaryModuleIds.includes(m.id))
  const isSecondaryActive = secondaryModules.some(m => m.id === activeModuleToken)

  const tooltipClasses = "absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap"
  const cornerTooltipClasses = "absolute top-full right-0 mt-2 px-2.5 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap"

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFFFFF] text-[var(--ak-color-text-primary)]">
      <aside suppressHydrationWarning className="flex w-16 flex-col items-center py-4 text-[var(--ak-color-text-secondary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] border-r border-white/20 bg-white/40 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] z-50">
        
        <div suppressHydrationWarning className="flex flex-1 flex-col items-center w-full">
            <div suppressHydrationWarning className="flex flex-col items-center gap-4 w-full">
            {/* Primary Modules */}
            {primaryModules.map((mod) => {
                const Icon = mod.icon
                const isActive =
                (mod.id === activeModuleToken && leftDrawerOpen) ||
                (mod.id === 'chat' &&
                    activeModuleToken === 'chat' &&
                    !leftDrawerOpen &&
                    !rightDrawerOpen)

                return (
                <div key={mod.id} className="relative group flex justify-center w-full">
                    <button
                    type="button"
                    onClick={() => handleModuleClick(mod.id)}
                    className={clsx(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                        isActive
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
                    )}
                    >
                    <span className="sr-only">{mod.label}</span>
                    <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
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

            {/* Add-ons Menu */}
            <div className="relative group flex justify-center w-full">
                <button
                type="button"
                    onClick={() => setAppsMenuOpen((prev) => !prev)}
                className={clsx(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                    appsMenuOpen || isSecondaryActive
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
                )}
                aria-label="Add-ons"
                >
                <Squares2X2Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                </button>
                
                {!appsMenuOpen && (
                    <span className={tooltipClasses}>
                        Add-ons
                        <svg className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px] text-gray-900 h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 0l-24 12 24 12z" />
                        </svg>
                    </span>
                )}
                </div>

                {/* Inline Add-ons List in the rail */}
                        {secondaryModules.map((mod) => {
                    if (!appsMenuOpen) return null
                            const Icon = mod.icon
                            const isActive = mod.id === activeModuleToken
                            return (
                        <div key={mod.id} className="relative group flex justify-center w-full">
                                <button
                                type="button"
                                    onClick={() => handleModuleClick(mod.id)}
                                    className={clsx(
                                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out focus-visible:outline-none',
                                        isActive 
                                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
                                    )}
                                >
                                <span className="sr-only">{mod.label}</span>
                                <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
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

            {/* Dashboards Menu */}
            <div className="relative group flex justify-center w-full mt-auto pt-6" data-dashboards-menu>
              <button
                type="button"
                onClick={() => setShowDashboardsMenu((prev) => !prev)}
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                  showDashboardsMenu
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
                )}
                aria-label="Dashboards"
              >
                <RectangleStackIcon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
              </button>
              
              {!showDashboardsMenu && (
                <span className={tooltipClasses}>
                  Dashboards
                  <svg className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px] text-gray-900 h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 0l-24 12 24 12z" />
                  </svg>
                </span>
              )}

              {/* Dashboards Dropdown */}
              {showDashboardsMenu && (
                <div className="absolute left-full ml-3 bottom-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50" data-dashboards-menu>
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Alle Dashboards
                    </div>
                    <div className="space-y-1">
                      {[
                        { id: 'shield', label: 'AI Shield', icon: ShieldCheckIcon },
                        { id: 'phone', label: 'Telefon-Assistent', icon: PhoneIcon },
                        { id: 'website', label: 'Website-Bot', icon: GlobeAltIcon },
                        { id: 'new1', label: 'Wachstum', icon: MegaphoneIcon },
                        { id: 'new2', label: 'Dokumente', icon: DocumentIcon },
                        { id: 'automation', label: 'Kunden', icon: UserGroupIcon },
                        { id: 'practice', label: 'Praxis', icon: HeartIcon },
                        { id: 'realestate', label: 'Immobilien', icon: BuildingOfficeIcon },
                        { id: 'hotel', label: 'Hotel & Gastgewerbe', icon: BuildingOffice2Icon },
                        { id: 'integrations', label: 'Integrationen', icon: Squares2X2Icon },
                        { id: 'marketplace', label: 'Marktplatz', icon: ShoppingBagIcon },
                        { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon },
                      ].map((dashboard) => {
                        const Icon = dashboard.icon
                        const isActive = dashboard.id === activeModuleToken
                        return (
                          <button
                            key={dashboard.id}
                            type="button"
                            onClick={() => {
                              handleModuleClick(dashboard.id as WorkspaceModuleToken)
                              setShowDashboardsMenu(false)
                            }}
                            className={clsx(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            )}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{dashboard.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizards & Onboardings Menu */}
            <div className="relative group flex justify-center w-full" data-wizards-menu>
              <button
                type="button"
                onClick={() => setShowWizardsMenu((prev) => !prev)}
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                  showWizardsMenu
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
                )}
                aria-label="Wizards & Onboardings"
              >
                <SparklesIcon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
              </button>
              
              {!showWizardsMenu && (
                <span className={tooltipClasses}>
                  Wizards & Onboardings
                  <svg className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px] text-gray-900 h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 0l-24 12 24 12z" />
                  </svg>
                </span>
              )}

              {/* Wizards & Onboardings Dropdown */}
              {showWizardsMenu && (
                <div className="absolute left-full ml-3 bottom-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[80vh] overflow-y-auto" data-wizards-menu>
                  <div className="p-2">
                    {/* Wizards Section */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Wizards
                    </div>
                    <div className="space-y-1 mb-4">
                      {[
                        { 
                          id: 'wizard', 
                          label: 'Allgemeiner Wizard', 
                          icon: SparklesIcon,
                          href: '/wizard',
                          description: 'Immobilien, Marketing & mehr'
                        },
                        { 
                          id: 'practice-wizard', 
                          label: 'Praxis Wizard', 
                          icon: HeartIcon,
                          href: '/practice/wizard',
                          description: 'Praxis-Setup'
                        },
                        { 
                          id: 'hotel-wizard', 
                          label: 'Hotel Wizard', 
                          icon: BuildingOffice2Icon,
                          href: '/hotel/wizard',
                          description: 'Hotel-Setup'
                        },
                        { 
                          id: 'realestate-wizard', 
                          label: 'Immobilien Wizard', 
                          icon: BuildingOfficeIcon,
                          href: '/real-estate/wizard',
                          description: 'Immobilien-Setup'
                        },
                        { 
                          id: 'realestate-properties-wizard', 
                          label: 'Immobilien Properties', 
                          icon: BuildingOfficeIcon,
                          href: '/real-estate/properties/wizard',
                          description: 'Properties Wizard'
                        },
                      ].map((wizard) => {
                        const Icon = wizard.icon
                        return (
                          <button
                            key={wizard.id}
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.location.href = wizard.href
                              }
                              setShowWizardsMenu(false)
                            }}
                            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left hover:bg-gray-50"
                          >
                            <Icon className="h-5 w-5 flex-shrink-0 text-purple-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">{wizard.label}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{wizard.description}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Onboardings Section */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 border-t border-gray-200 pt-3">
                      Onboardings
                    </div>
                    <div className="space-y-1">
                      {[
                        { 
                          id: 'onboarding', 
                          label: 'Allgemeines Onboarding', 
                          icon: AcademicCapIcon,
                          href: '/onboarding',
                          description: 'Erste Schritte'
                        },
                        { 
                          id: 'practice-onboarding', 
                          label: 'Praxis Onboarding', 
                          icon: HeartIcon,
                          href: '/practice/onboarding',
                          description: 'Praxis einrichten'
                        },
                        { 
                          id: 'hotel-onboarding', 
                          label: 'Hotel Onboarding', 
                          icon: BuildingOffice2Icon,
                          href: '/hotel/onboarding',
                          description: 'Hotel einrichten'
                        },
                        { 
                          id: 'realestate-onboarding', 
                          label: 'Immobilien Onboarding', 
                          icon: BuildingOfficeIcon,
                          href: '/real-estate/onboarding',
                          description: 'Immobilien einrichten'
                        },
                      ].map((onboarding) => {
                        const Icon = onboarding.icon
                        return (
                          <button
                            key={onboarding.id}
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.location.href = onboarding.href
                              }
                              setShowWizardsMenu(false)
                            }}
                            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left hover:bg-gray-50"
                          >
                            <Icon className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">{onboarding.label}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{onboarding.description}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex justify-center w-full mb-2">
              <UserMenu />
            </div>

            {/* Settings bottom-pinned */}
            <div className="relative group flex justify-center w-full">
            <button
            type="button"
            onClick={() => handleModuleClick('settings')}
            className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                activeModuleToken === 'settings' && leftDrawerOpen
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
            )}
            aria-label="Einstellungen"
            >
            <Cog6ToothIcon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
            </button>
            
            <span className={tooltipClasses}>
                Einstellungen
                <svg className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px] text-gray-900 h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 0l-24 12 24 12z" />
                </svg>
            </span>
            </div>
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Floating Notifications Button (top-right) */}
        {activeModuleToken === 'chat' && !showRight && (
          <div className="pointer-events-none absolute right-2 top-2 z-50">
            <div className="relative group pointer-events-auto">
              <button
                type="button"
                onClick={() => handleModuleClick('notifications')}
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out focus-visible:outline-none active:scale-[0.96]',
                  showNotifications
                    ? 'text-gray-900 bg-black/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                )}
                aria-label="Benachrichtigungen"
              >
                <BellIcon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
              </button>
              <span className={cornerTooltipClasses}>
                Benachrichtigungen
                <svg className="absolute right-1/2 translate-x-1/2 -top-2 text-gray-900 h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l12 24H0z" />
                </svg>
              </span>
            </div>
          </div>
        )}

        <main className="relative flex-1 overflow-hidden min-w-0 w-full">
          <div
            className="h-full w-full min-w-0 max-w-full transition-[padding-left,padding-right] duration-200 ease-out overflow-x-hidden box-border"
            style={chatStyle}
          >
            {activeModuleToken === 'shield' ? (
              <ShieldDashboard view={activeShieldView} />
            ) : activeModuleToken === 'phone' ? (
              <TelephonyDashboard view={activeTelephonyView} />
            ) : activeModuleToken === 'website' ? (
              <WebsiteDashboard view={activeWebsiteView} />
            ) : activeModuleToken === 'new1' ? (
              <GrowthDashboard view={activeGrowthView} />
            ) : activeModuleToken === 'settings' ? (
              <SettingsDashboard view={activeSettingsView} />
            ) : activeModuleToken === 'new2' ? (
              <DocumentsDashboard view={activeDocumentsView} />
            ) : activeModuleToken === 'automation' ? (
              <CustomersDashboard view={activeCustomersView} />
            ) : activeModuleToken === 'integrations' ? (
              <IntegrationsDashboard />
            ) : activeModuleToken === 'marketplace' ? (
              <MarketplaceDashboard />
            ) : activeModuleToken === 'practice' ? (
              <PracticeDashboard view={activePracticeView} />
            ) : activeModuleToken === 'realestate' ? (
              <RealEstateDashboard view={activeRealEstateView} />
            ) : activeModuleToken === 'hotel' ? (
              <HotelDashboard view={activeHotelView} />
            ) : activeModuleToken === 'reviews' ? (
              <ReviewProfiDashboard view={activeReviewProfiView} />
            ) : activeModuleToken === 'gastronomie' ? (
              <GastronomieDashboard view={activeGastronomieView} />
            ) : (
              children
            )}
          </div>

          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 left-0 flex',
              showLeft ? 'z-30' : 'z-20'
            )}
          >
            <div
              className={clsx(
                'pointer-events-auto flex h-full flex-col border-r border-white/20 bg-white/60 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                showLeft ? 'translate-x-0' : '-translate-x-full'
              )}
              style={leftDrawerStyle}
            >
              <AkDrawerScaffold
                title={
                  activeModuleToken === 'settings' && selectedSettingsCategory === 'memory_crm'
                    ? 'Speicher & CRM'
                    : activeModuleToken === 'notifications'
                    ? 'Benachrichtigungen'
                    : getModuleLabel(activeModuleToken)
                }
                trailing={
                  <div className="flex items-center gap-2">
                      <AkIconButton
                        onClick={() => {
                          const openFull = () => {
                             // Force full width mode for "No Gap"
                             const baseLeft = parseFloat(rightBaseLeft)
                             const maxW = getMaxInspectorWidth(baseLeft)
                             setInspectorWidth(maxW)
                             setInspectorExpanded(true)
                             setRightDrawerOpen(true)
                          }

                          // Reset helper
                          const resetAll = () => {
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
                              setShowAutomationOverview(false)
                              setShowShieldOverview(false)
                              setShowTelephonyOverview(false)
                              setShowWebsiteOverview(false)
                              setShowChatOverview(false)
                            }

                          if (activeModuleToken === 'inbox') {
                            if (rightDrawerOpen && showInboxOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowInboxOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'chat') {
                            if (rightDrawerOpen && showChatOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowChatOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'new1') { // Growth
                            if (rightDrawerOpen && showGrowthOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowGrowthOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'new2') { // Documents
                            if (rightDrawerOpen && showDocumentsOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowDocumentsOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'automation') { // Customers
                            if (rightDrawerOpen && showAutomationOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowAutomationOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'shield') {
                            if (rightDrawerOpen && showShieldOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowShieldOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'phone') {
                            if (rightDrawerOpen && showTelephonyOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowTelephonyOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'website') {
                            if (rightDrawerOpen && showWebsiteOverview) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowWebsiteOverview(true)
                              openFull()
                            }
                          } else if (activeModuleToken === 'notifications') {
                            if (rightDrawerOpen && showNotifications) {
                              handleCloseDetails()
                            } else {
                              resetAll()
                              setShowNotifications(true)
                              openFull()
                            }
                          } else {
                             // Fallback for others (Settings)
                             if (rightDrawerOpen) handleCloseDetails()
                             else {
                               resetAll()
                               openFull()
                            }
                          }
                        }}
                        selected={showRight}
                        aria-label="Dashboard anzeigen"
                      >
                        <InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
                      </AkIconButton>

                    <AkIconButton
                      onClick={() => setLeftDrawerOpen((prev) => !prev)}
                      aria-label="Panel einklappen"
                    >
                      <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                    </AkIconButton>
                  </div>
                }
                bodyClassName="ak-scrollbar ak-body text-[var(--ak-color-text-secondary)]"
              >
                {activeModuleToken === 'chat' ? (
                  <ChatSidebarContent />
                ) : activeModuleToken === 'shield' ? (
                  <ShieldSidebarWidget
                    activeView={activeShieldView}
                    onViewSelect={(view) => {
                      setActiveShieldView(view)
                      // Bei Klick auf Shield Sidebar schließen wir den rechten Drawer, falls offen
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'phone' ? (
                  <TelephonySidebarWidget
                    activeView={activeTelephonyView}
                    onViewSelect={(view) => {
                      setActiveTelephonyView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'website' ? (
                  <WebsiteSidebarWidget
                    activeView={activeWebsiteView}
                    onViewSelect={(view) => {
                      setActiveWebsiteView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'inbox' ? (
                  <InboxDrawerWidget 
                    onItemClick={handleInboxItemClick} 
                    onInfoClick={handleInboxOverviewToggle}
                  />
                ) : activeModuleToken === 'automation' ? (
                  <CustomersSidebarWidget 
                    activeView={activeCustomersView}
                    onViewSelect={(view) => {
                      setActiveCustomersView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
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
                  <SettingsSidebarWidget
                    activeView={activeSettingsView}
                    onViewSelect={(view) => {
                      setActiveSettingsView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'practice' ? (
                  <PracticeSidebarWidget
                    activeView={activePracticeView}
                    onViewSelect={(view) => {
                      setActivePracticeView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'realestate' ? (
                  <RealEstateSidebarWidget
                    activeView={activeRealEstateView}
                    onViewSelect={(view) => {
                      setActiveRealEstateView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'hotel' ? (
                  <HotelSidebarWidget
                    activeView={activeHotelView}
                    onViewSelect={(view) => {
                      setActiveHotelView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'reviews' ? (
                  <ReviewProfiSidebarWidget
                    activeView={activeReviewProfiView}
                    onViewSelect={(view) => {
                      setActiveReviewProfiView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'gastronomie' ? (
                  <GastronomieSidebarWidget
                    activeView={activeGastronomieView}
                    onViewSelect={(view) => {
                      setActiveGastronomieView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'new1' ? (
                  <GrowthSidebarWidget 
                    activeView={activeGrowthView}
                    onViewSelect={(view) => {
                      setActiveGrowthView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'new2' ? (
                  <DocumentsSidebarWidget 
                    activeView={activeDocumentsView}
                    onViewSelect={(view) => {
                      setActiveDocumentsView(view)
                      if (rightDrawerOpen) closeRightDrawer()
                    }}
                  />
                ) : activeModuleToken === 'notifications' ? (
                  <NotificationsSidebarWidget 
                    onInfoClick={handleNotificationsInfoClick}
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
              </AkDrawerScaffold>
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
                'ak-inspector-shell pointer-events-auto relative flex h-full flex-col transition-transform duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] overflow-visible',
                showRight ? 'translate-x-0' : 'translate-x-full'
              )}
              ref={inspectorRef}
                style={{
                width: `${effectiveInspectorWidth}px`,
                marginLeft: 'auto',
              }}
            >
              {/* Resize handle */}
              <div
                onMouseDown={startInspectorResize}
                className="absolute left-0 top-0 bottom-0 w-5 -translate-x-1/2 cursor-col-resize z-50 flex items-center justify-center group hover:w-6 transition-all"
                aria-label="Größe ändern"
                title="Ziehen zum Ändern der Größe"
              >
                {/* Visual Line */}
                <div className="w-1.5 h-16 bg-black/20 rounded-full backdrop-blur-sm group-hover:bg-blue-500 group-active:bg-blue-600 transition-colors shadow-sm ring-1 ring-white/50" />
              </div>
              <AkDrawerScaffold
                title={
                  <div className="flex flex-col items-center">
                    <div className="h-1 w-12 rounded-full bg-gray-300 mb-2 sm:hidden" /> {/* Mobile handle */}
                    <span className="text-sm font-semibold text-gray-900">
                      {showNotifications
                        ? 'Benachrichtigungen'
                        : showChatOverview
                          ? 'Chat Übersicht'
                        : showInboxOverview
                          ? 'Posteingang'
                          : showGrowthOverview
                            ? 'Wachstum'
                            : showDocumentsOverview
                              ? 'Dokumente'
                              : showAutomationOverview
                                ? 'Kunden & Automatisierung'
                                : showShieldOverview
                                ? 'AI Shield'
                                : showTelephonyOverview
                                  ? 'Telefon-Assistent'
                                  : showWebsiteOverview
                                    ? 'Website-Bot'
                              : activeModuleToken === 'inbox'
                                ? selectedInboxItem?.title ?? 'Details'
                                : activeModuleToken === 'settings'
                            ? selectedSettingsCategory === 'memory_crm'
                              ? selectedMemoryCategory?.title ?? selectedMemoryCategory?.label ?? 'Speicher & CRM'
                              : selectedSettingsCategory
                                ? 'Allgemein'
                                : 'Einstellungen'
                            : activeModuleToken === 'automation'
                              ? selectedCustomerId
                                ? 'Kundendetails'
                                : 'Kunden'
                              : activeModuleToken === 'new1'
                                ? selectedGrowthItemId
                                  ? 'Details'
                                  : 'Wachstum'
                                : activeModuleToken === 'new2'
                                  ? selectedDocumentId
                                    ? 'Details'
                                    : 'Dokumente'
                                  : getModuleLabel(activeModuleToken)}
                    </span>
                  </div>
                }
                leading={
                  <div className="flex items-center gap-1">
                    <button
                        onClick={handleCloseDetails}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        aria-label="Schließen"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                          const next = !inspectorExpanded
                          if (next) {
                            const maxW = getMaxInspectorWidth(baseLeftNumber)
                            setInspectorWidth(maxW)
                          } else {
                            setInspectorWidth(parseFloat(RIGHT_DRAWER_WIDTH))
                          }
                          setInspectorExpanded(next)
                        }}
                        className={clsx(
                            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                            inspectorExpanded ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                        )}
                        aria-label={inspectorExpanded ? "Verkleinern" : "Vergrößern"}
                    >
                        {inspectorExpanded ? (
                            <ChevronRightIcon className="h-4 w-4" />
                        ) : (
                            <ChevronLeftIcon className="h-4 w-4" />
                        )}
                    </button>
                  </div>
                }
                bodyClassName="ak-scrollbar ak-inspector-body text-sm text-[var(--ak-color-text-secondary)]"
              >
                {showNotifications ? (
                  <NotificationsSettingsDrawer
                    onClose={handleCloseDetails}
                    onSave={(settings) => {
                      console.log('Save notification settings:', settings)
                      // TODO: Save to backend
                    }}
                    onCancel={handleCloseDetails}
                  />
                ) : showInboxOverview ? (
                  <div className="flex flex-col gap-6 p-1">
                    <AIActionStrip token="inbox" label="KI Aktionen" />
                    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-900">Posteingang Status</h4>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                <div className="text-3xl font-bold text-gray-900 tracking-tight">12</div>
                                <div className="text-xs font-medium text-blue-600 mt-1">Ungelesen</div>
                            </div>
                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                <div className="text-3xl font-bold text-gray-900 tracking-tight">5</div>
                                <div className="text-xs font-medium text-gray-500 mt-1">In Arbeit</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h4 className="text-sm font-semibold text-gray-900">Neueste Aktivitäten</h4>
                            <button className="text-xs text-blue-600 hover:underline">Alle anzeigen</button>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-none text-blue-600 font-bold text-xs ring-1 ring-black/5 group-hover:scale-110 transition-transform">
                                    {(i % 2 === 0) ? 'JD' : 'AM'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-gray-900 truncate">{(i % 2 === 0) ? 'Neue Anfrage zu Q4' : 'Meeting Termin bestätigt'}</p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{i * 15}m</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{(i % 2 === 0) ? 'John Doe • Acme Corp' : 'Anna Müller • Design Studio'}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
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
                        closeRightDrawer()
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
                ) : showChatOverview ? (
                  <ChatOverviewWidget />
                ) : showGrowthOverview ? (
                  <div className="flex flex-col gap-6 p-1">
                    <AIActionStrip token="new1" label="KI Aktionen" />
                     <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Kampagnen Performance</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">23%</div>
                                <div className="text-xs text-gray-500">Öffnungsrate</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">12</div>
                                <div className="text-xs text-gray-500">Neue Leads</div>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-orange-500 w-[65%]" />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 text-right">Ziel: 20 Leads</div>
                     </div>
                     <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 px-1">Laufende Kampagnen</h4>
                        <div className="space-y-2">
                           <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-900">Outreach Q4</span>
                              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Aktiv</span>
                           </div>
                           <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-900">Newsletter Dez</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Geplant</span>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : showDocumentsOverview ? (
                  <div className="flex flex-col gap-6 p-1">
                     {/* Section 1: Storage Overview */}
                     <div className="relative overflow-hidden p-6 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -z-10 opacity-50 transition-opacity group-hover:opacity-80" />
                        
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <CloudArrowUpIcon className="w-4 h-4" />
                                </span>
                                Speicherplatz
                            </h4>
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">45% belegt</span>
                        </div>

                        <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                            <div className="absolute top-0 left-0 h-full w-[45%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_2px_10px_rgba(59,130,246,0.3)]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-default">
                                <div className="text-gray-500 text-xs mb-1">Verfügbar</div>
                                <div className="text-xl font-bold text-gray-900">550 GB</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-default">
                                <div className="text-gray-500 text-xs mb-1">Genutzt</div>
                                <div className="text-xl font-bold text-gray-900">450 GB</div>
                            </div>
                        </div>
                     </div>

                     {/* Section 2: Quick Categories */}
                     <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 px-1 flex items-center gap-2">
                            <Squares2X2Icon className="w-4 h-4 text-gray-400" />
                            Kategorien
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Bilder', count: '1.2k', color: 'bg-orange-50 text-orange-600', icon: '🖼️' },
                                { label: 'Dokumente', count: '843', color: 'bg-blue-50 text-blue-600', icon: '📄' },
                                { label: 'Rechnungen', count: '128', color: 'bg-green-50 text-green-600', icon: '💶' },
                                { label: 'Verträge', count: '45', color: 'bg-purple-50 text-purple-600', icon: '⚖️' },
                            ].map((cat, i) => (
                                <button key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-left">
                                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-lg`}>
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                                        <div className="text-xs text-gray-500">{cat.count} Dateien</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                     </div>

                     {/* Section 3: Recent Activity */}
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                Zuletzt bearbeitet
                            </h4>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                                Alle anzeigen
                            </button>
                        </div>
                        <div className="space-y-3">
                            {['Angebot_Q4_Final.pdf', 'Design_Assets.zip', 'Rechnung_1023.pdf'].map((file, i) => (
                                <div key={i} className="group flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100/50 transition-all cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <DocumentIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">{file}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            <p className="text-xs text-gray-500">Gerade eben bearbeitet</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                     </div>
                  </div>
                ) : showAutomationOverview ? (
                    <div className="flex flex-col gap-6 p-1">
                        <AIActionStrip token="automation" label="KI Aktionen" />
                        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Kunden & Automatisierung</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <div className="text-3xl font-bold text-gray-900">128</div>
                                    <div className="text-xs font-medium text-indigo-600 mt-1">Aktive Kunden</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="text-3xl font-bold text-gray-900">12</div>
                                    <div className="text-xs font-medium text-emerald-600 mt-1">Workflows</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 px-1">Segmente</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">VIP Kunden</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">24</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-gray-700">Onboarding</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">15</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : showShieldOverview ? (
                   <div className="flex flex-col gap-6 p-1">
                      <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Sicherheits-Status</h4>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Geschützt</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-24 flex items-center justify-center">
                             <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="98, 100" />
                             </svg>
                             <span className="absolute text-xl font-bold text-gray-900">98%</span>
                          </div>
                          <div className="flex-1 space-y-2 text-xs">
                             <div className="flex justify-between"><span className="text-gray-500">Bedrohungen</span><span className="font-medium">0</span></div>
                             <div className="flex justify-between"><span className="text-gray-500">Geprüft</span><span className="font-medium">1.2k</span></div>
                             <div className="flex justify-between"><span className="text-gray-500">Uptime</span><span className="font-medium">100%</span></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                         <h4 className="text-sm font-semibold text-gray-900 mb-3 px-1">Letzte Ereignisse</h4>
                         <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                               <ShieldCheckIcon className="w-5 h-5 text-green-500 flex-none" />
                               <div>
                                  <p className="text-sm font-medium text-gray-900">PII Maskierung aktiv</p>
                                  <p className="text-xs text-gray-500">Vor 2 Std • E-Mail Adresse erkannt</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                               <ShieldCheckIcon className="w-5 h-5 text-green-500 flex-none" />
                               <div>
                                  <p className="text-sm font-medium text-gray-900">SQL Injection blockiert</p>
                                  <p className="text-xs text-gray-500">Gestern • IP 192.168.x.x</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                ) : showTelephonyOverview ? (
                   <div className="flex flex-col gap-6 p-1">
                      <AIActionStrip token="phone" label="KI Aktionen" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                           <div className="text-gray-500 text-xs mb-1">Anrufe heute</div>
                           <div className="text-2xl font-bold text-gray-900">42</div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                           <div className="text-gray-500 text-xs mb-1">Ø Dauer</div>
                           <div className="text-2xl font-bold text-gray-900">3:12</div>
                        </div>
                      </div>
                      
                      <div>
                         <h4 className="text-sm font-semibold text-gray-900 mb-3 px-1">Letzte Anrufe</h4>
                         <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <PhoneIcon className="w-4 h-4 text-gray-500" />
                                     </div>
                                     <div>
                                        <div className="text-sm font-medium text-gray-900">+49 171 123456{i}</div>
                                        <div className="text-xs text-gray-500">Vor {i * 15} Min • Eingehend</div>
                                     </div>
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">4:20</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                ) : showWebsiteOverview ? (
                   <div className="flex flex-col gap-6 p-1">
                      <AIActionStrip token="website" label="KI Aktionen" />
                      <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                         <h4 className="text-sm font-semibold text-gray-900 mb-2">Website Health</h4>
                         <div className="flex items-end gap-1 h-16 w-full">
                            {[10, 20, 15, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-green-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                         </div>
                         <div className="mt-4 flex justify-between text-xs">
                            <span className="text-gray-500">Ladezeit</span>
                            <span className="font-bold text-gray-900">0.4s</span>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                             <div className="text-gray-500 text-xs mb-1">Live Besucher</div>
                             <div className="text-2xl font-bold text-gray-900">14</div>
                             <div className="flex -space-x-2 mt-2">
                                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gray-200 ring-2 ring-white" />)}
                             </div>
                          </div>
                          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                             <div className="text-gray-500 text-xs mb-1">Interaktionen</div>
                             <div className="text-2xl font-bold text-gray-900">156</div>
                             <div className="text-[10px] text-green-600 mt-1">+12% vs Gestern</div>
                          </div>
                      </div>
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
                        closeRightDrawer()
                      }}
                    />
                  ) : selectedAutomationItem ? (
                    <AutomationDetailPanel workflowId={selectedAutomationItem} />
                  ) : (
                    <div className="flex flex-col gap-6 p-1">
                        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Kunden & Automatisierung</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <div className="text-3xl font-bold text-gray-900">128</div>
                                    <div className="text-xs font-medium text-indigo-600 mt-1">Aktive Kunden</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="text-3xl font-bold text-gray-900">12</div>
                                    <div className="text-xs font-medium text-emerald-600 mt-1">Workflows</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 px-1">Segmente</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">VIP Kunden</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">24</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-gray-700">Onboarding</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">15</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        <span className="text-sm font-medium text-gray-700">Inaktiv</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">8</span>
                                </div>
                            </div>
                        </div>
                    </div>
                  )
                ) : activeModuleToken === 'new1' ? (
                  selectedGrowthItemId ? (
                    <GrowthDetailsDrawer
                      growthItemId={selectedGrowthItemId}
                      onClose={() => {
                        setSelectedGrowthItemId(null)
                        closeRightDrawer()
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
                        closeRightDrawer()
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
              </AkDrawerScaffold>
            </div>
          </div>
        </main>
      </div>
      
      {/* Hotel Keyboard Shortcuts Modal */}
      {activeModuleToken === 'hotel' && (
        <HotelKeyboardShortcuts
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}

      {/* AI Action Wizard */}
      {aiActionWizardAction && (
        <AIActionWizard
          key={`${aiActionWizardAction.id}-${aiActionWizardOpen ? 'open' : 'closed'}`}
          isOpen={aiActionWizardOpen}
          onClose={() => {
            setAiActionWizardOpen(false)
            setAiActionWizardAction(null)
          }}
          context={aiActionWizardContext}
          action={aiActionWizardAction}
        />
      )}
    </div>
  )
}