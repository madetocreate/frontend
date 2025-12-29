import {
  InboxIcon,
  DocumentIcon,
  UsersIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  StarIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  UserPlusIcon,
  RectangleStackIcon,
  SparklesIcon,
  BoltIcon,
  CalendarIcon,
  TagIcon,
  FolderIcon,
  EnvelopeIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
  ChartBarIcon,
  EyeIcon,
  ShareIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  AdjustmentsHorizontalIcon,
  CogIcon,
  BeakerIcon,
  UserGroupIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { Entitlements } from '@/lib/entitlements';

export type HubArea = 'inbox' | 'docs' | 'customers' | 'marketing' | 'website' | 'reviews' | 'telephony' | 'telegram';

export interface HubCard {
  id: string;
  title: string;
  description: string;
  icon: any; 
  area: HubArea;
  requiresAddon?: boolean;
  addonKey?: keyof Entitlements;
  onClickActionId?: string;
  onClickRoute?: string;
  kind: 'action' | 'workflow' | 'link';
  iconColor?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'emerald' | 'amber' | 'fuchsia' | 'red' | 'cyan' | 'teal';
  size: 'large' | 'small'; // large = workflow, small = quick action
}

export const SERVICE_HUB_CARDS: HubCard[] = [
  // =====================
  // INBOX (8 cards: 4 large workflows + 4 small quick actions)
  // =====================
  // Large Workflows
  {
    id: 'inbox-auto-triage',
    title: 'Auto-Triage starten',
    description: 'KI kategorisiert und priorisiert alle offenen Nachrichten automatisch.',
    icon: SparklesIcon,
    area: 'inbox',
    kind: 'workflow',
    onClickActionId: 'automation.inbox_auto_triage',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'inbox-bulk-reply',
    title: 'Sammelantwort erstellen',
    description: 'Beantworte mehrere ähnliche Anfragen mit einem KI-generierten Template.',
    icon: EnvelopeIcon,
    area: 'inbox',
    kind: 'workflow',
    onClickActionId: 'inbox.draft_reply',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'inbox-followup-campaign',
    title: 'Follow-up Kampagne',
    description: 'Starte automatische Nachfass-Sequenzen für offene Konversationen.',
    icon: ClockIcon,
    area: 'inbox',
    kind: 'workflow',
    onClickActionId: 'automation.trigger_workflow',
    iconColor: 'orange',
    size: 'large'
  },
  {
    id: 'inbox-sentiment-report',
    title: 'Stimmungsanalyse',
    description: 'Analysiere die Stimmung aller Nachrichten der letzten 7 Tage.',
    icon: ChartBarIcon,
    area: 'inbox',
    kind: 'workflow',
    onClickActionId: 'inbox.summarize',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'inbox-triage',
    title: 'Posteingang öffnen',
    description: 'Zur Inbox navigieren.',
    icon: InboxIcon,
    area: 'inbox',
    kind: 'link',
    onClickRoute: '/inbox',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'inbox-task',
    title: 'Aufgabe erstellen',
    description: 'Neue Aufgabe anlegen.',
    icon: CheckCircleIcon,
    area: 'inbox',
    kind: 'action',
    onClickActionId: 'inbox.create_task',
    iconColor: 'green',
    size: 'small'
  },
  {
    id: 'inbox-activity',
    title: 'Aktivität ansehen',
    description: 'Verlauf anzeigen.',
    icon: ClockIcon,
    area: 'inbox',
    kind: 'link',
    onClickRoute: '/inbox?view=activity',
    iconColor: 'amber',
    size: 'small'
  },
  {
    id: 'inbox-search',
    title: 'Suchen',
    description: 'Nachrichten durchsuchen.',
    icon: MagnifyingGlassIcon,
    area: 'inbox',
    kind: 'link',
    onClickRoute: '/inbox',
    iconColor: 'indigo',
    size: 'small'
  },

  // =====================
  // DOCS (8 cards)
  // =====================
  // Large Workflows
  {
    id: 'docs-batch-process',
    title: 'Stapelverarbeitung',
    description: 'Verarbeite alle neuen Dokumente automatisch mit KI-Extraktion.',
    icon: SparklesIcon,
    area: 'docs',
    kind: 'workflow',
    onClickActionId: 'automation.docs_auto_process',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'docs-smart-folder',
    title: 'Smart Folder erstellen',
    description: 'Erstelle einen intelligenten Ordner mit automatischer Kategorisierung.',
    icon: FolderIcon,
    area: 'docs',
    kind: 'workflow',
    onClickActionId: 'documents.summarize',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'docs-contract-check',
    title: 'Vertragsanalyse',
    description: 'Analysiere Verträge auf wichtige Klauseln und Fristen.',
    icon: DocumentDuplicateIcon,
    area: 'docs',
    kind: 'workflow',
    onClickActionId: 'documents.extract_key_fields',
    iconColor: 'orange',
    size: 'large'
  },
  {
    id: 'docs-knowledge-base',
    title: 'Knowledge Base füllen',
    description: 'Extrahiere Wissen aus Dokumenten für die KI-Wissensdatenbank.',
    icon: RectangleStackIcon,
    area: 'docs',
    kind: 'workflow',
    onClickActionId: 'documents.summarize',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'docs-upload',
    title: 'Hochladen',
    description: 'Neues Dokument.',
    icon: CloudArrowUpIcon,
    area: 'docs',
    kind: 'action',
    onClickActionId: 'documents.upload',
    iconColor: 'indigo',
    size: 'small'
  },
  {
    id: 'docs-search',
    title: 'Suchen',
    description: 'Dokumente finden.',
    icon: MagnifyingGlassIcon,
    area: 'docs',
    kind: 'link',
    onClickRoute: '/docs',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'docs-recent',
    title: 'Zuletzt geändert',
    description: 'Letzte Änderungen.',
    icon: ClockIcon,
    area: 'docs',
    kind: 'link',
    onClickRoute: '/docs?tab=recent',
    iconColor: 'amber',
    size: 'small'
  },
  {
    id: 'docs-all',
    title: 'Alle Dokumente',
    description: 'Übersicht öffnen.',
    icon: DocumentIcon,
    area: 'docs',
    kind: 'link',
    onClickRoute: '/docs',
    iconColor: 'green',
    size: 'small'
  },

  // =====================
  // CUSTOMERS (8 cards)
  // =====================
  // Large Workflows
  {
    id: 'cust-enrich',
    title: 'Leads anreichern',
    description: 'Reichere alle neuen Kontakte automatisch mit Firmendaten an.',
    icon: SparklesIcon,
    area: 'customers',
    kind: 'workflow',
    onClickActionId: 'automation.crm_enrich_lead',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'cust-segment',
    title: 'Segmentierung',
    description: 'Erstelle intelligente Kundensegmente basierend auf Verhalten.',
    icon: TagIcon,
    area: 'customers',
    kind: 'workflow',
    onClickActionId: 'customers.segment',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'cust-cleanup',
    title: 'Daten bereinigen',
    description: 'Finde und merge Duplikate, aktualisiere veraltete Daten.',
    icon: ArrowPathIcon,
    area: 'customers',
    kind: 'workflow',
    onClickActionId: 'customers.cleanup',
    iconColor: 'orange',
    size: 'large'
  },
  {
    id: 'cust-health-check',
    title: 'Kundengesundheit',
    description: 'Analysiere Engagement und identifiziere gefährdete Kunden.',
    icon: HeartIcon,
    area: 'customers',
    kind: 'workflow',
    onClickActionId: 'customers.health_check',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'cust-new',
    title: 'Neuer Kontakt',
    description: 'Kontakt anlegen.',
    icon: UserPlusIcon,
    area: 'customers',
    kind: 'action',
    onClickActionId: 'customers.create',
    iconColor: 'green',
    size: 'small'
  },
  {
    id: 'cust-search',
    title: 'Suchen',
    description: 'Kontakt finden.',
    icon: MagnifyingGlassIcon,
    area: 'customers',
    kind: 'link',
    onClickRoute: '/customers',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'cust-companies',
    title: 'Firmen',
    description: 'Firmenübersicht.',
    icon: UsersIcon,
    area: 'customers',
    kind: 'link',
    onClickRoute: '/customers?type=company',
    iconColor: 'indigo',
    size: 'small'
  },
  {
    id: 'cust-timeline',
    title: 'Timeline',
    description: 'Aktivitäten ansehen.',
    icon: ClockIcon,
    area: 'customers',
    kind: 'link',
    onClickRoute: '/customers',
    iconColor: 'amber',
    size: 'small'
  },

  // =====================
  // MARKETING (8 cards) - Addon
  // =====================
  // Large Workflows
  {
    id: 'mkt-autopilot',
    title: 'Autopilot starten',
    description: 'KI erstellt und plant Content für die nächsten 7 Tage automatisch.',
    icon: SparklesIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'workflow',
    onClickActionId: 'marketing.autopilot_run',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'mkt-campaign',
    title: 'Kampagne erstellen',
    description: 'Starte eine neue Multi-Channel Marketing-Kampagne.',
    icon: MegaphoneIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'link',
    onClickRoute: '/marketing/campaigns/new',
    iconColor: 'pink',
    size: 'large'
  },
  {
    id: 'mkt-trend-scout',
    title: 'Trend Scout',
    description: 'Finde virale Themen und Trends in deiner Branche.',
    icon: EyeIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'workflow',
    onClickActionId: 'marketing.trend_scout',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'mkt-competitor',
    title: 'Konkurrenz-Check',
    description: 'Analysiere die Marketing-Strategien deiner Wettbewerber.',
    icon: ChartBarIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'workflow',
    onClickActionId: 'marketing.competitor_watchdog',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'mkt-post',
    title: 'Post erstellen',
    description: 'Neuen Post planen.',
    icon: PencilSquareIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'link',
    onClickRoute: '/marketing?view=content',
    iconColor: 'purple',
    size: 'small'
  },
  {
    id: 'mkt-calendar',
    title: 'Kalender',
    description: 'Content-Plan ansehen.',
    icon: CalendarIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'link',
    onClickRoute: '/marketing?view=calendar',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'mkt-analytics',
    title: 'Analytics',
    description: 'Performance ansehen.',
    icon: ChartBarIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'link',
    onClickRoute: '/marketing?view=analytics',
    iconColor: 'green',
    size: 'small'
  },
  {
    id: 'mkt-library',
    title: 'Mediathek',
    description: 'Assets verwalten.',
    icon: FolderIcon,
    area: 'marketing',
    requiresAddon: true,
    addonKey: 'hasMarketing',
    kind: 'link',
    onClickRoute: '/marketing?view=library',
    iconColor: 'amber',
    size: 'small'
  },

  // =====================
  // WEBSITE BOT (8 cards) - Addon
  // =====================
  // Large Workflows
  {
    id: 'web-train',
    title: 'Bot trainieren',
    description: 'Trainiere den Bot mit neuen FAQs und Produktinformationen.',
    icon: SparklesIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'workflow',
    onClickActionId: 'website.train_bot',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'web-flow-builder',
    title: 'Flow Builder',
    description: 'Erstelle Konversations-Flows für Lead-Qualifizierung.',
    icon: BoltIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'link',
    onClickRoute: '/website?view=setup',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'web-ab-test',
    title: 'A/B Test starten',
    description: 'Teste verschiedene Begrüßungen und Flows gegeneinander.',
    icon: BeakerIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'workflow',
    onClickActionId: 'website.ab_test',
    iconColor: 'orange',
    size: 'large'
  },
  {
    id: 'web-lead-scoring',
    title: 'Lead Scoring Setup',
    description: 'Konfiguriere automatische Lead-Bewertung basierend auf Verhalten.',
    icon: ChartBarIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'link',
    onClickRoute: '/website?view=conversations',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'web-config',
    title: 'Konfiguration',
    description: 'Bot-Einstellungen.',
    icon: CogIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'link',
    onClickRoute: '/website?view=setup',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'web-conversations',
    title: 'Gespräche',
    description: 'Chat-Verlauf ansehen.',
    icon: ChatBubbleLeftRightIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'link',
    onClickRoute: '/website?view=conversations',
    iconColor: 'indigo',
    size: 'small'
  },
  {
    id: 'web-leads',
    title: 'Leads',
    description: 'Neue Leads ansehen.',
    icon: UserPlusIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'link',
    onClickRoute: '/customers',
    iconColor: 'green',
    size: 'small'
  },
  {
    id: 'web-analytics',
    title: 'Analytics',
    description: 'Bot-Performance.',
    icon: ChartBarIcon,
    area: 'website',
    requiresAddon: true,
    addonKey: 'hasWebsiteBot',
    kind: 'link',
    onClickRoute: '/website?view=overview',
    iconColor: 'amber',
    size: 'small'
  },

  // =====================
  // REVIEWS (8 cards) - Addon
  // =====================
  // Large Workflows
  {
    id: 'rev-auto-reply',
    title: 'Auto-Reply aktivieren',
    description: 'Aktiviere automatische KI-Antworten für neue Bewertungen.',
    icon: SparklesIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'workflow',
    onClickActionId: 'automation.review_auto_reply',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'rev-sentiment',
    title: 'Sentiment-Analyse',
    description: 'Analysiere die Stimmung aller Bewertungen im Zeitverlauf.',
    icon: ChartBarIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'workflow',
    onClickActionId: 'reviews.analyze_sentiment',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'rev-request',
    title: 'Bewertungen anfragen',
    description: 'Starte eine Kampagne um mehr positive Bewertungen zu sammeln.',
    icon: ShareIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'workflow',
    onClickActionId: 'reviews.request_reviews',
    iconColor: 'orange',
    size: 'large'
  },
  {
    id: 'rev-competitor',
    title: 'Wettbewerber-Check',
    description: 'Vergleiche deine Bewertungen mit denen der Konkurrenz.',
    icon: EyeIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'workflow',
    onClickActionId: 'reviews.competitor_analysis',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'rev-overview',
    title: 'Übersicht',
    description: 'Alle Bewertungen.',
    icon: StarIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'link',
    onClickRoute: '/reviews',
    iconColor: 'amber',
    size: 'small'
  },
  {
    id: 'rev-pending',
    title: 'Offen',
    description: 'Unbeantwortete.',
    icon: ClockIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'link',
    onClickRoute: '/reviews',
    iconColor: 'orange',
    size: 'small'
  },
  {
    id: 'rev-draft',
    title: 'Antwort schreiben',
    description: 'KI-Antwort erstellen.',
    icon: PencilSquareIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'action',
    onClickActionId: 'reviews.draft_review_reply',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'rev-settings',
    title: 'Einstellungen',
    description: 'Review-Settings.',
    icon: CogIcon,
    area: 'reviews',
    requiresAddon: true,
    addonKey: 'hasReviewBot',
    kind: 'link',
    onClickRoute: '/settings?view=addons&addon=reviews',
    iconColor: 'indigo',
    size: 'small'
  },

  // =====================
  // TELEPHONY (8 cards) - Addon
  // =====================
  // Large Workflows
  {
    id: 'tel-voicemail-process',
    title: 'Voicemails verarbeiten',
    description: 'Transkribiere und kategorisiere alle neuen Voicemails automatisch.',
    icon: MicrophoneIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'workflow',
    onClickActionId: 'telephony.process_voicemails',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'tel-callback-campaign',
    title: 'Rückruf-Kampagne',
    description: 'Starte automatische Rückruf-Erinnerungen für verpasste Anrufe.',
    icon: PhoneArrowUpRightIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'workflow',
    onClickActionId: 'telephony.callback_campaign',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'tel-summarize',
    title: 'Anruf zusammenfassen',
    description: 'Erstelle KI-Zusammenfassungen von Telefonaten mit Aktionspunkten.',
    icon: DocumentTextIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'workflow',
    onClickActionId: 'telephony.summarize_call',
    iconColor: 'orange',
    size: 'large'
  },
  {
    id: 'tel-transcribe',
    title: 'Anruf transkribieren',
    description: 'Vollständige Transkription von Anrufen für Dokumentation.',
    icon: ChatBubbleBottomCenterTextIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'workflow',
    onClickActionId: 'telephony.transcribe_call',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'tel-log',
    title: 'Anrufliste',
    description: 'Alle Anrufe.',
    icon: PhoneIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'link',
    onClickRoute: '/telephony?view=logs',
    iconColor: 'green',
    size: 'small'
  },
  {
    id: 'tel-missed',
    title: 'Verpasst',
    description: 'Verpasste Anrufe.',
    icon: PhoneArrowDownLeftIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'link',
    onClickRoute: '/telephony?view=logs',
    iconColor: 'red',
    size: 'small'
  },
  {
    id: 'tel-voicemail',
    title: 'Voicemails',
    description: 'Nachrichten hören.',
    icon: MicrophoneIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'link',
    onClickRoute: '/telephony?view=logs',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'tel-settings',
    title: 'Einstellungen',
    description: 'Telefonie-Settings.',
    icon: CogIcon,
    area: 'telephony',
    requiresAddon: true,
    addonKey: 'hasTelephony',
    kind: 'link',
    onClickRoute: '/settings?view=addons&addon=telephony',
    iconColor: 'indigo',
    size: 'small'
  },

  // =====================
  // TELEGRAM (8 cards) - Addon
  // =====================
  // Large Workflows
  {
    id: 'tg-broadcast',
    title: 'Broadcast starten',
    description: 'Sende eine Nachricht an alle Nutzer gleichzeitig.',
    icon: MegaphoneIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'workflow',
    onClickActionId: 'telegram.broadcast',
    iconColor: 'purple',
    size: 'large'
  },
  {
    id: 'tg-auto-reply',
    title: 'Auto-Reply konfigurieren',
    description: 'Passe das KI-Antwortverhalten für verschiedene Szenarien an.',
    icon: SparklesIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'workflow',
    onClickActionId: 'telegram.configure_autoreply',
    iconColor: 'blue',
    size: 'large'
  },
  {
    id: 'tg-analyze',
    title: 'Chat-Analyse',
    description: 'Analysiere Nutzerinteraktionen und häufige Themen.',
    icon: ChartBarIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'workflow',
    onClickActionId: 'telegram.analyze_chats',
    iconColor: 'orange',
    size: 'large'
  },
  {
    id: 'tg-personality',
    title: 'Bot-Persönlichkeit',
    description: 'Definiere Tone of Voice und Verhalten deines Bots.',
    icon: UserGroupIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'workflow',
    onClickActionId: 'telegram.set_personality',
    iconColor: 'emerald',
    size: 'large'
  },
  // Small Quick Actions
  {
    id: 'tg-chats',
    title: 'Chats',
    description: 'Alle Chats öffnen.',
    icon: ChatBubbleLeftRightIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'link',
    onClickRoute: '/telegram?view=chats',
    iconColor: 'blue',
    size: 'small'
  },
  {
    id: 'tg-new-broadcast',
    title: 'Neuer Broadcast',
    description: 'Nachricht verfassen.',
    icon: PaperAirplaneIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'link',
    onClickRoute: '/telegram?view=broadcasts',
    iconColor: 'indigo',
    size: 'small'
  },
  {
    id: 'tg-debug',
    title: 'Test-Nachricht',
    description: 'Bot testen.',
    icon: BoltIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'action',
    onClickActionId: 'telegram.test_message',
    iconColor: 'amber',
    size: 'small'
  },
  {
    id: 'tg-settings',
    title: 'Einstellungen',
    description: 'Bot konfigurieren.',
    icon: CogIcon,
    area: 'telegram',
    requiresAddon: true,
    addonKey: 'hasTelegram',
    kind: 'link',
    onClickRoute: '/settings?view=telegram',
    iconColor: 'indigo',
    size: 'small'
  },
];

// Dev-Check: Warnung wenn Service Hub Cards auf nicht-executable Actions zeigen
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  import('../actions/registry').then(({ normalizeExecutableActionId }) => {
    const issues: string[] = [];
    
    for (const card of SERVICE_HUB_CARDS) {
      if (card.onClickActionId && card.kind !== 'link') {
        const normalized = normalizeExecutableActionId(card.onClickActionId);
        if (!normalized) {
          issues.push(
            `Card "${card.id}" (${card.title}) verwendet onClickActionId "${card.onClickActionId}", ` +
            `die nicht in EXECUTABLE_ACTION_IDS enthalten ist.`
          );
        }
      }
    }
    
    if (issues.length > 0) {
      console.warn(
        '⚠️ Service Hub: Einige Cards zeigen auf nicht-executable Actions:\n' +
        issues.map(issue => `  - ${issue}`).join('\n') +
        '\n\nBitte füge diese Actions zu EXECUTABLE_ACTION_IDS hinzu oder entferne die onClickActionId.'
      );
    }
  }).catch(() => {
    // Ignore import errors in non-production builds
  });
}
