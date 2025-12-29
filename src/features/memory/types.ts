/**
 * Memory Types für V2 Settings
 */

export type MemoryType = 'preference' | 'fact' | 'project' | 'note' | 'system' | 'instruction' | 'summary'
export type MemorySource = 'chat' | 'inbox' | 'docs' | 'telegram' | 'email' | 'phone' | 'website' | 'crm' | 'manual' | 'system'
export type MemoryScope = 'user' | 'customer' | 'company'
export type MemoryStatus = 'active' | 'archived'

export interface MemoryItem {
  id: string
  text: string
  type: MemoryType
  source: MemorySource
  scope: MemoryScope
  status: MemoryStatus
  createdAt: string
  updatedAt?: string
  customerName?: string
  tags?: string[]
  meta?: Record<string, any>
  // Optional: Backend-spezifische Felder
  confidence?: number
  score?: number
  vectorStatus?: string | null
  embeddingModel?: string | null
}

/**
 * Memory Filter Options
 */
export interface MemoryFilters {
  type?: MemoryType[]
  source?: MemorySource[]
  scope?: MemoryScope
  status?: MemoryStatus
  range?: 'today' | '7d' | '30d' | 'all'
  query?: string
}

