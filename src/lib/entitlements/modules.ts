export type ModuleId =
  | 'reviews'
  | 'website_assistant'
  | 'telephony'
  | 'telegram'
  | 'ai_shield'
  | 'memory'
  | 'crm'
  | 'documents'
  | 'inbox'
  | 'teams'
  | 'directMessages'
  | 'marketing'; // BETA: Marketing feature (gated by NEXT_PUBLIC_MARKETING_BETA + entitlement)

export const MODULE_LABELS: Record<ModuleId, string> = {
  reviews: 'Reviews',
  website_assistant: 'Website Assistant',
  telephony: 'Telephony',
  telegram: 'Telegram',
  ai_shield: 'AI Shield',
  memory: 'Memory',
  crm: 'CRM',
  documents: 'Documents',
  inbox: 'Inbox',
  teams: 'Teams',
  directMessages: 'Direktnachrichten',
  marketing: 'Marketing (Beta)', // BETA: Hidden by default, requires NEXT_PUBLIC_MARKETING_BETA=true
};

