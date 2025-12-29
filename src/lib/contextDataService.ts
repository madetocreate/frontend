/**
 * Context Data Service
 * 
 * Lädt echte Daten für die Context Cards im Chat First Design.
 * Ersetzt Mock-Daten durch API-Calls.
 */

import type { InboxItem } from '@/components/InboxDrawerWidget'

// Types
export interface EmailData {
  id: string
  from: string
  fromEmail?: string
  to?: string
  subject: string
  date: string
  preview: string
  body?: string
  attachments?: { name: string; size: string }[]
}

export interface ChatMessage {
  id: string
  content: string
  timestamp: string
  isOutgoing: boolean
  status?: 'sent' | 'delivered' | 'read'
}

export interface ChatThreadData {
  id: string
  contactName: string
  contactAvatar?: string
  platform: 'whatsapp' | 'telegram' | 'sms' | 'messenger' | 'chat'
  messages: ChatMessage[]
  lastActivity?: string
}

export interface CustomerData {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  status: string
  revenue?: number
  lastContact?: string
  tags?: string[]
}

export interface DocumentData {
  id: string
  name: string
  type: string
  size: string
  date: string
  preview?: string
  content?: string
}

export interface GrowthCampaignData {
  id: string
  name: string
  status: string
  leads: number
  budget: number
  startDate?: string
  endDate?: string
}

// API Base URL
const API_BASE = '/api'
const REQUEST_TIMEOUT_MS = 15000

/**
 * Get auth token from localStorage or environment
 * Matches the pattern used in chatClient.ts and fastActionsClient.ts
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
 * Fetch JSON with Authorization header
 */
async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  const upstreamSignal = init.signal
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(new DOMException('Request timed out', 'AbortError')), REQUEST_TIMEOUT_MS)

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort(upstreamSignal.reason)
    } else {
      upstreamSignal.addEventListener('abort', () => controller.abort(upstreamSignal.reason), { once: true })
    }
  }

  try {
    const token = getAuthToken()
    const headers = new Headers(init.headers || {})
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    const response = await fetch(url, { ...init, headers, signal: controller.signal })
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`)
      return null
    }
    return await response.json()
  } catch (error) {    
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`Fetch aborted for ${url}: ${error.message}`)
    } else {
      console.error(`Error fetching ${url}:`, error)
    }
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

// Context Data Fetchers

/**
 * Fetch email/inbox item details
 */
export async function fetchInboxItem(threadId: string, signal?: AbortSignal): Promise<EmailData | null> {
  const data = await fetchJson<EmailData>(`${API_BASE}/inbox/${threadId}`, { signal })
  if (data) return data
  
  // Fallback to mock data for development
  return {
    id: threadId,
    from: 'Unbekannter Absender',
    subject: 'Nachricht',
    date: new Date().toLocaleDateString('de-DE'),
    preview: 'Inhalt wird geladen...',
  }
}

/**
 * Fetch chat thread with messages
 */
export async function fetchChatThread(threadId: string, platform: string = 'chat', signal?: AbortSignal): Promise<ChatThreadData | null> {
  const data = await fetchJson<ChatThreadData>(`${API_BASE}/messages/${threadId}?platform=${platform}`, { signal })
  if (data) return data
  
  // Fallback to mock data
  return {
    id: threadId,
    contactName: 'Kontakt',
    platform: platform as ChatThreadData['platform'],
    messages: [],
    lastActivity: 'Gerade eben',
  }
}

/**
 * Fetch customer details
 */
export async function fetchCustomer(customerId: string, signal?: AbortSignal): Promise<CustomerData | null> {
  const data = await fetchJson<CustomerData>(`${API_BASE}/customers/${customerId}`, { signal })
  if (data) return data
  
  // Fallback
  return {
    id: customerId,
    name: 'Kunde',
    status: 'active',
  }
}

/**
 * Fetch customer list
 */
export async function fetchCustomerList(limit: number = 10, signal?: AbortSignal): Promise<CustomerData[]> {
  const data = await fetchJson<{ customers: CustomerData[] }>(`${API_BASE}/customers?limit=${limit}`, { signal })
  return data?.customers || []
}

/**
 * Fetch document details
 */
export async function fetchDocument(documentId: string, signal?: AbortSignal): Promise<DocumentData | null> {
  const data = await fetchJson<DocumentData>(`${API_BASE}/documents/${documentId}`, { signal })
  if (data) return data
  
  return {
    id: documentId,
    name: 'Dokument',
    type: 'unknown',
    size: '0 KB',
    date: new Date().toLocaleDateString('de-DE'),
  }
}

/**
 * Fetch growth campaigns (uses marketing/campaigns endpoint)
 */
export async function fetchGrowthCampaigns(limit: number = 10, signal?: AbortSignal): Promise<GrowthCampaignData[]> {
  const data = await fetchJson<GrowthCampaignData[]>(`${API_BASE}/marketing/campaigns?limit=${limit}`, { signal })
  // API returns array directly, not wrapped in { campaigns: [...] }
  return Array.isArray(data) ? data : []
}

/**
 * Convert InboxItem to EmailData
 */
export function inboxItemToEmailData(item: InboxItem): EmailData {
  return {
    id: item.id,
    from: item.sender,
    subject: item.title,
    date: item.time,
    preview: item.snippet,
  }
}

/**
 * Get context data based on type and id
 */
export async function getContextData(
  type: 'inbox' | 'customer' | 'document' | 'growth',
  id: string,
  item?: InboxItem | null,
  signal?: AbortSignal
): Promise<EmailData | ChatThreadData | CustomerData | DocumentData | GrowthCampaignData[] | null> {
  switch (type) {
    case 'inbox':
      if (item) {
        // If we have the item, convert it directly
        if (item.channel === 'messenger') {
          return fetchChatThread(id, item.channel, signal)
        }
        return inboxItemToEmailData(item)
      }
      return fetchInboxItem(id, signal)
    
    case 'customer':
      return fetchCustomer(id, signal)
    
    case 'document':
      return fetchDocument(id, signal)
    
    case 'growth':
      return fetchGrowthCampaigns(10, signal)
    
    default:
      return null
  }
}

