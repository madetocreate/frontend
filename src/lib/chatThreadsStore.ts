'use client'

import { useSyncExternalStore, useCallback, useEffect } from 'react'
import { createGatewayClient, type GatewayTransport } from '@/sdk/gateway'
import type { Thread } from '@/sdk/gateway/types'
import { getApiBaseUrl } from '@/lib/env'

// Gateway Client Setup (similar to chatClient.ts)
const getGatewayBaseUrl = () => {
  // Use centralized env helper
  return getApiBaseUrl()
}

function getTransport(): GatewayTransport {
  const raw = (process.env.NEXT_PUBLIC_CHAT_TRANSPORT || '').toLowerCase()
  if (raw === 'next_proxy' || raw === 'proxy') return 'next_proxy'
  if (raw === 'direct') return 'direct'
  // Default: same-origin proxy (robust for Dev + Docker/Hybrid)
  if (!process.env.NEXT_PUBLIC_CHAT_TRANSPORT) return 'next_proxy'
  return 'direct'
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('auth_token')
  if (token) return token
  const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN
  if (envToken && process.env.NODE_ENV !== 'production') {
    return envToken
  }
  return null
}

function createThreadsGatewayClient() {
  const transport = getTransport()
  const baseUrl = transport === 'direct' ? getGatewayBaseUrl() : ''
  return createGatewayClient({
    transport,
    baseUrl,
    getAuthToken: () => getAuthToken(),
    fetchImpl: fetch,
  })
}

// Thread type matching server response
export type ChatThread = {
  id: string
  title: string
  lastMessageAt: number
  preview: string
  archived?: boolean
  temporary?: boolean
  pinned?: boolean
  projectId?: string
  // Team Channel fields
  threadType?: 'ai_assistant' | 'team_channel' | 'direct_message' | 'project'
  teamId?: string
  teamName?: string
  channelName?: string
  visibility?: 'private' | 'team' | 'public'
}

// LocalStorage cache keys (optional fallback)
const ACTIVE_THREAD_KEY = 'aklow-active-thread-id'
const TEMPORARY_THREADS_KEY = 'aklow-temporary-thread-ids'
const UPDATE_EVENT = 'aklow-chat-threads-updated'

// In-memory cache
let cachedThreads: ChatThread[] = []
let cachedActiveThreadId: string | null = null
let cacheTimestamp: number = 0
const CACHE_TTL_MS = 5000 // 5 seconds cache

// Helper to manage temporary thread IDs in localStorage
function getTemporaryThreadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = window.localStorage.getItem(TEMPORARY_THREADS_KEY)
    if (!stored) return new Set()
    const ids = JSON.parse(stored) as string[]
    return new Set(Array.isArray(ids) ? ids : [])
  } catch {
    return new Set()
  }
}

