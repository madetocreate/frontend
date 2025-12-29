import { createGatewayClient, type GatewayTransport } from '@/sdk/gateway'
import { getApiBaseUrl } from '@/lib/env'

const getChatApiBaseUrl = () => {
  // Use centralized env helper
  return getApiBaseUrl()
}

function getTransport(): GatewayTransport {
  const raw = (process.env.NEXT_PUBLIC_CHAT_TRANSPORT || '').toLowerCase()
  if (raw === 'proxy' || raw === 'next_proxy') {
    return 'next_proxy'
  }
  if (raw === 'direct') {
    return 'direct'
  }
  // Default: same-origin proxy (robust for Dev + Docker/Hybrid, avoids CORS/Port-Chaos)
  if (!process.env.NEXT_PUBLIC_CHAT_TRANSPORT) {
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

  // In production, never use NEXT_PUBLIC_AUTH_TOKEN as it's client-exposed
  const isProd = process.env.NODE_ENV === 'production'
  if (!isProd) {
    const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN
    if (envToken) {
      return envToken
    }
  }

  return null
}

async function ensureAuthToken(tenantId?: string): Promise<string | null> {
  // Get tenantId from context if not provided - throws if not authenticated
  if (!tenantId) {
    const { requireTenantId } = await import('@/lib/tenant')
    tenantId = requireTenantId()
  }
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
  mode?: "chat" | "research" | "learning" | "magic"
  memoryContext?: Array<{ id: string; content: string; type?: string }>
  metadata?: Record<string, unknown>
  [key: string]: unknown // Allow additional properties
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
  onDelta?: (data: { delta: string }) => void
  onStatus?: (data: { stage: string }) => void
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
    mode?: "chat" | "research" | "learning" | "magic"
    signal?: AbortSignal
    memoryContext?: Array<{ id: string; label?: string; snippet?: string; content?: string; type?: string }>
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  // Get tenantId from context if not provided - throws if not authenticated
  const { requireTenantId } = await import('@/lib/tenant')
  const tenantId = options?.tenantId ?? requireTenantId()
  const sessionId = options?.sessionId ?? 'default'
  const channel = options?.channel ?? 'web_chat' // Match non-streaming default
  const mode = options?.mode ?? 'chat'

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
      metadata: {
        ...options?.metadata,
        ...(mode ? { mode } : {}),
        ...(options?.memoryContext ? { memoryContext: options.memoryContext } : {}),
      },
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
