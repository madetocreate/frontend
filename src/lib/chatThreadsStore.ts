'use client'

import { useSyncExternalStore } from 'react'

export type ChatThread = {
  id: string
  title: string
  lastMessageAt: number
  preview: string
  archived?: boolean
}

const STORAGE_KEY = 'aklow-chat-threads-v1'
const ACTIVE_THREAD_KEY = 'aklow-active-thread-id'
const UPDATE_EVENT = 'aklow-chat-threads-updated'

let cachedRaw: string | null = null
let cachedThreads: ChatThread[] = []
let cachedActiveThreadId: string | null = null

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

type ThreadRaw = {
  id: string;
  title: string;
  lastMessageAt?: unknown;
  preview?: unknown;
  archived?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isThreadRaw(value: unknown): value is ThreadRaw {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.title === 'string'
}

function normalizeThreads(value: unknown): ChatThread[] {
  if (!Array.isArray(value)) return []

  return value
    .filter(isThreadRaw)
    .map((t) => ({
      id: t.id,
      title: t.title,
      lastMessageAt: typeof t.lastMessageAt === 'number' ? t.lastMessageAt : 0,
      preview: typeof t.preview === 'string' ? t.preview : '',
      archived: typeof t.archived === 'boolean' ? t.archived : undefined,
    }))
}

function readThreadsFromStorage(): ChatThread[] {
  if (typeof window === 'undefined') return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw) return cachedThreads

  cachedRaw = raw
  if (!raw) {
    cachedThreads = []
    return cachedThreads
  }

  const parsed = safeJsonParse<unknown>(raw)
  cachedThreads = normalizeThreads(parsed)
  return cachedThreads
}

export function getActiveThreadId(): string | null {
  if (typeof window === 'undefined') return null
  if (cachedActiveThreadId) return cachedActiveThreadId
  const stored = window.localStorage.getItem(ACTIVE_THREAD_KEY)
  if (stored) return stored
  
  const threads = readThreadsFromStorage()
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
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

export function writeChatThreads(threads: ChatThread[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
  cachedRaw = null
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

function subscribe(callback: () => void) {
  const handler = () => callback()
  window.addEventListener('storage', handler)
  window.addEventListener(UPDATE_EVENT, handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(UPDATE_EVENT, handler)
  }
}

const EMPTY_THREADS: ChatThread[] = []

export function useChatThreads() {
  const threads = useSyncExternalStore(subscribe, readThreadsFromStorage, () => EMPTY_THREADS)
  const activeThreadId = useSyncExternalStore(subscribe, getActiveThreadId, () => null)
  return { threads, activeThreadId }
}

export function createChatThread(title = 'Neuer Chat'): ChatThread {
  const now = Date.now()
  const id = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? `thread-${crypto.randomUUID()}` 
    : `thread-${now}-${Math.random().toString(36).slice(2)}`
  
  return {
    id,
    title,
    lastMessageAt: now,
    preview: '',
  }
}

export function ensureSeedChatThread() {
  const threads = readThreadsFromStorage()
  if (threads.length === 0) {
    const seed = createChatThread('Willkommen!')
    seed.preview = 'Wie kann ich heute helfen?'
    writeChatThreads([seed])
    setActiveThreadId(seed.id)
  } else if (!getActiveThreadId()) {
    setActiveThreadId(threads[0].id)
  }
}

export function addChatThread(thread: ChatThread) {
  const threads = readThreadsFromStorage()
  const next = [thread, ...threads.filter((t) => t.id !== thread.id)]
  writeChatThreads(next)
}

export function updateChatThread(threadId: string, patch: Partial<ChatThread>) {
  const threads = readThreadsFromStorage()
  const next = threads.map((t) => (t.id === threadId ? { ...t, ...patch } : t))
  writeChatThreads(next)
}

export function archiveChatThread(threadId: string) {
  updateChatThread(threadId, { archived: true })
}

export function unarchiveChatThread(threadId: string) {
  updateChatThread(threadId, { archived: false })
}
