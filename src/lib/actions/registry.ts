import type { ActionDefinition, ActionId, ActionModule, ActionOutputType } from './types'

// Core-10 Lockdown: Executable Action IDs (Source of Truth)
// Nur diese Actions können tatsächlich ausgeführt werden (fail-closed)
export const EXECUTABLE_ACTION_IDS = [
  // Core-10 (canonical)
  'inbox.summarize',
  'inbox.draft_reply',
  'inbox.ask_missing_info',
  'inbox.next_steps',
  'inbox.prioritize',
  'inbox.create_task',
  'crm.link_to_customer',
  'customers.create',
  'customers.segment',
  'customers.cleanup',
  'customers.health_check',
  'documents.extract_key_fields',
  'documents.summarize',
  'documents.upload',
  'reviews.draft_review_reply',
  'reviews.analyze_sentiment',
  'reviews.request_reviews',
  'reviews.competitor_analysis',
  'website.fetch_and_profile',
  'website.train_bot',
  'website.ab_test',
  'telephony.summarize_call',
  'telephony.transcribe_call',
  'telephony.process_voicemails',
  'telephony.callback_campaign',
  'telegram.broadcast',
  'telegram.configure_autoreply',
  'telegram.analyze_chats',
  'telegram.set_personality',
  'telegram.test_message',
  'calendar.find_slots',
  'calendar.create_event',
  'automation.trigger_workflow',
  'automation.inbox_auto_triage',
  'automation.docs_auto_process',
  'automation.crm_enrich_lead',
  'automation.review_auto_reply',
  // BETA: Marketing Actions (gated by NEXT_PUBLIC_MARKETING_BETA + entitlement)
  // These actions are hidden from UI by default and only available when marketing beta is enabled
  'marketing.generate_content',
  'marketing.optimize_campaign',
  'marketing.autopilot_run',
  'marketing.generate_image',
  'marketing.check_virality',
  'marketing.clone_style',
  'marketing.trend_scout',
  'marketing.ideas_from_reviews',
  'marketing.repurpose_content',
  'marketing.competitor_watchdog',
  // Legacy Aliases (werden serverseitig normalisiert)
  'inbox.draftReply',
  'inbox.nextSteps',
  'documents.extractKeyFields',
] as const

// Type assertion für TypeScript-Kompatibilität
const _typeCheck: readonly ActionId[] = EXECUTABLE_ACTION_IDS

export type ExecutableActionId = (typeof EXECUTABLE_ACTION_IDS)[number]

export const EXECUTABLE_ACTION_ID_SET = new Set<string>(EXECUTABLE_ACTION_IDS)

// Legacy: ALLOWED_ACTION_IDS als Alias für Kompatibilität
export const ALLOWED_ACTION_IDS: Set<ActionId> = EXECUTABLE_ACTION_ID_SET as Set<ActionId>

// Type Guard: Prüft ob eine ActionId executable ist
export function isExecutableActionId(id: string): id is ExecutableActionId {
  return EXECUTABLE_ACTION_ID_SET.has(id)
}

// Action ID Alias Mapping (Alias -> canonical)
export const ACTION_ID_ALIASES: Record<string, ActionId> = {
  'inbox.draftReply': 'inbox.draft_reply',
  'inbox.nextSteps': 'inbox.next_steps',
  'documents.extractKeyFields': 'documents.extract_key_fields',
}

// Normalisiert eine ActionId zu einer ExecutableActionId (oder null)
export function normalizeExecutableActionId(id: string): ExecutableActionId | null {
  // Zuerst Alias-Mapping prüfen
  const mapped = ACTION_ID_ALIASES[id] ?? id
  // Dann prüfen ob executable
  return isExecutableActionId(mapped) ? (mapped as ExecutableActionId) : null
}

const def = (
  id: ActionId,
  label: string,
  module: ActionModule,
  outputType: ActionOutputType,
  options: Partial<Omit<ActionDefinition, 'id' | 'label' | 'outputType'>> = {},
): ActionDefinition => ({
  id,
  label,
  supportedModules: options.supportedModules ?? [module],
  outputType,
  requiresApproval: true,
  uiPlacement: 'primary',
  uiOrder: 1000,
  ...options,
})