function addTemporaryThreadId(threadId: string): void {
  if (typeof window === 'undefined') return
  try {
    const ids = getTemporaryThreadIds()
    ids.add(threadId)
    window.localStorage.setItem(TEMPORARY_THREADS_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // ignore
  }
}

function removeTemporaryThreadId(threadId: string): void {
  if (typeof window === 'undefined') return
  try {
    const ids = getTemporaryThreadIds()
    ids.delete(threadId)
    window.localStorage.setItem(TEMPORARY_THREADS_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // ignore
  }
}

// Convert server Thread to ChatThread
function serverThreadToChatThread(thread: Thread): ChatThread {
  const temporaryThreadIds = getTemporaryThreadIds()
  return {
    id: thread.threadId,
    title: thread.title || 'Neuer Chat',
    lastMessageAt: thread.lastMessageAt || thread.updatedAt || thread.createdAt || Date.now(),
    preview: thread.preview || '',
    archived: thread.archived,
    temporary: temporaryThreadIds.has(thread.threadId),
    pinned: thread.pinned,
    projectId: (thread as any).projectId,
  }
}

import { requireTenantId } from '@/lib/tenant'

// Get tenant ID from context - throws if not authenticated
function getTenantId(): string {
  return requireTenantId()
}

// Load threads from server
async function loadThreadsFromServer(options?: { archived?: boolean }): Promise<ChatThread[]> {
  try {
    const client = createThreadsGatewayClient()
    const response = await client.listThreads({
      tenantId: getTenantId(),
      archived: options?.archived ?? false,
      limit: 50,
    })
    
    return response.threads.map(serverThreadToChatThread)
  } catch (error: any) {
    // Only log if it's not a network/backend error (502, 500, etc.)
    // These are expected when backend is down and we handle gracefully
    const isBackendError = error?.status >= 500 || error?.status === 502 || error?.status === 503 || error?.status === 504
    if (!isBackendError) {
      console.warn('Failed to load threads from server:', error?.message || error)
    }
    // Fallback to empty array on error - app continues with local state
    return []
  }
}

// Read threads (with cache)
function readThreads(): ChatThread[] {
  const now = Date.now()
  if (now - cacheTimestamp < CACHE_TTL_MS && cachedThreads.length > 0) {
    return cachedThreads
  }
  return cachedThreads
}

// Refresh threads from server
async function refreshThreads(options?: { archived?: boolean }): Promise<void> {
  const threads = await loadThreadsFromServer(options)
  // Only update cache if we got threads, or if cache is empty (to avoid clearing existing threads on error)
  if (threads.length > 0 || cachedThreads.length === 0) {
    cachedThreads = threads
    cacheTimestamp = Date.now()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UPDATE_EVENT))
    }
  }
}

// Get active thread ID from localStorage
export function getActiveThreadId(): string | null {
  if (typeof window === 'undefined') return null
  if (cachedActiveThreadId) return cachedActiveThreadId
  const stored = window.localStorage.getItem(ACTIVE_THREAD_KEY)
  if (stored) {
    cachedActiveThreadId = stored
    return stored
  }
  
  const threads = readThreads()
  return threads[0]?.id ?? null
}

export function setActiveThreadId(id: string | null) {
  if (typeof window === 'undefined') return
  if (id) {
    window.localStorage.setItem(ACTIVE_THREAD_KEY, id)
  } else {
    window.localStorage.removeItem(ACTIVE_THREAD_KEY)
  }
  cachedActiveThreadId = id
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
}

// Subscribe to updates
function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener(UPDATE_EVENT, handler)
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler)
  }
}

const EMPTY_THREADS: ChatThread[] = []

export function useChatThreads() {
  const threads = useSyncExternalStore(subscribe, readThreads, () => EMPTY_THREADS)
  const activeThreadId = useSyncExternalStore(subscribe, getActiveThreadId, () => null)
  
  // Auto-refresh on mount (useEffect instead of useMemo for side effects)
  useEffect(() => {
    refreshThreads({ archived: false }).catch(console.error)
  }, [])
  
  return { threads, activeThreadId }
}

// Create thread on server
export async function createChatThread(title = 'Neuer Chat', opts?: { temporary?: boolean; projectId?: string }): Promise<ChatThread> {
  try {
    const client = createThreadsGatewayClient()
    const response = await client.createThread({
      tenantId: getTenantId(),
      title,
      projectId: opts?.projectId,
    })
    
    const isTemporary = opts?.temporary ?? false
    const thread: ChatThread = {
      id: response.threadId,
      title,
      lastMessageAt: Date.now(),
      preview: '',
      temporary: isTemporary,
      projectId: opts?.projectId,
    }
    
    // Track temporary thread IDs in localStorage
    if (isTemporary) {
      addTemporaryThreadId(response.threadId)
    }
    
    // Refresh cache (don't fail if refresh errors)
    await refreshThreads({ archived: false }).catch(() => {
      // Silently ignore - we still return the created thread
    })
    return thread
  } catch (error: any) {
    // Fallback: create local temporary thread
    // Only log if it's not a backend error (expected when backend is down)
    const isBackendError = error?.status >= 500 || error?.status === 502 || error?.status === 503 || error?.status === 504
    if (!isBackendError) {
      console.warn('Failed to create thread on server, using local fallback:', error?.message || error)
    }
    
    const now = Date.now()
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `thread-${crypto.randomUUID()}` 
      : `thread-${now}-${Math.random().toString(36).slice(2)}`
    
    const isTemporary = opts?.temporary ?? false
    const localThread: ChatThread = {
      id,
      title,
      lastMessageAt: now,
      preview: '',
      temporary: isTemporary,
      projectId: opts?.projectId,
    }
    
    // Track temporary thread IDs in localStorage
    if (isTemporary) {
      addTemporaryThreadId(id)
    }
    
    // Add to local cache so it appears in the UI
    cachedThreads = [localThread, ...cachedThreads]
    cacheTimestamp = Date.now()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UPDATE_EVENT))
    }
    
    return localThread
  }
}

