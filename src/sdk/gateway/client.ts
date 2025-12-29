import { consumeSseResponse } from './sse'
import type {
  AuthDevTokenRequest,
  AuthDevTokenResponse,
  ChatRequest,
  ChatResponse,
  ChatStreamCallbacks,
  GatewayErrorResponse,
  OAuthLoginRequest,
  OAuthLoginResponse,
} from './types'

export type GatewayTransport = 'direct' | 'next_proxy'

export type GatewayRoutes = {
  chat: string
  chatStream: string
  authDevToken: string
  authGoogle: string
  authApple: string
  workbenchAction: string
}

const DIRECT_ROUTES: GatewayRoutes = {
  chat: '/chat',
  chatStream: '/chat/stream',
  authDevToken: '/auth/dev/token',
  authGoogle: '/auth/google',
  authApple: '/auth/apple',
  workbenchAction: '/api/workbench/action',
}

const NEXT_PROXY_ROUTES: GatewayRoutes = {
  chat: '/api/chat',
  chatStream: '/api/chat/stream',
  authDevToken: '/api/auth/dev/token',
  authGoogle: '/api/auth/google',
  authApple: '/api/auth/apple',
  workbenchAction: '/api/v2/workbench/action',
}

// Helper to build v2 proxy URLs
function getV2ProxyUrl(path: string, transport: GatewayTransport): string {
  if (transport === 'next_proxy') {
    // If path already starts with /v2/, just prepend /api
    if (path.startsWith('/v2/')) {
      return `/api${path}`
    }
    // If path already starts with /api/, don't double-prefix
    if (path.startsWith('/api/')) {
      return path
    }
    // Otherwise, prepend /api/v2
    return `/api/v2${path}`
  }
  return path
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
}

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) {
    return path
  }
  const base = normalizeBaseUrl(baseUrl)
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export class GatewayHttpError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(params: { message: string; status: number; body: unknown }) {
    super(params.message)
    this.name = 'GatewayHttpError'
    this.status = params.status
    this.body = params.body
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text().catch(() => '')

  if (!text) {
    return null
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text)
    } catch {
      return { raw: text }
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function toGatewayError(body: unknown): GatewayErrorResponse {
  if (body && typeof body === 'object' && 'error' in body) {
    return body as GatewayErrorResponse
  }
  const bodyObj = body as { raw?: string } | null
  return {
    error: 'unknown_error',
    message: typeof bodyObj?.raw === 'string' ? bodyObj.raw : 'Unknown error',
    details: body,
  }
}

import type {
  Thread,
  ThreadListResponse,
  ThreadCreateRequest,
  ThreadPatchRequest,
  ThreadMessagesResponse,
  MessageBranchRequest,
  MessageBranchResponse,
  MessageEditRequest,
  MessageEditResponse,
  MessageRegenerateRequest,
  MessageRegenerateResponse,
} from './types'

export type GatewayClient = {
  chat: (req: ChatRequest, opts?: { signal?: AbortSignal }) => Promise<ChatResponse>
  chatStream: (
    req: ChatRequest,
    callbacks: ChatStreamCallbacks,
    opts?: { signal?: AbortSignal },
  ) => Promise<void>

  authDevToken: (req: AuthDevTokenRequest, opts?: { signal?: AbortSignal }) => Promise<AuthDevTokenResponse>
  authGoogle: (req: OAuthLoginRequest, opts?: { signal?: AbortSignal }) => Promise<OAuthLoginResponse>
  authApple: (req: OAuthLoginRequest, opts?: { signal?: AbortSignal }) => Promise<OAuthLoginResponse>

  // v2 Thread endpoints
  listThreads: (params: { tenantId: string; userId?: string; projectId?: string; archived?: boolean; cursor?: string; limit?: number }, opts?: { signal?: AbortSignal }) => Promise<ThreadListResponse>
  searchThreads: (params: { tenantId: string; userId?: string; q?: string; limit?: number }, opts?: { signal?: AbortSignal }) => Promise<ThreadListResponse>
  createThread: (req: ThreadCreateRequest, opts?: { signal?: AbortSignal }) => Promise<{ threadId: string }>
  patchThread: (threadId: string, req: ThreadPatchRequest, opts?: { signal?: AbortSignal }) => Promise<{ threadId: string }>
  getThreadMessages: (threadId: string, params: { tenantId: string; branchId?: string; includeNonCurrent?: boolean }, opts?: { signal?: AbortSignal }) => Promise<ThreadMessagesResponse>
  branchMessage: (messageId: string, req: MessageBranchRequest, opts?: { signal?: AbortSignal }) => Promise<MessageBranchResponse>
  editMessage: (messageId: string, req: MessageEditRequest, opts?: { signal?: AbortSignal }) => Promise<MessageEditResponse>
  regenerateMessage: (messageId: string, req: MessageRegenerateRequest, opts?: { signal?: AbortSignal }) => Promise<MessageRegenerateResponse>

  // Workbench actions
  workbenchAction: (req: {
    tenantId: string
    threadId: string
    module: string
    viewKey: string
    intent: string
    selectedItemId?: string
    payload?: any
  }, opts?: { signal?: AbortSignal }) => Promise<{ text: string; status: string; details?: string }>
}

export function createGatewayClient(options?: {
  transport?: GatewayTransport
  baseUrl?: string
  routes?: Partial<GatewayRoutes>
  getAuthToken?: () => string | null | Promise<string | null>
  fetchImpl?: typeof fetch
}): GatewayClient {
  const transport = options?.transport ?? 'direct'
  const baseUrl = options?.baseUrl ?? ''
  const routesBase = transport === 'next_proxy' ? NEXT_PROXY_ROUTES : DIRECT_ROUTES
  const routes: GatewayRoutes = { ...routesBase, ...(options?.routes || {}) }
  const fetchImpl = options?.fetchImpl ?? fetch

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const token = options?.getAuthToken ? await options.getAuthToken() : null
    if (!token) {
      return {}
    }
    const value = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    return { authorization: value }
  }

  const requestJson = async <T>(params: {
    path: keyof GatewayRoutes
    body?: unknown
    method?: 'GET' | 'POST'
    signal?: AbortSignal
  }): Promise<T> => {
    const url = joinUrl(baseUrl, routes[params.path])
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'application/json',
      ...(await getAuthHeader()),
    }

    let response: Response
    try {
      response = await fetchImpl(url, {
        method: params.method ?? 'POST',
        headers,
        body: params.body ? JSON.stringify(params.body) : undefined,
        credentials: 'include',
        signal: params.signal,
      })
    } catch (fetchError) {
      // Connection error (ECONNREFUSED, network error, etc.)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      throw new GatewayHttpError({
        message: `Connection failed: ${errorMessage}. Is the gateway running?`,
        status: 503,
        body: {
          error: 'connection_error',
          message: errorMessage,
          url,
          hint: 'Make sure the Node Gateway is running on the configured port',
        },
      })
    }

    if (response.ok) {
      const data = (await readResponseBody(response)) as T
      return data
    }

    const body = await readResponseBody(response)
    const err = toGatewayError(body)
    throw new GatewayHttpError({
      message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
      status: response.status,
      body: err,
    })
  }

  return {
    chat: async (req, opts) => {
      return await requestJson<ChatResponse>({
        path: 'chat',
        body: {
          tenantId: req.tenantId,
          sessionId: req.sessionId,
          channel: req.channel,
          message: req.message,
          metadata: req.metadata,
          confirm: req.confirm,
        },
        method: 'POST',
        signal: opts?.signal,
      })
    },

    chatStream: async (req, callbacks, opts) => {
      const url = joinUrl(baseUrl, routes.chatStream)
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        signal: opts?.signal,
        body: JSON.stringify({
          tenantId: req.tenantId,
          sessionId: req.sessionId,
          channel: req.channel,
          message: req.message,
          metadata: req.metadata,
        }),
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        // Log detailed error info for debugging - use warn for expected errors
        const logLevel = response.status === 401 || response.status === 502 || response.status === 503 ? 'warn' : 'error'
        console[logLevel](`[GatewayHttpError] chatStream (${response.status})`, {
          url,
          status: response.status,
          statusText: response.statusText,
          error: err.error || 'unknown',
          message: err.message || response.statusText || 'No message',
          body: body || '(empty)',
        })
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Stream request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      await consumeSseResponse({ response, callbacks, signal: opts?.signal })
    },

    authDevToken: async (req, opts) => {
      return await requestJson<AuthDevTokenResponse>({
        path: 'authDevToken',
        body: req,
        method: 'POST',
        signal: opts?.signal,
      })
    },

    authGoogle: async (req, opts) => {
      return await requestJson<OAuthLoginResponse>({
        path: 'authGoogle',
        body: req,
        method: 'POST',
        signal: opts?.signal,
      })
    },

    authApple: async (req, opts) => {
      return await requestJson<OAuthLoginResponse>({
        path: 'authApple',
        body: req,
        method: 'POST',
        signal: opts?.signal,
      })
    },

    // v2 Thread endpoints
    listThreads: async (params, opts) => {
      const queryParams = new URLSearchParams()
      queryParams.set('tenantId', params.tenantId)
      if (params.userId) queryParams.set('userId', params.userId)
      if (params.projectId) queryParams.set('projectId', params.projectId)
      if (params.archived !== undefined) queryParams.set('archived', String(params.archived))
      if (params.cursor) queryParams.set('cursor', params.cursor)
      if (params.limit) queryParams.set('limit', String(params.limit))

      const url = joinUrl(baseUrl, getV2ProxyUrl(`/v2/threads?${queryParams.toString()}`, transport))
      const headers: Record<string, string> = {
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as ThreadListResponse
    },

    searchThreads: async (params, opts) => {
      const queryParams = new URLSearchParams()
      queryParams.set('tenantId', params.tenantId)
      if (params.userId) queryParams.set('userId', params.userId)
      if (params.q) queryParams.set('q', params.q)
      if (params.limit) queryParams.set('limit', String(params.limit))

      const url = joinUrl(baseUrl, getV2ProxyUrl(`/v2/threads/search?${queryParams.toString()}`, transport))
      const headers: Record<string, string> = {
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as ThreadListResponse
    },

    createThread: async (req, opts) => {
      const url = joinUrl(baseUrl, getV2ProxyUrl('/v2/threads', transport))
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as { threadId: string }
    },

    patchThread: async (threadId, req, opts) => {
      const url = joinUrl(baseUrl, getV2ProxyUrl(`/v2/threads/${threadId}`, transport))
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req),
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as { threadId: string }
    },

    getThreadMessages: async (threadId, params, opts) => {
      const queryParams = new URLSearchParams()
      queryParams.set('tenantId', params.tenantId)
      if (params.branchId) queryParams.set('branchId', params.branchId)
      if (params.includeNonCurrent !== undefined) queryParams.set('includeNonCurrent', String(params.includeNonCurrent))

      const url = joinUrl(baseUrl, getV2ProxyUrl(`/v2/threads/${threadId}/messages?${queryParams.toString()}`, transport))
      const headers: Record<string, string> = {
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        console.error('[GatewayHttpError] getThreadMessages', {
          threadId,
          url,
          status: response.status,
          error: err.error,
          message: err.message,
          body: err,
        })
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as ThreadMessagesResponse
    },

    branchMessage: async (messageId, req, opts) => {
      const url = joinUrl(baseUrl, getV2ProxyUrl(`/v2/messages/${messageId}/branch`, transport))
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        console.error('[GatewayHttpError] branchMessage', {
          messageId,
          url,
          status: response.status,
          error: err.error,
          message: err.message,
          body: err,
        })
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as MessageBranchResponse
    },

    editMessage: async (messageId, req, opts) => {
      const url = joinUrl(baseUrl, getV2ProxyUrl(`/v2/messages/${messageId}`, transport))
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req),
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        console.error('[GatewayHttpError] editMessage', {
          messageId,
          url,
          status: response.status,
          error: err.error,
          message: err.message,
          body: err,
        })
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as MessageEditResponse
    },

    regenerateMessage: async (messageId, req, opts) => {
      const url = joinUrl(baseUrl, getV2ProxyUrl(`/v2/messages/${messageId}/regenerate`, transport))
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(await getAuthHeader()),
      }

      const response = await fetchImpl(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        credentials: 'include',
        signal: opts?.signal,
      })

      if (!response.ok) {
        const body = await readResponseBody(response)
        const err = toGatewayError(body)
        console.error('[GatewayHttpError] regenerateMessage', {
          messageId,
          url,
          status: response.status,
          error: err.error,
          message: err.message,
          body: err,
        })
        throw new GatewayHttpError({
          message: `${err.error}: ${err.message || 'Request failed'} (HTTP ${response.status})`,
          status: response.status,
          body: err,
        })
      }

      return (await readResponseBody(response)) as MessageRegenerateResponse
    },

    workbenchAction: async (req, opts) => {
      return await requestJson<{ text: string; status: string; details?: string }>({
        path: 'workbenchAction',
        body: req,
        method: 'POST',
        signal: opts?.signal,
      })
    },
  }
}
