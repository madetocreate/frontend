/**
 * Settings API Client - Kommunikation mit Backend
 */

// URL-Drift Fix: Use correct environment variables
// Node Backend (Orchestrator) - Port 4000
const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 'http://localhost:4000'
// Python Backend (Agents) - Port 8000
const AGENT_BACKEND_URL = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

import { getTenantId as getTenantIdFromAuth } from '@/lib/tenant'

function getTenantId(): string | null {
  // Use centralized tenant helper (no hardcoded fallback)
  return getTenantIdFromAuth()
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(url, { ...options, headers })
}

// ============ Onboarding API ============

export interface OnboardingProgress {
  success: boolean
  steps: Array<{
    step_id: string
    step_name: string
    completed: boolean
    data?: string
    updated_at?: string
  }>
  completed_count: number
  total_count: number
  progress_percent: number
  error?: string
}

export interface OnboardingStepData {
  step_id: string
  step_name: string
  completed: boolean
  data?: Record<string, string>
}

/**
 * Lade Onboarding-Fortschritt
 * 
 * SECURITY: Nutzt same-origin Next API Route. tenant_id wird serverseitig aus JWT gezogen.
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  try {
    const response = await fetchWithAuth('/api/onboarding/get_progress', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    
    if (response.ok) {
      const data = await response.json()
      return data
    }
    
    // Fallback: Return empty structure for UI
    return {
      success: false,
      steps: [],
      completed_count: 0,
      total_count: 5,
      progress_percent: 0,
      error: `HTTP ${response.status}`,
    }
  } catch (error) {
    console.error('Failed to get onboarding progress:', error)
    return {
      success: false,
      steps: [],
      completed_count: 0,
      total_count: 5,
      progress_percent: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Tracke Onboarding-Schritt
 * 
 * SECURITY: Nutzt same-origin Next API Route. tenant_id wird serverseitig aus JWT gezogen.
 */
