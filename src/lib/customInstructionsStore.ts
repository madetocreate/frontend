/**
 * Custom Instructions Store
 * 
 * Speichert benutzerdefinierte Anweisungen, die bei jedem Chat berücksichtigt werden.
 * Ähnlich wie ChatGPT's Custom Instructions Feature.
 * 
 * Speichert im Backend (UserSettings) mit Fallback zu localStorage.
 */

import { authedFetch } from './api/authedFetch'

const STORAGE_KEY = 'aklow.customInstructions'

export interface CustomInstructions {
  about: string // "About you" - Informationen über den Benutzer
  responseStyle: string // "How should the assistant respond" - Stil der Antworten
  enabled: boolean
}

const DEFAULT_INSTRUCTIONS: CustomInstructions = {
  about: '',
  responseStyle: '',
  enabled: false,
}

// Cache für synchronen Zugriff
let cachedInstructions: CustomInstructions | null = null

/**
 * Lädt Custom Instructions aus Backend (UserSettings) oder localStorage (Fallback)
 */
export async function loadCustomInstructions(): Promise<CustomInstructions> {
  if (typeof window === 'undefined') return DEFAULT_INSTRUCTIONS
  
  // Versuche zuerst aus Backend zu laden
  try {
    const response = await authedFetch('/api/settings/user', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (response.ok) {
      const data = await response.json()
      const userSettings = data.settings || {}
      
      if (userSettings.customInstructions) {
        const backendInstructions = {
          ...DEFAULT_INSTRUCTIONS,
          ...userSettings.customInstructions,
        }
        cachedInstructions = backendInstructions
        // Migriere auch zu localStorage als Fallback
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backendInstructions))
          } catch (e) {
            // Ignore localStorage errors
          }
        }
        return backendInstructions
      }
    }
  } catch (error) {
    // Backend nicht verfügbar, verwende localStorage Fallback
    console.debug('[customInstructions] Backend nicht verfügbar, verwende localStorage', error)
  }
  
  // Fallback: localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const instructions = { ...DEFAULT_INSTRUCTIONS, ...parsed }
      cachedInstructions = instructions
      return instructions
    }
  } catch (e) {
    console.error('Failed to load custom instructions from localStorage:', e)
  }
  
  cachedInstructions = DEFAULT_INSTRUCTIONS
  return DEFAULT_INSTRUCTIONS
}

/**
 * Synchroner Zugriff auf Custom Instructions (verwendet Cache)
 */
export function getCustomInstructions(): CustomInstructions {
  if (typeof window === 'undefined') return DEFAULT_INSTRUCTIONS
  
  // Wenn Cache vorhanden, verwende diesen
  if (cachedInstructions) {
    return cachedInstructions
  }
  
  // Ansonsten versuche localStorage (synchron)
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const instructions = { ...DEFAULT_INSTRUCTIONS, ...parsed }
      cachedInstructions = instructions
      return instructions
    }
  } catch (e) {
    console.error('Failed to load custom instructions:', e)
  }
  
  return DEFAULT_INSTRUCTIONS
}

/**
 * Speichert Custom Instructions im Backend (UserSettings) und localStorage (Fallback)
 */
export async function setCustomInstructions(instructions: Partial<CustomInstructions>): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    const current = getCustomInstructions()
    const updated = { ...current, ...instructions }
    cachedInstructions = updated
    
    // Speichere zuerst im Backend
    try {
      const response = await authedFetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch: {
            customInstructions: updated,
          },
        }),
      })
      
      if (response.ok) {
        // Backend-Speicherung erfolgreich
        // Speichere auch in localStorage als Fallback
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (e) {
          // Ignore localStorage errors
        }
        
        // Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent('aklow-custom-instructions-changed', { 
          detail: updated 
        }))
        return
      }
    } catch (backendError) {
      // Backend nicht verfügbar, speichere nur in localStorage
      console.debug('[customInstructions] Backend nicht verfügbar, speichere nur in localStorage', backendError)
    }
    
    // Fallback: localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('aklow-custom-instructions-changed', { 
      detail: updated 
    }))
  } catch (e) {
    console.error('Failed to save custom instructions:', e)
  }
}

export function getCustomInstructionsPrompt(): string {
  const instructions = getCustomInstructions()
  if (!instructions.enabled || (!instructions.about && !instructions.responseStyle)) {
    return ''
  }
  
  const parts: string[] = []
  
  if (instructions.about) {
    parts.push(`<CUSTOM_INSTRUCTIONS_ABOUT_USER>
${instructions.about}
</CUSTOM_INSTRUCTIONS_ABOUT_USER>`)
  }
  
  if (instructions.responseStyle) {
    parts.push(`<CUSTOM_INSTRUCTIONS_RESPONSE_STYLE>
${instructions.responseStyle}
</CUSTOM_INSTRUCTIONS_RESPONSE_STYLE>`)
  }
  
  return parts.join('\n\n')
}