// Guard to prevent multiple simultaneous calls to ensureSeedChatThread
let seedCheckInProgress = false
let seedCheckCompleted = false

export async function ensureSeedChatThread() {
  // Prevent multiple simultaneous calls
  if (seedCheckInProgress) {
    return
  }
  
  // If we already checked and have threads, don't check again
  if (seedCheckCompleted && cachedThreads.length > 0) {
    return
  }
  
  seedCheckInProgress = true
  
  try {
    const threads = await loadThreadsFromServer({ archived: false })
    seedCheckCompleted = true
    
    if (threads.length === 0) {
      // Only create seed thread if we truly have no threads
      // Try to create a seed thread, but handle errors gracefully
      try {
        const seed = await createChatThread('Willkommen!')
        setActiveThreadId(seed.id)
      } catch (error) {
        // If we can't create a thread, use a local fallback
        const localThreadId = `thread-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setActiveThreadId(localThreadId)
      }
    } else if (!getActiveThreadId()) {
      setActiveThreadId(threads[0].id)
    }
    // Refresh threads, but don't fail if it errors
    await refreshThreads({ archived: false }).catch(() => {
      // Silently ignore refresh errors - we already have threads from above
    })
  } catch (error) {
    // If everything fails, ensure we at least have a local thread ID
    if (!getActiveThreadId()) {
      const localThreadId = `thread-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setActiveThreadId(localThreadId)
    }
  } finally {
    seedCheckInProgress = false
  }
}

export async function addChatThread(thread: ChatThread) {
  // Threads are managed on server, just refresh
  await refreshThreads({ archived: false })
}

export async function updateChatThread(threadId: string, patch: Partial<ChatThread>) {
  try {
    const client = createThreadsGatewayClient()
    const updateReq: any = {
      tenantId: getTenantId(),
    }
    
    if (patch.title !== undefined) {
      updateReq.title = patch.title
    }
    if (patch.archived !== undefined) {
      updateReq.archived = patch.archived
    }
    if (patch.pinned !== undefined) {
      updateReq.pinned = patch.pinned
    }
    if (patch.projectId !== undefined) {
      updateReq.projectId = patch.projectId
    }
    
    await client.patchThread(threadId, updateReq)
    
    // Refresh cache
    await refreshThreads({ archived: false })
  } catch (error: any) {
    // Only log if it's not a backend error (expected when backend is down)
    const isBackendError = error?.status >= 500 || error?.status === 502 || error?.status === 503 || error?.status === 504
    if (!isBackendError) {
      console.warn('Failed to update thread on server, using local cache:', error?.message || error)
    }
    // Update local cache as fallback
    cachedThreads = cachedThreads.map((t) => 
      t.id === threadId ? { ...t, ...patch } : t
    )
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UPDATE_EVENT))
    }
  }
}

export async function archiveChatThread(threadId: string) {
  await updateChatThread(threadId, { archived: true })
}

export async function unarchiveChatThread(threadId: string) {
  await updateChatThread(threadId, { archived: false })
}