export async function trackOnboardingStep(step: OnboardingStepData): Promise<boolean> {
  try {
    const response = await fetchWithAuth('/api/onboarding/track_step', {
      method: 'POST',
      body: JSON.stringify({
        step_id: step.step_id,
        step_name: step.step_name,
        completed: step.completed,
        data: step.data,
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.success === true
    }
    
    return false
  } catch (error) {
    console.error('Failed to track onboarding step:', error)
    return false
  }
}

/**
 * Validiere Onboarding-Schritt
 */
export async function validateOnboardingStep(
  step_id: string,
  required_fields: string[],
  data: Record<string, string>
): Promise<{ is_valid: boolean; missing_fields: string[] }> {
  try {
      const tenantId = getTenantId()
      if (!tenantId) {
        throw new Error('Tenant ID is required. User must be authenticated.')
      }
      const response = await fetchWithAuth(`${AGENT_BACKEND_URL}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: tenantId,
          session_id: 'settings-onboarding',
          message: `Validiere Schritt ${step_id} mit Daten: ${JSON.stringify(data)}`,
        }),
      })
    
    if (!response.ok) {
      return { is_valid: false, missing_fields: required_fields }
    }
    
    const result = await response.json()
    return {
      is_valid: result.is_valid || false,
      missing_fields: result.missing_fields || [],
    }
  } catch (error) {
    console.error('Failed to validate onboarding step:', error)
    return { is_valid: false, missing_fields: required_fields }
  }
}

// ============ Settings API ============

export interface UserSettings {
  appearance: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
  }
  notifications: {
    enabled: boolean
    email: boolean
    push: boolean
  }
  ai: {
    model: string
    temperature: number
    max_tokens: number
  }
  integrations: {
    gmail: boolean
    calendar: boolean
    telegram: boolean
  }
}

import { authedFetch } from './api/authedFetch'

/**
 * @deprecated Use useAppSettings() hook instead.
 * This function is kept for backward compatibility but will be removed.
 * 
 * Lade Benutzer-Einstellungen (DEPRECATED)
 */
export async function loadSettings(): Promise<Partial<UserSettings> | null> {
  console.warn('[settingsClient] loadSettings() is deprecated. Use useAppSettings() hook instead.')
  try {
    const response = await authedFetch('/api/settings/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) return null
    const data = await response.json()
    return data.settings || null
  } catch (error) {
    console.error('Failed to load settings:', error)
    return null
  }
}

/**
 * @deprecated Use useAppSettings() hook instead.
 * This function is kept for backward compatibility but will be removed.
 * 
 * Speichere Benutzer-Einstellungen (DEPRECATED)
 */
export async function saveSettings(settings: Partial<UserSettings>): Promise<boolean> {
  console.warn('[settingsClient] saveSettings() is deprecated. Use useAppSettings() hook instead.')
  try {
    const response = await authedFetch('/api/settings/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patch: settings }),
    })
    
    return response.ok
  } catch (error) {
    console.error('Failed to save settings:', error)
    return false
  }
}

// ============ Integrations API ============

export interface IntegrationStatus {
  gmail: boolean
  calendar: boolean
  telegram: boolean
  imap: boolean
  smtp: boolean
}

/**
 * Lade Integration-Status
 */
export async function getIntegrationStatus(): Promise<IntegrationStatus> {
  try {
    // Versuche verschiedene Integrations-APIs zu prüfen
    const status: IntegrationStatus = {
      gmail: false,
      calendar: false,
      telegram: false,
      imap: false,
      smtp: false,
    }
    
    const tenantId = getTenantId()
    if (!tenantId) {
      // User not authenticated - return all false
      return status
    }
    
    // Gmail Status
    try {
      const gmailResp = await fetchWithAuth(`${ORCHESTRATOR_URL}/integrations/gmail/list`, {
        method: 'POST',
        body: JSON.stringify({ tenant_id: tenantId }),
      })
      status.gmail = gmailResp.ok
    } catch {
      // Ignore
    }
    
    // Calendar Status
    try {
      const calResp = await fetchWithAuth(`${ORCHESTRATOR_URL}/integrations/calendar/list`, {
        method: 'POST',
        body: JSON.stringify({ tenant_id: tenantId }),
      })
      status.calendar = calResp.ok
    } catch {
      // Ignore
    }
    
    // Telegram Status
    try {
      const tgResp = await fetchWithAuth(`${ORCHESTRATOR_URL}/integrations/telegram/status?tenantId=${tenantId}`, {
        method: 'GET',
      })
      if (tgResp.ok) {
        const data = await tgResp.json()
        status.telegram = data.connected === true
      }
    } catch {
      // Ignore
    }
    
    return status
  } catch (error) {
    console.error('Failed to get integration status:', error)
    return {
      gmail: false,
      calendar: false,
      telegram: false,
      imap: false,
      smtp: false,
    }
  }
}

// ============ AI Shield Settings API ============

export interface AIShieldSettings {
  tenant_id: string
  enabled: boolean
  control_plane_url: string | null
  integrations_enabled: Record<string, boolean>
  preset_selection: string | null
  updated_at: Date | null
}

export interface UpdateAIShieldSettings {
  enabled?: boolean
  control_plane_url?: string | null
  integrations_enabled?: Record<string, boolean>
  preset_selection?: string | null
}

/**
 * Lade AI Shield Settings
 * 
 * SECURITY: Nutzt same-origin Next API Route. tenant_id wird serverseitig aus JWT gezogen.
 */
export async function getAIShieldSettings(): Promise<AIShieldSettings | null> {
  try {
    const response = await fetchWithAuth('/api/settings/ai-shield', {
      method: 'GET',
    })
    
    if (!response.ok) {
      console.error('Failed to get AI Shield settings:', response.status, response.statusText)
      return null
    }
    
    const data = await response.json()
    return data as AIShieldSettings
  } catch (error) {
    console.error('Failed to get AI Shield settings:', error)
    return null
  }
}

/**
 * Speichere AI Shield Settings
 * 
 * SECURITY: Nutzt same-origin Next API Route. tenant_id wird serverseitig aus JWT gezogen.
 */
export async function updateAIShieldSettings(settings: UpdateAIShieldSettings): Promise<boolean> {
  try {
    const response = await fetchWithAuth('/api/settings/ai-shield', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
    
    if (!response.ok) {
      console.error('Failed to update AI Shield settings:', response.status, response.statusText)
      return false
    }
    
    const data = await response.json()
    return data.ok === true
  } catch (error) {
    console.error('Failed to update AI Shield settings:', error)
    return false
  }
}

