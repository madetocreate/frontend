export type TenantId = string
export type SessionId = string

export type JsonObject = Record<string, unknown>

export interface ChatRequest {
  tenantId: TenantId
  sessionId: SessionId
  channel?: string
  message: string
  metadata?: JsonObject
  confirm?: boolean
}

export type OrchestratorStep = {
  id: string
  label: string
  status: string
  details?: string
}

export type QuickAction = {
  id: string
  label: string
}

export interface BaseMessage {
  quickActions?: QuickAction[]
}

export interface TextMessage extends BaseMessage {
  type: 'text'
  markdown: string
}

export type UIMode =
  | 'chat'
  | 'form'
  | 'list'
  | 'card'
  | 'table'
  | 'custom'
  | 'minimal_text'
  | 'wizard'
  | 'flow_graph'

export interface UIField {
  id: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea'
  required?: boolean
  options?: string[]
  placeholder?: string
  value?: string
}

export interface UIItem {
  id: string
  title: string
  description?: string
  metadata?: JsonObject
}

export interface UIAction {
  id: string
  label: string
  type: 'button' | 'submit' | 'link'
  onClick?: string
  href?: string
}

export interface UIContext {
  mode: UIMode
  intent?: string
  styleProfile?: string
  userPreferences?: {
    language?: string
    [key: string]: unknown
  }
  title?: string
  description?: string
  fields?: UIField[]
  items?: UIItem[]
  actions?: UIAction[]
  metadata?: JsonObject
}

export type UIMessage =
  | {
      role: 'user' | 'assistant' | 'system'
      content: string
      uiContext?: UIContext
      metadata?: JsonObject
    }
  | TextMessage

export type GatewayAction =
  | {
      id: string
      label: string
      type?: string
      payload?: JsonObject
      [key: string]: unknown
    }
  | JsonObject

export type ChatResponse = {
  tenantId: TenantId
  sessionId: SessionId
  channel: string
  content: string
  steps?: OrchestratorStep[]
  uiMessages?: UIMessage[]
  actions?: GatewayAction[]
}

export type GatewayErrorResponse = {
  error: string
  message?: string
  details?: unknown
  requestId?: string
}

export type ValidationErrorResponse = GatewayErrorResponse & {
  error: 'validation_error'
  details?: Array<{
    path?: Array<string | number>
    message?: string
    code?: string
    [key: string]: unknown
  }>
}

export type AuthDevTokenRequest = {
  tenantId?: string
  userId?: string
  role?: string
}

export type AuthDevTokenResponse = {
  token: string
  tenantId: string
  userId: string
  role: string
  expiresIn: number
}

export type OAuthLoginRequest = {
  idToken: string
}

export type OAuthLoginResponse = {
  token: string
  tenantId: string
  userId: string
  role: string
  email?: string | null
  name?: string | null
  provider?: string
}

export type ChatStreamStart = {
  steps: OrchestratorStep[]
}

export type ChatStreamChunk = {
  content: string
  event?: string
}

export type ChatStreamEnd = {
  content: string
  event?: string
  steps?: OrchestratorStep[]
  uiMessages?: UIMessage[]
  actions?: GatewayAction[]
}

export type ChatStreamError = {
  message: string
  event?: string
}

export type ChatStreamCallbacks = {
  onStart?: (data: ChatStreamStart) => void
  onChunk?: (data: ChatStreamChunk) => void
  onStepUpdate?: (data: { stepId: string; status: string }) => void
  onEnd?: (data: ChatStreamEnd) => void
  onError?: (error: ChatStreamError) => void
  onAbort?: () => void
}
