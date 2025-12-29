import type { z } from 'zod'

export type ActionModule = 'inbox' | 'customers' | 'growth' | 'storage' | 'documents' | 'reviews' | 'crm' | 'calendar' | 'automation' | 'telephony' | 'telegram' | 'website'

export type ActionOutputType =
  | 'summary'
  | 'draft'
  | 'tasks'
  | 'plan'
  | 'tags'
  | 'extraction'
  | 'classification'
  | 'reply'
  | 'riskFlags'
  | 'notification'

// ExecutableActionId wird direkt aus registry.ts importiert (nicht re-exportiert, um zirkuläre Dependencies zu vermeiden)

export type ActionId =
  // Inbox (Core-7)
  | 'inbox.summarize'
  | 'inbox.draft_reply'
  | 'inbox.ask_missing_info'
  | 'inbox.next_steps'
  | 'inbox.create_task'
  // Legacy Inbox (für Kompatibilität, werden normalisiert)
  | 'inbox.top3'
  | 'inbox.draftReply'
  | 'inbox.nextSteps'
  | 'inbox.assignCase'
  | 'inbox.setNotifications'
  // Customers
  | 'customers.profileShort'
  | 'customers.top3Open'
  | 'customers.nextSteps'
  | 'customers.followupDraft'
  | 'customers.timelineSummary'
  | 'customers.risksBlockers'
  | 'customers.suggestTags'
  | 'customers.create'
  | 'customers.segment'
  | 'customers.cleanup'
  | 'customers.health_check'
  // Growth
  | 'growth.variants3'
  | 'growth.hookImprove'
  | 'growth.ctaSuggestions'
  | 'growth.translate'
  | 'growth.campaignPlan'
  | 'growth.newsletterStart'
  | 'growth.keywordCluster'
  // Storage
  | 'storage.summarize'
  | 'storage.extractFacts'
  | 'storage.saveAsMemory'
  | 'storage.suggestTags'
  | 'storage.editMemory'
  // Documents (Core-10)
  | 'documents.extract_key_fields'
  | 'documents.summarize'
  | 'documents.upload'
  // Legacy Documents (für Kompatibilität)
  | 'documents.extractKeyFields'
  | 'documents.classify'
  | 'documents.suggestNextSteps'
  | 'documents.saveAsMemory'
  | 'documents.routeToCase'
  // CRM (Core-10)
  | 'crm.link_to_customer'
  // Reviews (Core-10)
  | 'reviews.draft_review_reply'
  | 'reviews.analyze_sentiment'
  | 'reviews.request_reviews'
  | 'reviews.competitor_analysis'
  // Website Bot
  | 'website.fetch_and_profile'
  | 'website.train_bot'
  | 'website.ab_test'
  // Telephony
  | 'telephony.summarize_call'
  | 'telephony.transcribe_call'
  | 'telephony.process_voicemails'
  | 'telephony.callback_campaign'
  // Telegram
  | 'telegram.broadcast'
  | 'telegram.configure_autoreply'
  | 'telegram.analyze_chats'
  | 'telegram.set_personality'
  | 'telegram.test_message'
  // Core-10 New Actions
  | 'inbox.prioritize'
  | 'calendar.find_slots'
  | 'calendar.create_event'
  | 'automation.trigger_workflow'
  | 'automation.inbox_auto_triage'
  | 'automation.docs_auto_process'
  | 'automation.crm_enrich_lead'
  | 'automation.review_auto_reply'
  // Marketing
  | 'marketing.generate_content'
  | 'marketing.optimize_campaign'
  | 'marketing.autopilot_run'
  | 'marketing.generate_image'
  | 'marketing.check_virality'
  | 'marketing.clone_style'
  | 'marketing.trend_scout'
  | 'marketing.ideas_from_reviews'
  | 'marketing.repurpose_content'
  | 'marketing.competitor_watchdog'

export type UIPlacement = 'primary' | 'secondary' | 'menu' | 'hidden'

export interface ActionDefinition {
  id: ActionId
  label: string
  description?: string
  supportedModules: ActionModule[]
  outputType: ActionOutputType
  requiresApproval: boolean
  uiPlacement: UIPlacement
  uiOrder?: number // Default: 1000, niedrigere Zahlen = früher in der Liste
  icon?: string // Icon-Name (wird in Icon-Map aufgelöst)
  defaultConfig?: Record<string, unknown> // Optional: Standard-Konfiguration
  availability?: (context: ActionContext) => { available: boolean; reason?: string } // Optional: Verfügbarkeitsprüfung
  tags?: string[] // Optional: Tags für spätere Filterung
  defaultTone?: 'short' | 'neutral' | 'locker' | 'formal'
}

export type ActionTargetRef = {
  module: ActionModule
  targetId?: string
  title?: string
  subtype?: string
  channel?: string
}

export type ActionContextV1 = {
  module: string
  target: {
    id: string
    type: string
    title?: string
  }
  moduleContext?: Record<string, unknown>
  uiContext?: {
    locale?: string
    tz?: string
    surface?: string
  }
}

export type ActionContext = Record<string, unknown> & {
  target?: ActionTargetRef
  context_v1?: ActionContextV1
}

export type ActionRunOptions = {
  target: ActionTargetRef
  moduleContext?: Record<string, unknown>
  actionOverrides?: Partial<ActionDefinition>
  config?: Record<string, unknown>
}

export type SummaryOutput = { type: 'summary'; summary: string }
export type DraftOutput = { type: 'draft'; draft: string }
export type TasksOutput = { type: 'tasks'; tasks: string[] }
export type PlanOutput = { type: 'plan'; title?: string; steps: string[] }
export type TagsOutput = { type: 'tags'; tags: string[] }
export type ExtractionOutput = {
  type: 'extraction'
  fields: Record<string, string>
  highlights?: string[]
}
export type ClassificationOutput = {
  type: 'classification'
  label: string
  confidence?: number
  details?: string
}
export type ReplyOutput = { type: 'reply'; reply: string }
export type RiskFlagsOutput = { type: 'riskFlags'; flags: string[]; severity?: 'low' | 'medium' | 'high' }
export type NotificationOutput = { type: 'notification'; notification: string }

export type ActionOutput =
  | SummaryOutput
  | DraftOutput
  | TasksOutput
  | PlanOutput
  | TagsOutput
  | ExtractionOutput
  | ClassificationOutput
  | ReplyOutput
  | RiskFlagsOutput
  | NotificationOutput

export interface ActionRunResult {
  action: ActionDefinition
  output: ActionOutput
  context: ActionContext
  previewText: string
  needsInput?: {  // Phase 2: Missing fields if validation failed
    missingFields: string[]
    errors?: string[]
  }
}

export type ActionSchema = z.ZodType<ActionOutput>

export type ApplyResult = {
  appliedText: string
  auditId: string
}

export type AuditEntry = {
  id: string
  actionId: ActionId
  module: ActionModule
  targetId?: string
  outputType: ActionOutputType
  preview: string
  createdAt: string
}