export async function pinThread(threadId: string, pinned: boolean) {
  try {
    await updateChatThread(threadId, { pinned })
  } catch (error: any) {
    if (error?.status === 409) {
      // Pin limit exceeded
      if (typeof window !== 'undefined') {
        // Dispatch custom event for UI to show toast
        window.dispatchEvent(new CustomEvent('pin-limit-exceeded', { 
          detail: { message: 'Pin-Limit erreicht (max 3 Threads).' } 
        }))
      }
    }
    throw error
  }
}

export async function renameThread(threadId: string, title: string) {
  await updateChatThread(threadId, { title })
}

export async function moveThreadToProject(threadId: string, projectId: string | null) {
  await updateChatThread(threadId, { projectId: projectId || undefined })
}

export async function deleteChatThread(threadId: string): Promise<void> {
  try {
    const client = createThreadsGatewayClient()
    // Try to archive first (soft delete), then remove from local cache
    try {
      await client.patchThread(threadId, { tenantId: getTenantId(), archived: true })
    } catch (patchError: any) {
      // If patch fails, continue with local deletion anyway
      console.warn('Failed to archive thread before deletion:', patchError?.message || patchError)
    }
    
    // Update local cache - remove completely
    cachedThreads = cachedThreads.filter((t) => t.id !== threadId)
    cacheTimestamp = Date.now()
    
    // If this was the active thread, clear it
    if (cachedActiveThreadId === threadId) {
      cachedActiveThreadId = null
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACTIVE_THREAD_KEY)
      }
    }
    
    // Remove from temporary tracking if present
    removeTemporaryThreadId(threadId)
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UPDATE_EVENT))
    }
  } catch (error: any) {
    // Only log if it's not a backend error (expected when backend is down)
    const isBackendError = error?.status >= 500 || error?.status === 502 || error?.status === 503 || error?.status === 504
    if (!isBackendError) {
      console.warn('Failed to delete thread:', error?.message || error)
    }
    // Fallback: remove from local cache anyway
    cachedThreads = cachedThreads.filter((t) => t.id !== threadId)
    if (cachedActiveThreadId === threadId) {
      cachedActiveThreadId = null
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACTIVE_THREAD_KEY)
      }
    }
    removeTemporaryThreadId(threadId)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UPDATE_EVENT))
    }
  }
}

export async function searchThreads(query: string): Promise<ChatThread[]> {
  try {
    const client = createThreadsGatewayClient()
    const response = await client.searchThreads({
      tenantId: getTenantId(),
      q: query,
      limit: 20,
    })
    
    return response.threads.map(serverThreadToChatThread)
  } catch (error: any) {
    // Only log if it's not a backend error (expected when backend is down)
    const isBackendError = error?.status >= 500 || error?.status === 502 || error?.status === 503 || error?.status === 504
    if (!isBackendError) {
      console.warn('Failed to search threads:', error?.message || error)
    }
    // Fallback to local search
    const queryLower = query.toLowerCase()
    return cachedThreads.filter(t => 
      t.title.toLowerCase().includes(queryLower) || 
      t.preview.toLowerCase().includes(queryLower)
    )
  }
}

export async function getThreadMessages(threadId: string, branchId?: string) {
  try {
    const client = createThreadsGatewayClient()
    const response = await client.getThreadMessages(threadId, {
      tenantId: getTenantId(),
      branchId,
      includeNonCurrent: false,
    })
    
    return response.messages
  } catch (error: any) {
    // Only log if it's not a backend error (expected when backend is down)
    const isBackendError = error?.status >= 500 || error?.status === 502 || error?.status === 503 || error?.status === 504
    if (!isBackendError) {
      console.warn('Failed to get thread messages:', error?.message || error)
    }
    return []
  }
}

// Helper to clean up temporary thread ID tracking
export function removeTemporaryThreadTracking(threadId: string): void {
  removeTemporaryThreadId(threadId)
}

// Legacy function for backward compatibility
export function writeChatThreads(threads: ChatThread[]) {
  // No-op: threads are now managed on server
  // This is kept for backward compatibility
  cachedThreads = threads
  cacheTimestamp = Date.now()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
}
