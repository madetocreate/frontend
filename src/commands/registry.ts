import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  MegaphoneIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  PhoneIcon, 
  GlobeAltIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  RectangleStackIcon,
  QuestionMarkCircleIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  CpuChipIcon,
  ShieldCheckIcon as ShieldCheckOutlineIcon,
  ServerIcon,
  UsersIcon,
  CreditCardIcon,
  PuzzlePieceIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon,
  ListBulletIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  TrashIcon,
  BoltIcon,
  EyeIcon,
  PencilSquareIcon,
  SignalIcon,
} from '@heroicons/react/24/outline'
import { Command } from '../components/CommandPalette'

import type { InboxItem } from '../components/InboxDrawerWidget'

export type CommandContext = {
  activeModuleToken: string
  activeSettingsView?: string
  activeDocumentsView?: string
  selectedDocumentId?: string | null
  selectedInboxItem?: InboxItem | null
  selectedInboxThreadId?: string | null
  showRightDrawer?: boolean
  leftDrawerOpen?: boolean
}

export const AKLOW_EVENTS = {
  OPEN_MODULE: 'aklow-open-module',
  OPEN_SETTINGS_VIEW: 'aklow-open-settings-view',
  OPEN_DOCUMENTS_VIEW: 'aklow-open-documents-view',
  TOGGLE_SIDEBAR: 'aklow-toggle-sidebar',
  TOGGLE_DRAWER: 'aklow-toggle-drawer',
  SHOW_SHORTCUTS: 'aklow-show-shortcuts',
  TOGGLE_THEME: 'aklow-toggle-theme',
  RUN_SHIELD_ACTION: 'aklow-run-shield-action',
  RUN_DOCUMENTS_ACTION: 'aklow-run-documents-action',
  RUN_SETTINGS_ACTION: 'aklow-run-settings-action',
  RUN_PHONE_ACTION: 'aklow-run-phone-action',
  RUN_WEBSITE_ACTION: 'aklow-run-website-action',
}

