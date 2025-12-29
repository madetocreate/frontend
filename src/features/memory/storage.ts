/**
 * Memory Storage - V1 Demo mit localStorage
 * Optional: Fallback wenn Backend nicht verfügbar
 */

import type { MemoryItem } from './types'

const STORAGE_KEY = 'aklow_memory_demo'
const DEMO_SEED_KEY = 'aklow_memory_demo_seeded'

/**
 * Demo-Memories für V1
 */
const DEMO_MEMORIES: MemoryItem[] = [
  {
    id: 'demo-1',
    text: 'Kunde bevorzugt veganes Essen und hat Allergie gegen Nüsse.',
    type: 'preference',
    source: 'chat',
    scope: 'customer',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customerName: 'Anna König',
    tags: ['allergie', 'essen', 'präferenz'],
  },
  {
    id: 'demo-2',
    text: 'Projekt "Website Redesign" startet am 15. Januar 2024.',
    type: 'project',
    source: 'inbox',
    scope: 'company',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['projekt', 'website'],
  },
  {
    id: 'demo-3',
    text: 'Kunde wünscht monatliche Rechnungsstellung statt wöchentlich.',
    type: 'preference',
    source: 'email',
    scope: 'customer',
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    customerName: 'Max Weber',
    tags: ['rechnung', 'präferenz'],
  },
  {
    id: 'demo-4',
    text: 'Wichtiger Fakt: Das Unternehmen nutzt ausschließlich nachhaltige Verpackungen.',
    type: 'fact',
    source: 'docs',
    scope: 'company',
    status: 'active',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['nachhaltigkeit', 'verpackung'],
  },
]

/**
 * Lade Memories aus localStorage
 */
export function loadMemoryFromLocal(): MemoryItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const items = JSON.parse(stored) as MemoryItem[]
    return items
  } catch (e) {
    console.warn('Failed to load memory from localStorage', e)
    return []
  }
}

/**
 * Speichere Memories in localStorage
 */
export function saveMemoryToLocal(items: MemoryItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('Failed to save memory to localStorage', e)
  }
}

/**
 * Seed Demo-Memories wenn leer
 */
export function seedDemoMemoryIfEmpty(): void {
  if (typeof window === 'undefined') return
  
  try {
    const seeded = localStorage.getItem(DEMO_SEED_KEY)
    if (seeded === 'true') return
    
    const existing = loadMemoryFromLocal()
    if (existing.length > 0) {
      localStorage.setItem(DEMO_SEED_KEY, 'true')
      return
    }
    
    saveMemoryToLocal(DEMO_MEMORIES)
    localStorage.setItem(DEMO_SEED_KEY, 'true')
  } catch (e) {
    console.warn('Failed to seed demo memory', e)
  }
}