export const ACTION_REGISTRY: Record<ActionId, ActionDefinition> = {
  // Inbox (Core-7 - canonical IDs)
  'inbox.summarize': def('inbox.summarize', 'Zusammenfassen', 'inbox', 'summary', { 
    defaultTone: 'neutral',
    icon: 'SparklesIcon',
    uiOrder: 10,
    requiresApproval: false,
  }),
  'inbox.draft_reply': def('inbox.draft_reply', 'Antwortentwurf', 'inbox', 'draft', { 
    defaultTone: 'locker',
    icon: 'ArrowPathIcon',
    uiOrder: 20,
    requiresApproval: true,
  }),
  'inbox.ask_missing_info': def('inbox.ask_missing_info', 'Rückfragen', 'inbox', 'draft', { 
    defaultTone: 'neutral',
    icon: 'QuestionMarkCircleIcon',
    uiOrder: 30,
    requiresApproval: true,
  }),
  'inbox.next_steps': def('inbox.next_steps', 'Nächste Schritte', 'inbox', 'tasks', {
    icon: 'ListBulletIcon',
    uiOrder: 40,
    requiresApproval: false,
  }),
  'inbox.create_task': def('inbox.create_task', 'Aufgabe erstellen', 'inbox', 'tasks', {
    icon: 'CheckCircleIcon',
    uiOrder: 45,
    requiresApproval: true,
  }),
  // Legacy Inbox (für Kompatibilität, werden normalisiert)
  'inbox.top3': def('inbox.top3', 'Top 3 Punkte', 'inbox', 'summary', { 
    description: 'Priorisierte Liste', 
    defaultTone: 'short',
    icon: 'SparklesIcon',
    uiPlacement: 'secondary',
    uiOrder: 50,
    requiresApproval: false,
  }),
  'inbox.draftReply': def('inbox.draftReply', 'Antwortentwurf', 'inbox', 'draft', { 
    defaultTone: 'locker',
    icon: 'ArrowPathIcon',
    uiPlacement: 'hidden', // Legacy, wird normalisiert
    requiresApproval: true,
  }),
  'inbox.nextSteps': def('inbox.nextSteps', 'Nächste Schritte', 'inbox', 'tasks', {
    icon: 'ListBulletIcon',
    uiPlacement: 'hidden', // Legacy, wird normalisiert
    requiresApproval: false,
  }),
  'inbox.assignCase': def('inbox.assignCase', 'Fall zuordnen', 'inbox', 'classification', { 
    uiPlacement: 'secondary',
    icon: 'UserGroupIcon',
    uiOrder: 100,
    requiresApproval: true,
  }),
  'inbox.setNotifications': def('inbox.setNotifications', 'Benachrichtigungen', 'inbox', 'riskFlags', { 
    uiPlacement: 'secondary',
    icon: 'BellIcon',
    uiOrder: 110,
    requiresApproval: true,
  }),

  // Customers
  'customers.profileShort': def('customers.profileShort', 'Profil Kurzfassung', 'customers', 'summary', {
    icon: 'UserGroupIcon',
    uiOrder: 10,
    requiresApproval: false,
  }),
  'customers.top3Open': def('customers.top3Open', 'Top 3 offene Punkte', 'customers', 'tasks', {
    icon: 'ListBulletIcon',
    uiOrder: 20,
    requiresApproval: false,
  }),
  'customers.nextSteps': def('customers.nextSteps', 'Nächste Schritte', 'customers', 'tasks', {
    icon: 'ListBulletIcon',
    uiOrder: 30,
    requiresApproval: false,
  }),
  'customers.followupDraft': def('customers.followupDraft', 'Follow-up Entwurf', 'customers', 'draft', { 
    defaultTone: 'locker',
    icon: 'ArrowPathIcon',
    uiOrder: 40,
    requiresApproval: true,
  }),
  'customers.timelineSummary': def('customers.timelineSummary', 'Verlauf zusammenfassen', 'customers', 'summary', {
    icon: 'SparklesIcon',
    uiOrder: 50,
    requiresApproval: false,
  }),
  'customers.risksBlockers': def('customers.risksBlockers', 'Risiken & Blocker', 'customers', 'riskFlags', { 
    uiPlacement: 'secondary',
    icon: 'ExclamationTriangleIcon',
    uiOrder: 100,
    requiresApproval: false,
  }),
  'customers.suggestTags': def('customers.suggestTags', 'Tags vorschlagen', 'customers', 'tags', { 
    uiPlacement: 'secondary',
    icon: 'TagIcon',
    uiOrder: 110,
    requiresApproval: false,
  }),
  'customers.create': def('customers.create', 'Kunde anlegen', 'customers', 'extraction', {
    icon: 'UserPlusIcon',
    uiOrder: 15,
    requiresApproval: false,
  }),

  // Growth
  'growth.variants3': def('growth.variants3', '3 Varianten erstellen', 'growth', 'draft', { 
    defaultTone: 'short',
    icon: 'SparklesIcon',
    uiOrder: 10,
    requiresApproval: false,
  }),
  'growth.hookImprove': def('growth.hookImprove', 'Hook verbessern', 'growth', 'draft', {
    icon: 'ArrowPathIcon',
    uiOrder: 20,
    requiresApproval: false,
  }),
  'growth.ctaSuggestions': def('growth.ctaSuggestions', 'CTA Vorschläge', 'growth', 'draft', {
    icon: 'SparklesIcon',
    uiOrder: 30,
    requiresApproval: false,
  }),
  'growth.translate': def('growth.translate', 'Übersetzen (Stub)', 'growth', 'draft', {
    icon: 'GlobeAltIcon',
    uiOrder: 40,
    requiresApproval: false,
  }),
  'growth.campaignPlan': def('growth.campaignPlan', 'Kampagnenplan', 'growth', 'plan', {
    icon: 'DocumentTextIcon',
    uiOrder: 50,
    requiresApproval: true,
  }),
  'growth.newsletterStart': def('growth.newsletterStart', 'Newsletter starten', 'growth', 'plan', {
    icon: 'PaperAirplaneIcon',
    uiOrder: 60,
    requiresApproval: true,
  }),
  'growth.keywordCluster': def('growth.keywordCluster', 'Keyword Cluster', 'growth', 'tags', {
    icon: 'TagIcon',
    uiOrder: 70,
    requiresApproval: false,
  }),

  // Storage
  'storage.summarize': def('storage.summarize', 'Speicher zusammenfassen', 'storage', 'summary', {
    icon: 'SparklesIcon',
    uiOrder: 10,
    requiresApproval: false,
  }),
  'storage.extractFacts': def('storage.extractFacts', 'Fakten extrahieren', 'storage', 'extraction', {
    icon: 'DocumentTextIcon',
    uiOrder: 20,
    requiresApproval: false,
  }),
  'storage.saveAsMemory': def('storage.saveAsMemory', 'Als Memory speichern', 'storage', 'classification', {
    icon: 'BookmarkIcon',
    uiOrder: 30,
    requiresApproval: true,
  }),
  'storage.suggestTags': def('storage.suggestTags', 'Tags vorschlagen', 'storage', 'tags', { 
    uiPlacement: 'secondary',
    icon: 'TagIcon',
    uiOrder: 100,
    requiresApproval: false,
  }),
  'storage.editMemory': def('storage.editMemory', 'Memory bearbeiten', 'storage', 'summary', { 
    uiPlacement: 'secondary',
    icon: 'PencilIcon',
    uiOrder: 110,
    requiresApproval: true,
  }),

  // Documents (Core-10 - canonical IDs)
  'documents.extract_key_fields': def('documents.extract_key_fields', 'Schlüsselfelder extrahieren', 'documents', 'extraction', {
    icon: 'DocumentTextIcon',
    uiOrder: 10,
    requiresApproval: false,
  }),
  'documents.summarize': def('documents.summarize', 'Dokument zusammenfassen', 'documents', 'summary', {
    icon: 'DocumentIcon',
    uiOrder: 20,
    requiresApproval: false,
  }),
  'documents.upload': def('documents.upload', 'Dokument hochladen', 'documents', 'notification', {
    icon: 'CloudArrowUpIcon',
    uiOrder: 5,
    requiresApproval: false,
  }),
  // Legacy Documents (für Kompatibilität)
  'documents.extractKeyFields': def('documents.extractKeyFields', 'Schlüsselfelder extrahieren', 'documents', 'extraction', {
    icon: 'DocumentTextIcon',
    uiPlacement: 'hidden', // Legacy, wird normalisiert
    requiresApproval: false,
  }),
  'documents.classify': def('documents.classify', 'Dokument klassifizieren', 'documents', 'classification', { 
    uiPlacement: 'secondary',
    icon: 'TagIcon',
    uiOrder: 100,
    requiresApproval: false,
  }),
  'documents.suggestNextSteps': def('documents.suggestNextSteps', 'Nächste Schritte', 'documents', 'tasks', {
    icon: 'ListBulletIcon',
    uiOrder: 30,
    requiresApproval: false,
  }),
  'documents.saveAsMemory': def('documents.saveAsMemory', 'Als Memory speichern', 'documents', 'classification', { 
    uiPlacement: 'secondary',
    icon: 'BookmarkIcon',
    uiOrder: 110,
    requiresApproval: true,
  }),
  'documents.routeToCase': def('documents.routeToCase', 'Fall zuordnen', 'documents', 'classification', { 
    uiPlacement: 'secondary',
    icon: 'ArrowRightIcon',
    uiOrder: 120,
    requiresApproval: true,
  }),
  
  // CRM (Core-7)
  'crm.link_to_customer': def('crm.link_to_customer', 'Zu Kunde zuordnen', 'crm', 'classification', { 
    uiPlacement: 'primary',
    icon: 'UserGroupIcon',
    uiOrder: 10,
    requiresApproval: true,
    supportedModules: ['crm', 'inbox', 'customers'],
  }),
  
  // Reviews (Core-10)
  'reviews.draft_review_reply': def('reviews.draft_review_reply', 'Review beantworten', 'reviews', 'draft', { 
    defaultTone: 'formal',
    icon: 'ChatBubbleLeftRightIcon',
    uiOrder: 10,
    requiresApproval: true,
  }),
  // Core-10 New Actions
  'inbox.prioritize': def('inbox.prioritize', 'Priorisieren', 'inbox', 'tasks', {
    icon: 'ListBulletIcon',
    uiOrder: 45,
    requiresApproval: false,
  }),
  'website.fetch_and_profile': def('website.fetch_and_profile', 'Website analysieren (intern)', 'storage', 'extraction', {
    uiPlacement: 'hidden',  // Hidden - nur intern nutzbar
    requiresApproval: false,
  }),
  // Calendar
  'calendar.find_slots': def('calendar.find_slots', 'Slots finden', 'calendar', 'summary', {
    icon: 'CalendarIcon',
    uiPlacement: 'secondary',
    uiOrder: 20,
    requiresApproval: false,
  }),
  'calendar.create_event': def('calendar.create_event', 'Termin anlegen', 'calendar', 'notification', {
    icon: 'CalendarIcon',
    uiPlacement: 'secondary',
    uiOrder: 30,
    requiresApproval: true,
  }),
  // Automation
  'automation.trigger_workflow': def('automation.trigger_workflow', 'Automation auslösen', 'automation', 'notification', {
    icon: 'BoltIcon',
    uiPlacement: 'secondary',
    uiOrder: 40,
    requiresApproval: true,
  }),
  'automation.inbox_auto_triage': def('automation.inbox_auto_triage', 'Inbox Auto-Triage', 'inbox', 'summary', {
    icon: 'SparklesIcon',
    uiPlacement: 'secondary',
    uiOrder: 50,
    requiresApproval: false,
  }),
  'automation.docs_auto_process': def('automation.docs_auto_process', 'Doc Auto-Processing', 'documents', 'summary', {
    icon: 'SparklesIcon',
    uiPlacement: 'secondary',
    uiOrder: 60,
    requiresApproval: false,
  }),
  'automation.crm_enrich_lead': def('automation.crm_enrich_lead', 'Lead anreichern', 'crm', 'notification', {
    icon: 'UserGroupIcon',
    uiPlacement: 'secondary',
    uiOrder: 70,
    requiresApproval: false,
  }),
  'automation.review_auto_reply': def('automation.review_auto_reply', 'Review Auto-Reply', 'reviews', 'draft', {
    icon: 'ChatBubbleLeftRightIcon',
    uiPlacement: 'secondary',
    uiOrder: 80,
    requiresApproval: true,
  }),
  // BETA: Marketing Actions (gated by feature flag + entitlement)
  'marketing.generate_content': def('marketing.generate_content', 'Content generieren', 'growth', 'draft', {
    icon: 'SparklesIcon',
    uiOrder: 10,
    requiresApproval: true,
  }),
  'marketing.optimize_campaign': def('marketing.optimize_campaign', 'Kampagne optimieren', 'growth', 'summary', {
    icon: 'ArrowPathIcon',
    uiOrder: 20,
    requiresApproval: false,
  }),
  'marketing.autopilot_run': def('marketing.autopilot_run', 'Autopilot starten', 'growth', 'notification', {
    icon: 'BoltIcon',
    uiPlacement: 'secondary',
    uiOrder: 30,
    requiresApproval: true,
  }),
  'marketing.generate_image': def('marketing.generate_image', 'KI-Bild generieren', 'growth', 'notification', {
    icon: 'PhotoIcon',
    uiOrder: 40,
    requiresApproval: true,
  }),
  'marketing.check_virality': def('marketing.check_virality', 'Viralitäts-Check', 'growth', 'summary', {
    icon: 'FireIcon',
    uiOrder: 50,
    requiresApproval: false,
  }),
  'marketing.clone_style': def('marketing.clone_style', 'Stil lernen', 'growth', 'notification', {
    icon: 'UserCircleIcon',
    uiOrder: 60,
    requiresApproval: true,
  }),
  'marketing.trend_scout': def('marketing.trend_scout', 'Trend Scout', 'growth', 'summary', {
    icon: 'GlobeAltIcon',
    uiOrder: 70,
    requiresApproval: false,
  }),
  'marketing.ideas_from_reviews': def('marketing.ideas_from_reviews', 'Ideen aus Reviews', 'growth', 'plan', {
    icon: 'ChatBubbleBottomCenterTextIcon',
    uiOrder: 80,
    requiresApproval: false,
  }),
  'marketing.repurpose_content': def('marketing.repurpose_content', 'Content Recycler', 'growth', 'draft', {
    icon: 'ArrowPathRoundedSquareIcon',
    uiOrder: 90,
    requiresApproval: true,
  }),
  'marketing.competitor_watchdog': def('marketing.competitor_watchdog', 'Konkurrenz-Check', 'growth', 'summary', {
    icon: 'EyeIcon',
    uiOrder: 100,
    requiresApproval: false,
  }),
  
  // Customers - Neue Actions
  'customers.segment': def('customers.segment', 'Kunden segmentieren', 'customers', 'extraction', {
    icon: 'TagIcon',
    uiOrder: 60,
    requiresApproval: false,
  }),
  'customers.cleanup': def('customers.cleanup', 'Daten bereinigen', 'customers', 'summary', {
    icon: 'ArrowPathIcon',
    uiOrder: 70,
    requiresApproval: true,
    description: 'Findet Duplikate und bereinigt veraltete Kundendaten',
  }),
  'customers.health_check': def('customers.health_check', 'Kundengesundheit', 'customers', 'summary', {
    icon: 'HeartIcon',
    uiOrder: 80,
    requiresApproval: false,
    description: 'Analysiert Engagement und identifiziert gefährdete Kunden',
  }),
  
  // Reviews - Neue Actions
  'reviews.analyze_sentiment': def('reviews.analyze_sentiment', 'Sentiment-Analyse', 'reviews', 'summary', {
    icon: 'ChartBarIcon',
    uiOrder: 20,
    requiresApproval: false,
    description: 'Analysiert die Stimmung aller Bewertungen im Zeitverlauf',
  }),
  'reviews.request_reviews': def('reviews.request_reviews', 'Bewertungen anfragen', 'reviews', 'notification', {
    icon: 'ShareIcon',
    uiOrder: 30,
    requiresApproval: true,
    description: 'Startet eine Kampagne um mehr positive Bewertungen zu sammeln',
  }),
  'reviews.competitor_analysis': def('reviews.competitor_analysis', 'Wettbewerber-Check', 'reviews', 'summary', {
    icon: 'EyeIcon',
    uiOrder: 40,
    requiresApproval: false,
    description: 'Vergleicht Bewertungen mit denen der Konkurrenz',
  }),
  
  // Website Bot - Neue Actions
  'website.train_bot': def('website.train_bot', 'Bot trainieren', 'website', 'notification', {
    icon: 'SparklesIcon',
    uiOrder: 10,
    requiresApproval: true,
    description: 'Trainiert den Bot mit neuen FAQs und Produktinformationen',
  }),
  'website.ab_test': def('website.ab_test', 'A/B Test starten', 'website', 'notification', {
    icon: 'BeakerIcon',
    uiOrder: 20,
    requiresApproval: true,
    description: 'Testet verschiedene Begrüßungen und Flows gegeneinander',
  }),
  
  // Telephony - Neue Actions
  'telephony.summarize_call': def('telephony.summarize_call', 'Anruf zusammenfassen', 'telephony', 'summary', {
    icon: 'DocumentTextIcon',
    uiOrder: 10,
    requiresApproval: false,
    description: 'Erstellt KI-Zusammenfassung eines Telefonats mit Aktionspunkten',
  }),
  'telephony.transcribe_call': def('telephony.transcribe_call', 'Anruf transkribieren', 'telephony', 'extraction', {
    icon: 'ChatBubbleBottomCenterTextIcon',
    uiOrder: 20,
    requiresApproval: false,
    description: 'Vollständige Transkription eines Anrufs',
  }),
  'telephony.process_voicemails': def('telephony.process_voicemails', 'Voicemails verarbeiten', 'telephony', 'summary', {
    icon: 'MicrophoneIcon',
    uiOrder: 30,
    requiresApproval: false,
    description: 'Transkribiert und kategorisiert alle neuen Voicemails',
  }),
  'telephony.callback_campaign': def('telephony.callback_campaign', 'Rückruf-Kampagne', 'telephony', 'notification', {
    icon: 'PhoneArrowUpRightIcon',
    uiOrder: 40,
    requiresApproval: true,
    description: 'Startet automatische Rückruf-Erinnerungen für verpasste Anrufe',
  }),
  // Telegram Workflows
  'telegram.broadcast': def('telegram.broadcast', 'Broadcast starten', 'telegram', 'notification', {
    icon: 'MegaphoneIcon',
    uiOrder: 10,
    requiresApproval: true,
    description: 'Sendet eine Nachricht an alle Telegram-Nutzer gleichzeitig',
  }),
  'telegram.configure_autoreply': def('telegram.configure_autoreply', 'Auto-Reply konfigurieren', 'telegram', 'notification', {
    icon: 'SparklesIcon',
    uiOrder: 20,
    requiresApproval: true,
    description: 'Konfiguriert das KI-Antwortverhalten für verschiedene Telegram-Szenarien',
  }),
  'telegram.analyze_chats': def('telegram.analyze_chats', 'Chat-Analyse', 'telegram', 'summary', {
    icon: 'ChartBarIcon',
    uiOrder: 30,
    requiresApproval: false,
    description: 'Analysiert Nutzerinteraktionen und häufige Themen in Telegram-Chats',
  }),
  'telegram.set_personality': def('telegram.set_personality', 'Bot-Persönlichkeit', 'telegram', 'notification', {
    icon: 'UserGroupIcon',
    uiOrder: 40,
    requiresApproval: true,
    description: 'Definiert Tone of Voice und Verhalten des Telegram-Bots',
  }),
  'telegram.test_message': def('telegram.test_message', 'Test-Nachricht', 'telegram', 'notification', {
    icon: 'BoltIcon',
    uiOrder: 50,
    requiresApproval: true,
    description: 'Sendet eine Testnachricht an den Telegram-Bot',
  }),
}

export const listActionsForModule = (module: ActionModule): ActionDefinition[] => {
  // Core-7 Lockdown: Nur executable Actions zurückgeben
  return Object.values(ACTION_REGISTRY).filter(
    (action) =>
      action.supportedModules.includes(module) &&
      EXECUTABLE_ACTION_ID_SET.has(action.id)
  )
}

export const getActionDefinition = (id: ActionId): ActionDefinition | undefined => ACTION_REGISTRY[id]

// Liefert ausführbare Action-IDs pro Modul (fail-closed)
export const listExecutableActionIdsForModule = (module: ActionModule): ExecutableActionId[] => {
  return listActionsForModule(module).map((action) => action.id as ExecutableActionId)
}
