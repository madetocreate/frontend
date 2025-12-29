import React from 'react'

export type ChatCardType = 'entity' | 'list' | 'insight' | 'wizard' | 'draft_reply' | 'approval' | 'user_input' | 'launch_gate_error' | 'needs_input'  // Phase 2: needs_input for missing fields

export interface ChatCardAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  params?: Record<string, any>
}

export interface BaseChatCard {
  id: string
  type: ChatCardType
  createdAt?: number
  metadata?: Record<string, unknown>
  source?: {
    moduleToken: string
    entityType?: string
    entityId?: string
  }
}

export interface EntityCardPayload extends BaseChatCard {
  type: 'entity'
  title: string
  subtitle?: string
  icon?: React.ReactNode
  status?: string // 'active' | 'pending' | 'error' etc.
  data: Record<string, string | number | boolean | undefined> // Key-Value pairs
  actions?: ChatCardAction[]
  details?: React.ReactNode // Collapsible content
  explanation?: string // "Why?" explanation
  pinned?: boolean
}

export interface ListCardPayload extends BaseChatCard {
  type: 'list'
  title: string
  subtitle?: string
  columns: {
    key: string
    label: string
    type?: 'text' | 'number' | 'status' | 'date' | 'currency'
    align?: 'left' | 'center' | 'right'
  }[]
  rows: { id: string; [key: string]: any }[]
  totalRows?: number
  actions?: ChatCardAction[] // Global actions like "Filter", "Export"
  onRowClickAction?: string // Action ID to trigger on row click
  
  // Threading Support
  selectedItemId?: string
  expandedItemData?: EntityCardPayload // The expanded entity card payload
}

export interface InsightCardPayload extends BaseChatCard {
  type: 'insight'
  title: string
  content: string // Main insight text
  metrics?: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'neutral'
    change?: string
  }[]
  explanation?: string // Collapsible "Why?"
  actions?: ChatCardAction[]
  pinned?: boolean
}

export interface WizardCardPayload extends BaseChatCard {
  type: 'wizard'
  title: string
  steps: {
    id: string
    title: string
    component?: React.ReactNode // Or a description of the form/content
    description?: string
  }[]
  currentStepId: string
  onFinishAction?: string
  onCancelAction?: string
  pinned?: boolean
}

export interface DraftReplyCardPayload extends BaseChatCard {
  type: 'draft_reply'
  payload: {
    draftText: string
    tone?: 'formal' | 'friendly' | 'casual' | 'professional'
    keyPointsAddressed?: string[]
    suggestedSubject?: string
  }
}

export interface ApprovalCardPayload extends BaseChatCard {
  type: 'approval'
  payload: {
    stepKey: string
    reason: string
    scopes?: string[]
    toolName?: string
    runId?: string
  }
}

export interface UserInputCardPayload extends BaseChatCard {
  type: 'user_input'
  payload: {
    stepKey: string
    inputKey?: string
    prompt: string
    suggestions?: Array<{ id: string; label: string; value?: string }>
    runId?: string
  }
}

export interface LaunchGateErrorCardPayload extends BaseChatCard {
  type: 'launch_gate_error'
  title: string
  content: string
  metadata?: {
    errorCode: 'integration_not_connected' | 'quota_exceeded' | 'plan_not_allowed' | 'tenant_not_found'
    details?: Record<string, unknown>
  }
}

// Phase 2: NeedsInputCard for missing action params
export interface NeedsInputCardPayload extends BaseChatCard {
  type: 'needs_input'
  payload: {
    actionId: string
    missingFields: string[]
    errors?: string[]
    reasonCode?: string  // Phase 5: Reason code
  }
}

export type ChatCard = 
  | EntityCardPayload 
  | ListCardPayload 
  | InsightCardPayload 
  | WizardCardPayload
  | DraftReplyCardPayload
  | ApprovalCardPayload
  | UserInputCardPayload
  | LaunchGateErrorCardPayload
  | NeedsInputCardPayload  // Phase 2
