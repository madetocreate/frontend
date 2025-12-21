import { createGatewayClient, type GatewayTransport } from '@/sdk/gateway'

const getChatApiBaseUrl = () => {
  // Priorität: AGENT_BACKEND_URL > CHAT_API_URL > BACKEND_URL (wenn Port 8000) > Default
  // Chat sollte auf Python Backend (Port 8000) zeigen, nicht Orchestrator (Port 4000)
  if (process.env.NEXT_PUBLIC_AGENT_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_AGENT_BACKEND_URL
  }
  if (process.env.NEXT_PUBLIC_CHAT_API_URL) {
    return process.env.NEXT_PUBLIC_CHAT_API_URL
  }
  // Prüfe ob BACKEND_URL auf Port 8000 zeigt (Python Backend)
  if (process.env.NEXT_PUBLIC_BACKEND_URL?.includes('8000')) {
    return process.env.NEXT_PUBLIC_BACKEND_URL
  }
  // Default: Python Backend (Port 8000), nicht Orchestrator
  return 'http://localhost:8000'
}

function getTransport(): GatewayTransport {
  const raw = (process.env.NEXT_PUBLIC_CHAT_TRANSPORT || '').toLowerCase()
  if (raw === 'proxy' || raw === 'next_proxy') {
    return 'next_proxy'
  }
  return 'direct'
}

function getDirectBaseUrl(): string {
  return getChatApiBaseUrl()
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = localStorage.getItem('auth_token')
  if (token) {
    return token
  }

  const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN
  if (envToken) {
    return envToken
  }

  return null
}

async function ensureAuthToken(tenantId: string = 'aklow-main'): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  const existingToken = getAuthToken()
  if (existingToken) {
    return existingToken
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (getTransport() === 'next_proxy') {
    return null
  }

  try {
    const client = createGatewayClient({
      transport: 'direct',
      baseUrl: getDirectBaseUrl(),
      fetchImpl: fetch,
    })

    const data = await client.authDevToken({
      tenantId,
      userId: 'dev-user',
      role: 'user',
    })

    if (data?.token) {
      localStorage.setItem('auth_token', data.token)
      return data.token
    }
  } catch {
    return null
  }

  return null
}

export type ChatRequestBody = {
  tenantId: string
  sessionId: string
  channel: string
  message: string
  metadata?: Record<string, unknown>
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
  metadata?: Record<string, unknown>
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
  metadata?: Record<string, unknown>
}

export type UIMessage =
  | {
      role: 'user' | 'assistant' | 'system'
      content: string
      uiContext?: UIContext
      metadata?: Record<string, unknown>
    }
  | TextMessage

export type OrchestratorStep = {
  id: string
  label: string
  status: string
  details?: string
}

export type ChatResponse = {
  tenantId: string
  sessionId: string
  channel: string
  content: string
  steps?: OrchestratorStep[]
  uiMessages?: UIMessage[]
  actions?: Array<Record<string, unknown>>
}

export type ChatStreamCallbacks = {
  onStart?: (data: { steps: OrchestratorStep[] }) => void
  onChunk?: (data: { content: string }) => void
  onStepUpdate?: (data: { stepId: string; status: string }) => void
  onEnd?: (data: { content: string; steps?: OrchestratorStep[]; uiMessages?: UIMessage[] }) => void
  onError?: (error: { message: string }) => void
  onAbort?: () => void
}

export async function sendChatMessageStream(
  message: string,
  callbacks: ChatStreamCallbacks,
  options?: {
    tenantId?: string
    sessionId?: string
    channel?: string
    signal?: AbortSignal
  },
): Promise<void> {
  const tenantId = options?.tenantId ?? 'aklow-main'
  const sessionId = options?.sessionId ?? 'default'
  const channel = options?.channel ?? 'default'

  const authToken = (await ensureAuthToken(tenantId)) || getAuthToken()
  const transport = getTransport()

  const client = createGatewayClient({
    transport,
    baseUrl: transport === 'direct' ? getDirectBaseUrl() : '',
    getAuthToken: () => authToken,
    fetchImpl: fetch,
  })

  await client.chatStream(
    {
      tenantId,
      sessionId,
      channel,
      message,
    },
    callbacks,
    { signal: options?.signal },
  )
}

export async function sendChatMessage(params: {
  tenantId: string
  sessionId: string
  channel?: string
  message: string
  metadata?: Record<string, unknown>
  signal?: AbortSignal
}): Promise<ChatResponse> {
  const body: ChatRequestBody = {
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    channel: params.channel ?? 'web_chat',
    message: params.message,
    metadata: params.metadata,
  }

  const authToken = (await ensureAuthToken(params.tenantId)) || getAuthToken()
  const transport = getTransport()

  const client = createGatewayClient({
    transport,
    baseUrl: transport === 'direct' ? getDirectBaseUrl() : '',
    getAuthToken: () => authToken,
    fetchImpl: fetch,
  })

  return await client.chat(body, { signal: params.signal })
}