const dispatch = (eventName: string, detail?: Record<string, unknown>) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export function buildCommands(ctx: CommandContext): Command[] {
  const commands: Command[] = []

  // --- Global Navigation ---
  const navCommands: Command[] = [
    {
      id: 'nav-chat',
      label: 'Gehe zu Chat',
      category: 'navigation',
      icon: ChatBubbleLeftRightIcon,
      action: () => dispatch(AKLOW_EVENTS.OPEN_MODULE, { module: 'chat' }),
      keywords: ['chat', 'nachrichten', 'dialog'],
    },
    {
      id: 'nav-inbox',
      label: 'Gehe zu Posteingang',
      category: 'navigation',
      icon: PaperAirplaneIcon,
      action: () => dispatch(AKLOW_EVENTS.OPEN_MODULE, { module: 'inbox' }),
      keywords: ['inbox', 'posteingang', 'mail', 'email'],
    },
    {
      id: 'nav-phone',
      label: 'Gehe zu Telefonie',
      category: 'navigation',
      icon: PhoneIcon,
      action: () => dispatch(AKLOW_EVENTS.OPEN_MODULE, { module: 'phone' }),
      keywords: ['telefonie', 'phone', 'anruf', 'call', 'bot'],
    },
    {
      id: 'nav-website',
      label: 'Gehe zu Website',
      category: 'navigation',
      icon: GlobeAltIcon,
      action: () => dispatch(AKLOW_EVENTS.OPEN_MODULE, { module: 'website' }),
      keywords: ['website', 'web', 'bot', 'widget'],
    },
    {
      id: 'nav-settings',
      label: 'Gehe zu Einstellungen',
      category: 'navigation',
      icon: Cog6ToothIcon,
      action: () => dispatch(AKLOW_EVENTS.OPEN_MODULE, { module: 'settings' }),
      keywords: ['einstellungen', 'settings', 'config', 'konfiguration'],
    },
  ]
  commands.push(...navCommands)

  // --- Global UI Actions ---
  const uiCommands: Command[] = [
    {
      id: 'ui-toggle-sidebar',
      label: 'Sidebar umschalten',
      category: 'action',
      icon: Bars3Icon,
      action: () => dispatch(AKLOW_EVENTS.TOGGLE_SIDEBAR),
      shortcut: '⌘\\',
      keywords: ['sidebar', 'seitenleiste', 'menü', 'ausblenden', 'einblenden'],
    },
    {
      id: 'ui-toggle-drawer',
      label: 'Info-Panel umschalten',
      category: 'action',
      icon: RectangleStackIcon,
      action: () => dispatch(AKLOW_EVENTS.TOGGLE_DRAWER),
      shortcut: '⌘/',
      keywords: ['drawer', 'inspector', 'info', 'details', 'rechts'],
    },
    {
      id: 'ui-show-shortcuts',
      label: 'Shortcuts anzeigen',
      category: 'action',
      icon: QuestionMarkCircleIcon,
      action: () => dispatch(AKLOW_EVENTS.SHOW_SHORTCUTS),
      shortcut: '?',
      keywords: ['shortcuts', 'tastenkombinationen', 'hilfe', 'help'],
    },
    {
      id: 'ui-toggle-theme',
      label: 'Theme umschalten (Graphite/White)',
      category: 'action',
      icon: SwatchIcon,
      action: () => dispatch(AKLOW_EVENTS.TOGGLE_THEME),
      keywords: ['theme', 'modus', 'dark', 'light', 'graphite', 'aussehen'],
    },
  ]
  commands.push(...uiCommands)

  // --- Global Creation Actions ---
  const createCommands: Command[] = [
    {
      id: 'create-customer',
      label: 'Neuen Kunden anlegen',
      category: 'action',
      icon: UserGroupIcon,
      action: async () => {
        const { dispatchActionStart } = await import('@/lib/actions/dispatch')
        dispatchActionStart(
          'customers.profileShort',
          { module: 'customers', target: { type: 'customer' } },
          undefined,
          'command-palette'
        )
      },
      keywords: ['kunde', 'neu', 'create', 'erstellen', 'kontakt'],
    },
    {
      id: 'create-campaign',
      label: 'Kampagne erstellen',
      category: 'action',
      icon: MegaphoneIcon,
      action: async () => {
        const { dispatchActionStart } = await import('@/lib/actions/dispatch')
        dispatchActionStart(
          'growth.campaignPlan',
          { module: 'growth', target: { type: 'campaign' } },
          undefined,
          'command-palette'
        )
      },
      keywords: ['kampagne', 'marketing', 'neu', 'create', 'ads'],
    },
    {
      id: 'create-task',
      label: 'Task erstellen',
      category: 'action',
      icon: ClipboardDocumentCheckIcon,
      action: async () => {
        const { dispatchActionStart } = await import('@/lib/actions/dispatch')
        dispatchActionStart(
          'inbox.next_steps',
          { module: 'inbox', target: { type: 'task' } },
          undefined,
          'command-palette'
        )
      },
      keywords: ['task', 'aufgabe', 'todo', 'neu', 'create'],
    },
  ]
  commands.push(...createCommands)

  // --- Settings-Specific ---
  if (ctx.activeModuleToken === 'settings') {
    const settingsNav: Command[] = [
      { id: 'set-general', label: 'Öffne: Allgemein', icon: AdjustmentsHorizontalIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'general' }) },
      { id: 'set-account', label: 'Öffne: Mein Account', icon: UserCircleIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'account' }) },
      { id: 'set-ai', label: 'Öffne: KI & Modelle', icon: CpuChipIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'ai' }) },
      { id: 'set-agents', label: 'Öffne: Agenten & Tools', icon: GlobeAltIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'agents' }) },
      { id: 'set-automations', label: 'Öffne: KI-Vorschläge & Automatisierung', icon: BoltIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'automations' }) },
      { id: 'set-security', label: 'Öffne: Sicherheit & Policies', icon: ShieldCheckOutlineIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'security' }) },
      { id: 'set-database', label: 'Öffne: Datenbank & Speicher', icon: ServerIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'database' }) },
      { id: 'set-users', label: 'Öffne: Benutzer & Rollen', icon: UsersIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'users' }) },
      { id: 'set-billing', label: 'Öffne: Abrechnung', icon: CreditCardIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'billing' }) },
      { id: 'set-integrations', label: 'Öffne: Integrationen', icon: PuzzlePieceIcon, action: () => dispatch(AKLOW_EVENTS.OPEN_SETTINGS_VIEW, { view: 'integrations' }) },
    ].map(cmd => ({ ...cmd, category: 'settings' as const }))
    
    commands.push(...settingsNav)

    const settingsActions: Command[] = [
      {
        id: 'set-act-defaults',
        label: 'Empfohlene Defaults anzeigen',
        category: 'action',
        icon: SparklesIcon,
        action: () => dispatch(AKLOW_EVENTS.RUN_SETTINGS_ACTION, { action: 'show-defaults' }),
        keywords: ['defaults', 'best practices', 'empfehlungen'],
      },
      {
        id: 'set-act-scan',
        label: 'Konfiguration scannen (AI-Shield Check)',
        category: 'action',
        icon: ShieldCheckIcon,
        action: () => dispatch(AKLOW_EVENTS.RUN_SETTINGS_ACTION, { action: 'scan-config' }),
        keywords: ['scan', 'check', 'sicherheit', 'prüfung'],
      },
      {
        id: 'set-act-export',
        label: 'Export Settings',
        category: 'action',
        icon: CloudArrowUpIcon,
        action: () => dispatch(AKLOW_EVENTS.RUN_SETTINGS_ACTION, { action: 'export' }),
        keywords: ['export', 'sichern', 'backup', 'json'],
      },
      {
        id: 'set-act-reset',
        label: 'Reset Settings',
        category: 'action',
        icon: TrashIcon,
        action: () => {
          if (confirm('Möchtest du wirklich alle Einstellungen zurücksetzen?')) {
            dispatch(AKLOW_EVENTS.RUN_SETTINGS_ACTION, { action: 'reset' })
          }
        },
        keywords: ['reset', 'löschen', 'werkseinstellungen', 'zurücksetzen'],
      },
    ]
    commands.push(...settingsActions)
  }

  // --- Documents-Specific ---
  if (ctx.activeModuleToken === 'new2') {
    const docActions: Command[] = [
      {
        id: 'doc-upload',
        label: 'Upload Dokument',
        category: 'action',
        icon: CloudArrowUpIcon,
        shortcut: 'U',
        action: () => dispatch(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, { action: 'upload' }),
        keywords: ['upload', 'hochladen', 'neu', 'pdf'],
      },
      {
        id: 'doc-summarize',
        label: 'Zusammenfassen',
        category: 'action',
        icon: DocumentTextIcon,
        shortcut: 'S',
        action: () => dispatch(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, { action: 'summarize' }),
        keywords: ['zusammenfassen', 'summary', 'kurz', 'inhalt'],
      },
      {
        id: 'doc-ask',
        label: 'Fragen ans Dokument',
        category: 'action',
        icon: MagnifyingGlassIcon,
        shortcut: 'Q',
        action: () => dispatch(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, { action: 'ask' }),
        keywords: ['fragen', 'ask', 'chat', 'q&a'],
      },
      {
        id: 'doc-extract',
        label: 'Extrahieren',
        category: 'action',
        icon: ClipboardDocumentCheckIcon,
        shortcut: 'E',
        action: () => dispatch(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, { action: 'extract' }),
        keywords: ['extrahieren', 'daten', 'felder', 'werte'],
      },
      {
        id: 'doc-memory',
        label: 'In Memory speichern',
        category: 'action',
        icon: SparklesIcon,
        shortcut: 'M',
        action: () => dispatch(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, { action: 'memory' }),
        keywords: ['memory', 'speichern', 'gedächtnis', 'wissen'],
      },
      {
        id: 'doc-pii-scan',
        label: 'PII/Secrets Scan',
        category: 'action',
        icon: ShieldCheckIcon,
        shortcut: 'P',
        action: () => dispatch(AKLOW_EVENTS.RUN_DOCUMENTS_ACTION, { action: 'pii-scan' }),
        keywords: ['pii', 'secrets', 'scan', 'sicherheit', 'datenschutz'],
      },
    ]
    commands.push(...docActions)
  }

  // --- Shield-Specific ---
  if (ctx.activeModuleToken === 'shield') {
    const shieldActions: Command[] = [
      {
        id: 'shield-report',
        label: 'Risiko-Report erstellen',
        category: 'action',
        icon: DocumentTextIcon,
        shortcut: 'R',
        action: () => dispatch(AKLOW_EVENTS.RUN_SHIELD_ACTION, { action: 'create-report' }),
        keywords: ['report', 'risiko', 'analyse', 'status'],
      },
      {
        id: 'shield-summarize',
        label: 'Zusammenfassung',
        category: 'action',
        icon: SparklesIcon,
        shortcut: 'S',
        action: () => dispatch(AKLOW_EVENTS.RUN_SHIELD_ACTION, { action: 'summarize' }),
        keywords: ['zusammenfassen', 'summary', 'status'],
      },
      {
        id: 'shield-policies',
        label: 'Policies öffnen',
        category: 'action',
        icon: ShieldCheckOutlineIcon,
        shortcut: 'P',
        action: () => dispatch(AKLOW_EVENTS.RUN_SHIELD_ACTION, { action: 'open-policies' }),
        keywords: ['policies', 'richtlinien', 'regeln'],
      },
      {
        id: 'shield-registry',
        label: 'Registry öffnen',
        category: 'action',
        icon: ListBulletIcon,
        action: () => dispatch(AKLOW_EVENTS.RUN_SHIELD_ACTION, { action: 'open-registry' }),
        keywords: ['registry', 'register', 'pii'],
      },
      {
        id: 'shield-logs',
        label: 'Logs öffnen',
        category: 'action',
        icon: ArrowPathIcon,
        shortcut: 'L',
        action: () => dispatch(AKLOW_EVENTS.RUN_SHIELD_ACTION, { action: 'open-logs' }),
        keywords: ['logs', 'protokoll', 'verlauf'],
      },
      {
        id: 'shield-export-logs',
        label: 'Export Logs',
        category: 'action',
        icon: CloudArrowUpIcon,
        shortcut: 'E',
        action: () => dispatch(AKLOW_EVENTS.RUN_SHIELD_ACTION, { action: 'export-logs' }),
        keywords: ['export', 'logs', 'csv', 'json'],
      },
      {
        id: 'shield-scan-events',
        label: 'Scan latest events',
        category: 'action',
        icon: BoltIcon,
        shortcut: 'I',
        action: () => dispatch(AKLOW_EVENTS.RUN_SHIELD_ACTION, { action: 'scan-events' }),
        keywords: ['scan', 'events', 'live', 'check', 'injection'],
      },
    ]
    commands.push(...shieldActions)
  }

  // --- Phone-Specific ---
  if (ctx.activeModuleToken === 'phone') {
    const phoneActions: Command[] = [
      {
        id: 'phone-script',
        label: 'Call-Script erzeugen',
        category: 'action',
        icon: DocumentTextIcon,
        shortcut: 'S',
        action: () => dispatch(AKLOW_EVENTS.RUN_PHONE_ACTION, { action: 'create-script' }),
        keywords: ['script', 'skript', 'anruf', 'leitfaden'],
      },
      {
        id: 'phone-sms',
        label: 'Follow-up SMS generieren',
        category: 'action',
        icon: PaperAirplaneIcon,
        shortcut: 'F',
        action: () => dispatch(AKLOW_EVENTS.RUN_PHONE_ACTION, { action: 'generate-sms' }),
        keywords: ['sms', 'follow-up', 'nachricht', 'handy'],
      },
      {
        id: 'phone-summarize',
        label: 'Gespräch zusammenfassen',
        category: 'action',
        icon: SparklesIcon,
        shortcut: 'Z',
        action: () => dispatch(AKLOW_EVENTS.RUN_PHONE_ACTION, { action: 'summarize' }),
        keywords: ['zusammenfassen', 'summary', 'anruf'],
      },
      {
        id: 'phone-toggle-bot',
        label: 'Bot pausieren / fortsetzen',
        category: 'action',
        icon: PhoneIcon,
        shortcut: 'P',
        action: () => dispatch(AKLOW_EVENTS.RUN_PHONE_ACTION, { action: 'toggle-bot' }),
        keywords: ['bot', 'pause', 'start', 'stop', 'automatik'],
      },
      {
        id: 'phone-test-number',
        label: 'Nummer testen',
        category: 'action',
        icon: SignalIcon,
        shortcut: 'T',
        action: () => dispatch(AKLOW_EVENTS.RUN_PHONE_ACTION, { action: 'test-number' }),
        keywords: ['test', 'nummer', 'verbindung', 'check', 'latenz'],
      },
      {
        id: 'phone-logs',
        label: 'Logs öffnen',
        category: 'action',
        icon: ArchiveBoxIcon,
        shortcut: 'L',
        action: () => dispatch(AKLOW_EVENTS.RUN_PHONE_ACTION, { action: 'open-logs' }),
        keywords: ['logs', 'verlauf', 'anrufe', 'historie'],
      },
    ]
    commands.push(...phoneActions)
  }

  // --- Website-Specific ---
  if (ctx.activeModuleToken === 'website') {
    const websiteActions: Command[] = [
      {
        id: 'web-faq',
        label: 'FAQ-Ideen generieren',
        category: 'action',
        icon: SparklesIcon,
        shortcut: 'F',
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'generate-faq' }),
        keywords: ['faq', 'fragen', 'ideen', 'content'],
      },
      {
        id: 'web-rewrite',
        label: 'Content Rewrite',
        category: 'action',
        icon: PencilSquareIcon,
        shortcut: 'R',
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'rewrite' }),
        keywords: ['rewrite', 'umschreiben', 'optimieren'],
      },
      {
        id: 'web-summarize',
        label: 'Summary',
        category: 'action',
        icon: DocumentTextIcon,
        shortcut: 'S',
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'summarize' }),
        keywords: ['zusammenfassung', 'summary'],
      },
      {
        id: 'web-knowledge-check',
        label: 'Knowledge gaps scannen',
        category: 'action',
        icon: EyeIcon,
        shortcut: 'K',
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'knowledge-check' }),
        keywords: ['gaps', 'wissen', 'prüfung', 'check'],
      },
      {
        id: 'web-seo',
        label: 'SEO Snippet generieren',
        category: 'action',
        icon: MagnifyingGlassIcon,
        shortcut: 'E',
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'generate-seo' }),
        keywords: ['seo', 'snippet', 'meta', 'ranking'],
      },
      {
        id: 'web-convos',
        label: 'Website-Bot Konversationen öffnen',
        category: 'action',
        icon: ChatBubbleLeftRightIcon,
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'open-convos' }),
        keywords: ['konversationen', 'chats', 'besucher', 'verlauf'],
      },
      {
        id: 'web-appearance',
        label: 'Appearance öffnen',
        category: 'action',
        icon: SwatchIcon,
        shortcut: 'A',
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'open-appearance' }),
        keywords: ['appearance', 'design', 'aussehen', 'farben', 'logo'],
      },
      {
        id: 'web-embed',
        label: 'Embed Code kopieren',
        category: 'action',
        icon: CodeBracketIcon,
        shortcut: 'C',
        action: () => dispatch(AKLOW_EVENTS.RUN_WEBSITE_ACTION, { action: 'copy-embed' }),
        keywords: ['embed', 'code', 'einbetten', 'snippet', 'javascript'],
      },
    ]
    commands.push(...websiteActions)
  }

  return commands
}
