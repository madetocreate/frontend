/**
 * Memory API Client - zentraler Helper für Memory-API-Calls mit Auth
 * 
 * Nutzt localStorage auth_token (wie chatClient.ts, fastActionsClient.ts)
 * Setzt Authorization Header automatisch für alle Memory-API-Calls
 */

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // 1. Check localStorage (set by auth flow)
  const stored = localStorage.getItem('auth_token')
  if (stored) return stored
  
  // 2. Check environment variable (for dev/testing)
  const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN
  if (envToken) return envToken
  
  return null
}

/**
 * D2: Memory API Error Type
 */
export class MemoryAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message)
    this.name = 'MemoryAPIError'
  }
}

/**
 * Fetch helper für Memory API calls mit automatischem Authorization Header
 * D2: UX Guard - wirft MemoryAPIError bei 401/403 mit benutzerfreundlicher Fehlermeldung
 */
export async function fetchMemoryAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  // Set Authorization header if token available
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }
  
  const response = await fetch(endpoint, {
    ...options,
    headers,
  })
  
  // D2: UX Guard - keine stummen Fehler bei 401/403
  if (response.status === 401 || response.status === 403) {
    let errorMessage = 'Memory nicht verfügbar – Anmeldung prüfen'
    if (response.status === 401) {
      errorMessage = 'Memory nicht verfügbar – Anmeldung erforderlich. Bitte melde dich erneut an.'
    } else if (response.status === 403) {
      errorMessage = 'Memory nicht verfügbar – Zugriff verweigert. Bitte überprüfe deine Berechtigungen.'
    }
    
    // Zeige Fehler sofort im UI (kein Silent-Fail)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('aklow-error', {
          detail: {
            message: errorMessage,
            error: {
              error: response.status === 401 ? 'unauthorized' : 'forbidden',
              message: errorMessage,
              statusCode: response.status,
            },
          },
        })
      )
    }
    
    throw new MemoryAPIError(errorMessage, response.status, endpoint)
  }
  
  return response
}

/**
 * Memory API search
 */
export async function searchMemory(params: {
  query: string
  limit?: number
  filters?: Record<string, string[]>
  projectId?: string
}): Promise<{ items: unknown[]; total?: number }> {
  const body: Record<string, unknown> = {
    query: params.query,
    limit: params.limit || 20,
  }
  if (params.filters) body.filters = params.filters
  if (params.projectId) body.projectId = params.projectId
  
  try {
    const response = await fetchMemoryAPI('/api/memory/search', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      // D2: Fallback für andere Fehler (nicht 401/403)
      throw new MemoryAPIError(
        `Memory-Suche fehlgeschlagen: ${response.status}`,
        response.status,
        '/api/memory/search'
      )
    }
    
    return response.json()
  } catch (error) {
    // MemoryAPIError wird bereits von fetchMemoryAPI geworfen und im UI angezeigt
    // Re-throw für weitere Error-Handling
    throw error
  }
}

/**
 * Memory API list
 */
export async function listMemory(params: {
  status?: string
  sort?: string
  order?: string
  limit?: number
  offset?: number
  memoryKind?: string
  sourceType?: string
}): Promise<{ items: unknown[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set('status', params.status)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.order) searchParams.set('order', params.order)
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())
  if (params.memoryKind) searchParams.set('memory_kind', params.memoryKind)
  if (params.sourceType) searchParams.set('source_type', params.sourceType)
  
  try {
    const response = await fetchMemoryAPI(`/api/memory/list?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new MemoryAPIError(
        `Memory-Liste konnte nicht geladen werden: ${response.status}`,
        response.status,
        '/api/memory/list'
      )
    }
    
    return response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Memory API save
 */
export async function saveMemory(params: {
  threadId: string
  role: string
  content: string
  timestamp: string
  kind?: string
  tags?: string[]
  projectId?: string
}): Promise<unknown> {
  const body: Record<string, unknown> = {
    threadId: params.threadId,
    role: params.role,
    content: params.content,
    timestamp: params.timestamp,
  }
  if (params.kind) body.kind = params.kind
  if (params.tags) body.tags = params.tags
  if (params.projectId) body.projectId = params.projectId
  
  try {
    const response = await fetchMemoryAPI('/api/memory/save', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      throw new MemoryAPIError(
        `Memory konnte nicht gespeichert werden: ${response.status}`,
        response.status,
        '/api/memory/save'
      )
    }
    
    return response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Memory API archive
 */
export async function archiveMemory(memoryId: string): Promise<void> {
  try {
    const response = await fetchMemoryAPI('/api/memory/archive', {
      method: 'POST',
      body: JSON.stringify({ memoryId }),
    })
    
    if (!response.ok) {
      throw new MemoryAPIError(
        `Memory konnte nicht archiviert werden: ${response.status}`,
        response.status,
        '/api/memory/archive'
      )
    }
  } catch (error) {
    throw error
  }
}

/**
 * Memory API delete
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  try {
    const response = await fetchMemoryAPI('/api/memory/delete', {
      method: 'POST',
      body: JSON.stringify({ memoryId }),
    })
    
    if (!response.ok) {
      throw new MemoryAPIError(
        `Memory konnte nicht gelöscht werden: ${response.status}`,
        response.status,
        '/api/memory/delete'
      )
    }
  } catch (error) {
    throw error
  }
}

