/**
 * Integration Hub Catalog - Single Source of Truth
 * 
 * Defines the available integrations, their grouping, and metadata for both
 * the Integration Hub and the Onboarding flow.
 */

export interface IntegrationCatalogItem {
  key: string
  name: string
  category: 'Communication' | 'CRM' | 'E-Commerce' | 'Marketing' | 'Productivity' | 'Apple' | 'Reviews'
  description: string
  logoPath?: string
  icon?: string // Legacy fallback
  brandColor?: string
  tags: string[]
  
  // Display Flags
  isPopular?: boolean
  isNew?: boolean
  
  // Onboarding & Curation
  onboardingRecommended?: boolean // Show in "Recommended" section and Onboarding end screen
  onboardingOrder?: number // Order in onboarding (lower = first)
  hubOrder?: number // Order in Hub (lower = first)
  
  // Grouping (e.g. Google Family)
  familyGroup?: 'google'
  
  // Status & Connection
  availability: 'available' | 'beta' | 'coming_soon'
  connectMode: 'drawer' | 'external' | 'link'
  
  // For deep linking from onboarding
  deepLinkTarget?: {
    route: string
    query?: Record<string, string>
  }
  
  // For grouped integrations (Google)
  children?: Array<{
    id: string
    title: string
    description: string
    availability: 'available' | 'beta' | 'coming_soon'
    connectMode: 'drawer' | 'external' | 'link'
  }>
}

export interface IntegrationConnection {
  key: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  connectedAt?: string
  lastSyncAt?: string
  accountLabel?: string
  error?: string
}

