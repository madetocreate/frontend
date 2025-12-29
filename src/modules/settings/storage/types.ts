export type StorageTab = 'memories' | 'chats' | 'documents'

export interface MemoryItem {
  id: string
  title: string
  summary: string
  fullText: string
  tags: string[]
  source: 'chat' | 'document' | 'note'
  confidence: 'confirmed' | 'unconfirmed'
  timestamp: string
}

export interface ChatSource {
  id: string
  title: string
  snippet: string
  channel: 'website' | 'telegram' | 'email'
  date: string
  summary?: string
}

export interface FileItem {
  id: string
  filename: string
  type: 'pdf' | 'img' | 'doc'
  date: string
  size: string
  summary?: string
}

export type StorageActionId =
  | 'storage.summarize'
  | 'storage.extractFacts'
  | 'storage.saveAsMemory'
  | 'storage.suggestTags'
  | 'storage.editMemory'

export interface StorageAction {
  id: StorageActionId
  label: string
  description: string
}

export type RightDrawerTab = 'context' | 'actions' | 'history'

export interface HistoryEntry {
  id: string
  label: string
  time: string
  type: string
}
