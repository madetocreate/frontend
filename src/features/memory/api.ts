/**
 * Memory API - Wrapper für Backend-Endpunkte
 * Fallback auf localStorage Demo wenn Backend nicht verfügbar
 */

import { listMemory, searchMemory, archiveMemory, deleteMemory } from '@/lib/memoryClient'
import type { MemoryItem, MemoryFilters } from './types'
import { loadMemoryFromLocal, saveMemoryToLocal } from './storage'

/**
 * Konvertiere Backend MemoryEntry zu MemoryItem
 */
function mapBackendToMemoryItem(entry: any): MemoryItem {
  return {
    id: entry.id || String(entry.memory_id || ''),
    text: entry.content_safe || entry.content || '',
    type: (entry.kind || 'note') as MemoryItem['type'],
    source: (entry.type || 'chat') as MemoryItem['source'],
    scope: (entry.scope || 'user') as MemoryItem['scope'],
    status: (entry.status || 'active') as MemoryItem['status'],
    createdAt: entry.created_at || new Date().toISOString(),
    updatedAt: entry.updated_at,
    customerName: entry.customer_name || entry.metadata?.customerName,
    tags: entry.tags || [],
    meta: entry.metadata || {},
    confidence: entry.confidence ? parseFloat(String(entry.confidence)) : undefined,
    score: entry.score,
    vectorStatus: entry.vector_status,
    embeddingModel: entry.embedding_model,
  }
}

/**
 * Lade Memory-Liste (mit Fallback auf localStorage)
 */
