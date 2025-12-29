import {
  InboxIcon,
  DocumentIcon,
  BoltIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
  BuildingOfficeIcon,
  UserIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  RectangleStackIcon,
  HomeIcon,
  SparklesIcon,
  ChartBarIcon,
  PhotoIcon,
  PhoneIcon,
  GlobeAltIcon,
  StarIcon,
  CreditCardIcon,
  PaintBrushIcon,
  LanguageIcon,
  BellIcon,
  ServerIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

export type WorkspaceId = 'inbox' | 'docs' | 'serviceHub' | 'chat' | 'marketing' | 'settings' | 'actions' | 'customers' | 'leads';

export interface SidebarItem {
  key: string;
  label: string;
  icon?: typeof InboxIcon;
  group?: string;
}

export interface WorkspaceConfig {
  id: WorkspaceId;
  label: string;
  href: string;
  icon: typeof InboxIcon;
  sidebarItems: SidebarItem[];
  accent?: 'inbox' | 'documents' | 'actions' | 'customers' | 'chat' | 'marketing' | 'automations' | 'settings';
  showInRail?: boolean;
}

export const workspaces: WorkspaceConfig[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    href: '/inbox',
    icon: InboxIcon,
    accent: 'inbox',
    sidebarItems: [
      { key: 'inbox', label: 'Inbox', icon: InboxIcon },
      { key: 'today', label: 'Heute', icon: CalendarIcon },
      { key: 'open', label: 'Offen', icon: CheckCircleIcon },
      { key: 'archive', label: 'Archiv', icon: ArchiveBoxIcon },
      { key: 'activity', label: 'Aktivität', icon: ClockIcon },
    ],
  },
  {
    id: 'chat',
    label: 'Chat',
    href: '/chat',
    icon: ChatBubbleLeftRightIcon,
    accent: 'chat',
    sidebarItems: [
      { key: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
    ],
  },
  {
    id: 'serviceHub',
    label: 'Service Hub',
    href: '/inbox',
    icon: UsersIcon,
    accent: 'customers',
    sidebarItems: [
      { key: 'inbox', label: 'Inbox', icon: InboxIcon },
      { key: 'docs', label: 'Dokumente', icon: DocumentIcon },
      { key: 'customers', label: 'Kunden', icon: UsersIcon },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    href: '/actions',
    icon: BoltIcon,
    accent: 'actions',
    showInRail: false,
    sidebarItems: [
      { key: 'all', label: 'Alle Actions', icon: BoltIcon },
      { key: 'communication', label: 'Kommunikation', icon: ChatBubbleBottomCenterTextIcon },
      { key: 'setup', label: 'Setup', icon: Cog6ToothIcon },
      { key: 'archive', label: 'Archiv', icon: ArchiveBoxIcon },
    ],
  },
  {
    id: 'customers',
    label: 'CRM',
    href: '/customers',
    icon: UsersIcon,
    accent: 'customers',
    showInRail: false,
    sidebarItems: [
      { key: 'all', label: 'Alle Kontakte', icon: UsersIcon },
      { key: 'companies', label: 'Firmen', icon: BuildingOfficeIcon },
      { key: 'contacts', label: 'Personen', icon: UserIcon },
      { key: 'archive', label: 'Archiv', icon: ArchiveBoxIcon },
    ],
  },
  {
    id: 'leads',
    label: 'Leads',
    href: '/leads',
    icon: UserGroupIcon,
    accent: 'customers',
    showInRail: false,
    sidebarItems: [
      { key: 'all', label: 'Alle Leads', icon: UserGroupIcon },
      { key: 'new', label: 'Neu', icon: CheckCircleIcon },
      { key: 'contacted', label: 'Kontaktiert', icon: ChatBubbleLeftRightIcon },
      { key: 'qualified', label: 'Qualifiziert', icon: StarIcon },
    ],
  },
  {
    id: 'docs',
    label: 'Dokumente',
    href: '/docs',
    icon: DocumentIcon,
    accent: 'documents',
    showInRail: false,
    sidebarItems: [
      { key: 'all', label: 'Alle Dateien', icon: DocumentIcon },
      { key: 'uploads', label: 'Meine Uploads', icon: CloudArrowUpIcon },
      { key: 'recent', label: 'Zuletzt', icon: ClockIcon },
    ],
  },
  {
    id: 'settings',
    label: 'Einstellungen',
    href: '/settings',
    icon: Cog6ToothIcon,
    accent: 'settings',
    sidebarItems: [
      // Einführung
      { key: 'onboarding', label: 'Erste Schritte', icon: SparklesIcon, group: 'Einführung' },
      
      // Personal
      { key: 'account', label: 'Mein Account', icon: UserCircleIcon, group: 'Personal' },
      { key: 'appearance', label: 'Aussehen', icon: PaintBrushIcon, group: 'Personal' },
      { key: 'locale', label: 'Sprache & Zeit', icon: LanguageIcon, group: 'Personal' },
      { key: 'notifications', label: 'Benachrichtigungen', icon: BellIcon, group: 'Personal' },
      
      // Workspace
      { key: 'collaboration', label: 'Teams', icon: UserGroupIcon, group: 'Workspace' },
      
      // System
      { key: 'general', label: 'Allgemein', icon: AdjustmentsHorizontalIcon, group: 'System' },
      { key: 'ai', label: 'KI & Modelle', icon: CpuChipIcon, group: 'System' },
      { key: 'agents', label: 'Agenten', icon: GlobeAltIcon, group: 'System' },
      
      // Automatisierung
      { key: 'automations', label: 'KI-Vorschläge', icon: BoltIcon, group: 'Automatisierung' },
      
      // KMU Tools
      { key: 'kmu-templates', label: 'Quick Templates', icon: DocumentDuplicateIcon, group: 'KMU Tools' },
      { key: 'kmu-kb', label: 'Knowledge Base', icon: BookOpenIcon, group: 'KMU Tools' },
      { key: 'kmu-reports', label: 'Weekly Reports', icon: ChartBarIcon, group: 'KMU Tools' },
      { key: 'kmu-auto-reply', label: 'Auto-Reply', icon: BoltIcon, group: 'KMU Tools' },
      
      // Sicherheit & Infrastruktur
      { key: 'security', label: 'Sicherheit', icon: ShieldCheckIcon, group: 'Sicherheit' },
      { key: 'database', label: 'Datenbank', icon: ServerIcon, group: 'Infrastruktur' },
      { key: 'memory', label: 'Memory', icon: RectangleStackIcon, group: 'Infrastruktur' },
      
      // Organisation
      { key: 'users', label: 'Benutzer', icon: UsersIcon, group: 'Organisation' },
      { key: 'billing', label: 'Abrechnung', icon: CreditCardIcon, group: 'Organisation' },
      { key: 'modules', label: 'Module & Plan', icon: CreditCardIcon, group: 'Organisation' },
      
      // Integrationen
      { key: 'integrations', label: 'Integrationen', icon: PuzzlePieceIcon, group: 'Integrationen' },
    ],
  },
];

export function getWorkspaceById(id: WorkspaceId): WorkspaceConfig | undefined {
  return workspaces.find((w) => w.id === id);
}

export function getWorkspaceByPath(pathname: string): WorkspaceConfig | undefined {
  return workspaces.find((w) => pathname.startsWith(w.href));
}
