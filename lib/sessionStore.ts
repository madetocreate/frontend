'use client'

export type StoredRole = 'user' | 'assistant'

export type StoredMessage = {
  id: number
  role: StoredRole
  content: string
}

export type ChatSession = {
  id: string
  title: string
  createdAt: string
  messages: StoredMessage[]
}

const STORAGE_KEY = 'aklow.chat.sessions'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readRaw(): ChatSession[] {
  if (!isBrowser()) return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s: any) =>
        s &&
        typeof s.id === 'string' &&
        Array.isArray(s.messages)
    ) as ChatSession[]
  } catch {
    return []
  }
}

function writeRaw(sessions: ChatSession[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  setTimeout(() => {
    try {
      window.dispatchEvent(new Event('aklow:sessions-updated'))
    } catch {}
  }, 0)
}

export function loadSessions(): ChatSession[] {
  return readRaw()
}

export function getSession(id: string): ChatSession | undefined {
  return readRaw().find(s => s.id === id)
}

export function ensureSession(id: string, initialMessages: StoredMessage[]): ChatSession {
  const sessions = readRaw()
  const existing = sessions.find(s => s.id === id)
  if (existing) return existing
  const now = new Date().toISOString()
  const session: ChatSession = {
    id,
    title: 'Neuer Chat',
    createdAt: now,
    messages: initialMessages
  }
  sessions.push(session)
  writeRaw(sessions)
  return session
}

export function saveSessionMessages(id: string, messages: StoredMessage[]): void {
  const sessions = readRaw()
  const now = new Date().toISOString()
  const idx = sessions.findIndex(s => s.id === id)
  if (idx === -1) {
    const session: ChatSession = {
      id,
      title: 'Neuer Chat',
      createdAt: now,
      messages
    }
    sessions.push(session)
  } else {
    sessions[idx] = { ...sessions[idx], messages }
  }
  writeRaw(sessions)
}

export function setSessionTitle(id: string, title: string): void {
  if (!title) return
  const sessions = readRaw()
  const idx = sessions.findIndex(s => s.id === id)
  const now = new Date().toISOString()
  if (idx === -1) {
    const session: ChatSession = {
      id,
      title,
      createdAt: now,
      messages: []
    }
    sessions.push(session)
  } else {
    sessions[idx] = { ...sessions[idx], title }
  }
  writeRaw(sessions)
}
