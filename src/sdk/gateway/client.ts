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
}

const DIRECT_ROUTES: GatewayRoutes = {
  chat: '/chat',
  chatStream: '/chat/stream',
  authDevToken: '/auth/dev/token',
  authGoogle: '/auth/google',
  authApple: '/auth/apple',
}

const NEXT_PROXY_ROUTES: GatewayRoutes = {
  chat: '/api/chat',
  chatStream: '/api/chat/stream',
  authDevToken: '/api/auth/dev/token',
  authGoogle: '/api/auth/google',
  authApple: '/api/auth/apple',
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
  }
}