export async function fetchMemoryList(
  filters?: MemoryFilters,
  page: number = 0,
  limit: number = 50
): Promise<{ items: MemoryItem[]; total: number }> {
  try {
    // Versuche Backend-API
    const params: any = {
      status: filters?.status || 'active',
      sort: 'created_at',
      order: 'desc',
      limit,
      offset: page * limit,
    }
    
    if (filters?.type && filters.type.length > 0) {
      params.memoryKind = filters.type[0] // Backend unterstützt nur einen Typ
    }
    if (filters?.source && filters.source.length > 0) {
      params.sourceType = filters.source[0] // Backend unterstützt nur eine Quelle
    }
    
    const data = await listMemory(params)
    const items = (data.items || []).map(mapBackendToMemoryItem)
    
    // Filter lokal (da Backend nur einen Typ/Quelle unterstützt)
    let filtered = items
    if (filters?.type && filters.type.length > 0) {
      filtered = filtered.filter(item => filters.type!.includes(item.type))
    }
    if (filters?.source && filters.source.length > 0) {
      filtered = filtered.filter(item => filters.source!.includes(item.source))
    }
    if (filters?.scope) {
      filtered = filtered.filter(item => item.scope === filters.scope)
    }
    if (filters?.range && filters.range !== 'all') {
      const now = Date.now()
      const ranges: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }
      const cutoff = now - ranges[filters.range]
      filtered = filtered.filter(item => new Date(item.createdAt).getTime() >= cutoff)
    }
    if (filters?.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(item => 
        item.text.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return {
      items: filtered,
      total: data.total || filtered.length,
    }
  } catch (error) {
    // Fallback auf localStorage Demo
    console.warn('Memory API failed, using localStorage fallback', error)
    const localItems = loadMemoryFromLocal()
    
    // Filter lokal
    let filtered = localItems
    if (filters?.type && filters.type.length > 0) {
      filtered = filtered.filter(item => filters.type!.includes(item.type))
    }
    if (filters?.source && filters.source.length > 0) {
      filtered = filtered.filter(item => filters.source!.includes(item.source))
    }
    if (filters?.scope) {
      filtered = filtered.filter(item => item.scope === filters.scope)
    }
    if (filters?.status) {
      filtered = filtered.filter(item => item.status === filters.status)
    }
    if (filters?.range && filters.range !== 'all') {
      const now = Date.now()
      const ranges: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }
      const cutoff = now - ranges[filters.range]
      filtered = filtered.filter(item => new Date(item.createdAt).getTime() >= cutoff)
    }
    if (filters?.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(item => 
        item.text.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return {
      items: filtered,
      total: filtered.length,
    }
  }
}

/**
 * Suche Memories (mit Fallback)
 */
export async function fetchMemorySearch(
  query: string,
  filters?: MemoryFilters,
  limit: number = 50
): Promise<{ items: MemoryItem[]; total: number }> {
  try {
    // Versuche Backend-API
    const filtersPayload: Record<string, string[]> = {}
    if (filters?.type && filters.type.length > 0) {
      filtersPayload.memory_kind = filters.type
    }
    if (filters?.source && filters.source.length > 0) {
      filtersPayload.source_type = filters.source
    }
    
    const data = await searchMemory({
      query,
      limit,
      filters: Object.keys(filtersPayload).length > 0 ? filtersPayload : undefined,
    })
    
    const items = (data.items || []).map(mapBackendToMemoryItem)
    
    return {
      items,
      total: data.total || items.length,
    }
  } catch (error) {
    // Fallback auf localStorage Demo
    console.warn('Memory search API failed, using localStorage fallback', error)
    const localItems = loadMemoryFromLocal()
    const queryLower = query.toLowerCase()
    
    const filtered = localItems.filter(item =>
      item.text.toLowerCase().includes(queryLower) ||
      item.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    )
    
    return {
      items: filtered,
      total: filtered.length,
    }
  }
}

/**
 * Lade Memory-Detail
 */
export async function fetchMemoryDetail(id: string): Promise<MemoryItem | null> {
  try {
    // Backend hat keinen Detail-Endpunkt, nutze Liste und filtere
    const data = await listMemory({ limit: 1000 })
    const item = (data.items || []).find((entry: any) => 
      entry.id === id || entry.memory_id === id
    )
    
    if (item) {
      return mapBackendToMemoryItem(item)
    }
    
    return null
  } catch (error) {
    // Fallback auf localStorage
    console.warn('Memory detail API failed, using localStorage fallback', error)
    const localItems = loadMemoryFromLocal()
    return localItems.find(item => item.id === id) || null
  }
}

/**
 * Aktualisiere Memory (PATCH)
 */
export async function patchMemory(
  id: string,
  updates: Partial<MemoryItem>
): Promise<MemoryItem> {
  try {
    // Backend hat keinen PATCH-Endpunkt, nutze localStorage für Demo
    const localItems = loadMemoryFromLocal()
    const index = localItems.findIndex(item => item.id === id)
    
    if (index === -1) {
      throw new Error(`Memory ${id} not found`)
    }
    
    const updated = {
      ...localItems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    localItems[index] = updated
    saveMemoryToLocal(localItems)
    
    return updated
  } catch (error) {
    console.error('Failed to patch memory', error)
    throw error
  }
}

/**
 * Lösche Memory
 */
export async function deleteMemoryItem(id: string): Promise<void> {
  try {
    await deleteMemory(id)
  } catch (error) {
    // Fallback auf localStorage
    console.warn('Memory delete API failed, using localStorage fallback', error)
    const localItems = loadMemoryFromLocal()
    const filtered = localItems.filter(item => item.id !== id)
    saveMemoryToLocal(filtered)
  }
}

/**
 * Archiviere Memory
 */
export async function archiveMemoryItem(id: string): Promise<void> {
  try {
    await archiveMemory(id)
  } catch (error) {
    // Fallback auf localStorage
    console.warn('Memory archive API failed, using localStorage fallback', error)
    const localItems = loadMemoryFromLocal()
    const index = localItems.findIndex(item => item.id === id)
    
    if (index !== -1) {
      localItems[index].status = 'archived'
      saveMemoryToLocal(localItems)
    }
  }
}

