/**
 * App Settings Types
 * 
 * Type definitions for user and tenant settings.
 */

export interface UserSettings {
  appearance: {
    theme: 'light' | 'dark' | 'system'
    density: 'compact' | 'cozy'
    reduceMotion: boolean
  }
  locale: {
    language: string
    timezone: string
    weekStart: 'monday' | 'sunday'
  }
  notifications: {
    enabled: boolean
    email: boolean
    inApp: boolean
  }
  ai?: {
    model?: string
    temperature?: number
    maxTokens?: number
    memoryEnabled?: boolean
  }
  memory?: {
    enabled?: boolean
  }
  customInstructions?: {
    about: string
    responseStyle: string
    enabled: boolean
  }
  websiteProfile?: {
    company_name: string
    website: string
    industry: string
    value_proposition: string
    target_audience: string
    products_services?: string
    keywords?: string
    highlights?: string[]
    fetched_at?: string
  }
}

export interface TenantSettings {
  chat: {
    teamChannelsEnabled: boolean
    teamsEnabled: boolean
    directMessagesEnabled: boolean
  }
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  appearance: {
    theme: 'system',
    density: 'cozy',
    reduceMotion: false,
  },
  locale: {
    language: 'de',
    timezone: 'Europe/Madrid',
    weekStart: 'monday',
  },
  notifications: {
    enabled: true,
    email: true,
    inApp: true,
  },
  customInstructions: {
    about: '',
    responseStyle: '',
    enabled: false,
  },
}

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  chat: {
    teamChannelsEnabled: false,
    teamsEnabled: false,
    directMessagesEnabled: false,
  },
}