export const INTEGRATIONS_CATALOG: IntegrationCatalogItem[] = [
  // 1. Google (Family)
  {
    key: 'google',
    name: 'Google',
    category: 'Productivity',
    description: 'Verbinde Gmail, Kalender, Drive und Kontakte in einem Schritt.',
    logoPath: '/integrations/logos/google.svg',
    brandColor: '#4285F4',
    tags: ['Google', 'Productivity', 'Email', 'Calendar'],
    isPopular: true,
    onboardingRecommended: true,
    onboardingOrder: 1,
    hubOrder: 1,
    familyGroup: 'google',
    availability: 'available',
    connectMode: 'drawer',
    deepLinkTarget: {
      route: '/settings',
      query: { integration: 'google' }
    },
    children: [
      {
        id: 'google_calendar',
        title: 'Google Calendar',
        description: 'Termine synchronisieren',
        availability: 'available',
        connectMode: 'drawer' // Uses existing OAuth flow via drawer stub/iframe
      },
      {
        id: 'google_drive',
        title: 'Google Drive',
        description: 'Dateien und Dokumente finden',
        availability: 'available',
        connectMode: 'drawer'
      },
      {
        id: 'google_contacts',
        title: 'Google Contacts',
        description: 'Kontakte importieren',
        availability: 'available',
        connectMode: 'drawer'
      },
      {
        id: 'gmail',
        title: 'Gmail',
        description: 'E-Mails (via OAuth)',
        availability: 'coming_soon', // Gmail OAuth often requires verification, marking coming soon or separate
        connectMode: 'drawer'
      }
    ]
  },

  // 2. IMAP
  {
    key: 'imap',
    name: 'E-Mail (IMAP)',
    category: 'Communication',
    description: 'Verbinde dein Postfach (Outlook, iCloud, eigener Server).',
    logoPath: '/integrations/logos/imap.svg',
    brandColor: '#0078D4',
    tags: ['Email', 'Inbox', 'IMAP'],
    isNew: true,
    onboardingRecommended: true,
    onboardingOrder: 2,
    hubOrder: 2,
    availability: 'available',
    connectMode: 'drawer',
    deepLinkTarget: {
      route: '/settings',
      query: { integration: 'imap' }
    }
  },

  // 3. WhatsApp (Beta)
  {
    key: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Communication',
    description: 'Kundenkommunikation via WhatsApp API.',
    logoPath: '/integrations/logos/whatsapp.svg',
    brandColor: '#25D366',
    tags: ['Chat', 'Messaging', 'Customer'],
    onboardingRecommended: true,
    onboardingOrder: 3,
    hubOrder: 3,
    availability: 'beta',
    connectMode: 'drawer',
    deepLinkTarget: {
      route: '/settings',
      query: { integration: 'whatsapp' }
    }
  },

  // 4. Telegram
  {
    key: 'telegram',
    name: 'Telegram',
    category: 'Communication',
    description: 'Verbinde deinen Telegram Bot für automatische Antworten.',
    icon: '✈️',
    brandColor: '#0088cc',
    tags: ['Chat', 'Messaging', 'Bot'],
    availability: 'available',
    connectMode: 'drawer',
    hubOrder: 4
  },

  // 5. Website Bot
  {
    key: 'website_bot',
    name: 'Website Bot',
    category: 'Communication',
    description: 'KI-Chatbot für deine Website (Lead-Gen & Support).',
    icon: '🤖',
    brandColor: '#4F46E5',
    tags: ['Chat', 'Website', 'AI'],
    availability: 'available',
    connectMode: 'drawer',
    hubOrder: 5
  },

  // 6. Telefonie
  {
    key: 'telephony',
    name: 'Telefonie',
    category: 'Communication',
    description: 'KI-Telefonassistent für Anrufe und Voicemail.',
    icon: '📞',
    brandColor: '#10B981',
    tags: ['Phone', 'AI', 'Voice'],
    availability: 'beta',
    connectMode: 'drawer',
    hubOrder: 6
  },

  // --- Other Integrations (Standard) ---

  // CRM
  {
    key: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    description: 'Sync Kontakte, Deals und Aktivitäten.',
    logoPath: '/integrations/logos/hubspot.svg',
    brandColor: '#FF7A59',
    tags: ['CRM', 'Contacts', 'Sales'],
    isPopular: true,
    availability: 'available',
    connectMode: 'external',
    hubOrder: 10
  },
  {
    key: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    description: 'Enterprise CRM-Integration.',
    logoPath: '/integrations/logos/salesforce.svg',
    brandColor: '#00A1E0',
    tags: ['CRM', 'Enterprise', 'Sales'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 11
  },
  {
    key: 'pipedrive',
    name: 'Pipedrive',
    category: 'CRM',
    description: 'Sales CRM Pipeline-Management.',
    logoPath: '/integrations/logos/pipedrive.svg',
    brandColor: '#222222',
    tags: ['CRM', 'Sales', 'Pipeline'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 12
  },

  // E-Commerce
  {
    key: 'shopify',
    name: 'Shopify',
    category: 'E-Commerce',
    description: 'Sync Bestellungen & Produkte.',
    logoPath: '/integrations/logos/shopify.svg',
    brandColor: '#96BF48',
    tags: ['E-Commerce', 'Orders', 'Products'],
    isPopular: true,
    availability: 'available',
    connectMode: 'external',
    hubOrder: 20
  },
  {
    key: 'woocommerce',
    name: 'WooCommerce',
    category: 'E-Commerce',
    description: 'WordPress E-Commerce Integration.',
    logoPath: '/integrations/logos/woocommerce.svg',
    brandColor: '#96588A',
    tags: ['E-Commerce', 'WordPress', 'Orders'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 21
  },
  {
    key: 'stripe',
    name: 'Stripe',
    category: 'E-Commerce',
    description: 'Payments & Transaktionen.',
    logoPath: '/integrations/logos/stripe.svg',
    brandColor: '#008CDD',
    tags: ['Payments', 'Transactions', 'Billing'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 22
  },

  // Marketing
  {
    key: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Newsletter-Kampagnen verwalten.',
    logoPath: '/integrations/logos/mailchimp.svg',
    brandColor: '#FFE01B',
    tags: ['Email', 'Marketing', 'Campaigns'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 30
  },
  {
    key: 'facebook',
    name: 'Facebook',
    category: 'Marketing',
    description: 'Pages und Ads-Daten.',
    logoPath: '/integrations/logos/facebook.svg',
    brandColor: '#1877F2',
    tags: ['Social', 'Ads', 'Marketing'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 31
  },
  {
    key: 'instagram',
    name: 'Instagram',
    category: 'Marketing',
    description: 'Business Account & Posts.',
    logoPath: '/integrations/logos/instagram.svg',
    brandColor: '#E4405F',
    tags: ['Social', 'Marketing', 'Content'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 32
  },

  // Productivity (Others)
  {
    key: 'notion',
    name: 'Notion',
    category: 'Productivity',
    description: 'Datenbanken und Pages.',
    logoPath: '/integrations/logos/notion.svg',
    brandColor: '#000000',
    tags: ['Notes', 'Database', 'Collaboration'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 40
  },
  {
    key: 'trello',
    name: 'Trello',
    category: 'Productivity',
    description: 'Boards und Cards.',
    logoPath: '/integrations/logos/trello.svg',
    brandColor: '#0079BF',
    tags: ['Tasks', 'Projects', 'Boards'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 41
  },

  // Apple
  {
    key: 'apple_business_chat',
    name: 'Apple Business Chat',
    category: 'Apple',
    description: 'Apple Messages for Business.',
    logoPath: '/integrations/logos/apple.svg',
    brandColor: '#000000',
    tags: ['Chat', 'Apple', 'Messaging'],
    availability: 'coming_soon',
    connectMode: 'external',
    hubOrder: 50
  },

  // Reviews
  {
    key: 'google_reviews',
    name: 'Google Reviews',
    category: 'Reviews',
    description: 'Rezensionen synchronisieren.',
    logoPath: '/integrations/logos/google_reviews.svg',
    brandColor: '#4285F4',
    tags: ['Reviews', 'Google', 'Reputation'],
    isPopular: true,
    availability: 'available',
    connectMode: 'external',
    hubOrder: 60
  },
  {
    key: 'trustpilot',
    name: 'Trustpilot',
    category: 'Reviews',
    description: 'Trustpilot Bewertungen.',
    logoPath: '/integrations/logos/trustpilot.svg',
    brandColor: '#00B67A',
    tags: ['Reviews', 'Reputation', 'Trust'],
    availability: 'available',
    connectMode: 'external',
    hubOrder: 61
  },
]

export const INTEGRATION_CATEGORIES = [
  'All',
  'Communication',
  'CRM',
  'E-Commerce',
  'Marketing',
  'Productivity',
  'Apple',
  'Reviews',
] as const

export type IntegrationCategory = typeof INTEGRATION_CATEGORIES[number]

/**
 * Get integration by ID/key
 */
export function getIntegrationById(key: string): IntegrationCatalogItem | undefined {
  return INTEGRATIONS_CATALOG.find(item => item.key === key)
}

/**
 * Get recommended integrations for onboarding
 */
export function getOnboardingRecommendations(): IntegrationCatalogItem[] {
  return INTEGRATIONS_CATALOG
    .filter(item => item.onboardingRecommended)
    .sort((a, b) => (a.onboardingOrder || 99) - (b.onboardingOrder || 99))
}
