/**
 * Settings API Client - Kommunikation mit Backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
const AGENT_BACKEND_URL = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function getTenantId(): string {
  if (typeof window === 'undefined') return 'demo-tenant'
  // Try multiple sources for tenant_id
  const stored = localStorage.getItem('tenant_id')
  if (stored) return stored
  
  // Try from environment
  const envTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID
  if (envTenant) return envTenant
  
  // Default fallback
  return 'demo-tenant'
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
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  try {
    // Try direct API call first
    const response = await fetchWithAuth(`${AGENT_BACKEND_URL}/onboarding/get_progress`, {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: getTenantId(),
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return data
    }
    
    // Fallback: Return mock data structure for UI
    return {
      success: true,
      steps: [],
      completed_count: 0,
      total_count: 5,
      progress_percent: 0,
    }
  } catch (error) {
    console.error('Failed to get onboarding progress:', error)
    // Return mock data for UI
    return {
      success: false,
      steps: [],
      completed_count: 0,
      total_count: 5,
      progress_percent: 0,
    }
  }
}

/**
 * Tracke Onboarding-Schritt
 */
export async function trackOnboardingStep(step: OnboardingStepData): Promise<boolean> {
  try {
    // Use onboarding workflow API - the agent will call onboarding_track_progress tool
    const tenantId = getTenantId()
    const response = await fetchWithAuth(`${AGENT_BACKEND_URL}/onboarding/workflow`, {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: tenantId,
        session_id: 'settings-onboarding',
        message: `Tracke Onboarding-Schritt: ${step.step_name} (${step.step_id}) - ${step.completed ? 'abgeschlossen' : 'in Bearbeitung'}`,
      }),
    })
    
    return response.ok
  } catch (error) {
    console.error('Failed to track onboarding step:', error)
    // Still return true for UI purposes, but log error
    return true
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
    const response = await fetchWithAuth(`${AGENT_BACKEND_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: getTenantId(),
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

/**
 * Lade Benutzer-Einstellungen
 */
export async function loadSettings(): Promise<Partial<UserSettings> | null> {
  try {
    const response = await fetchWithAuth(`${BACKEND_URL}/integrations/settings/get`, {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: getTenantId(),
      }),
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
 * Speichere Benutzer-Einstellungen
 */
export async function saveSettings(settings: Partial<UserSettings>): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${BACKEND_URL}/integrations/settings/save`, {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: getTenantId(),
        settings,
      }),
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
    
    // Gmail Status
    try {
      const gmailResp = await fetchWithAuth(`${BACKEND_URL}/integrations/gmail/list`, {
        method: 'POST',
        body: JSON.stringify({ tenant_id: getTenantId() }),
      })
      status.gmail = gmailResp.ok
    } catch {
      // Ignore
    }
    
    // Calendar Status
    try {
      const calResp = await fetchWithAuth(`${BACKEND_URL}/integrations/calendar/list`, {
        method: 'POST',
        body: JSON.stringify({ tenant_id: getTenantId() }),
      })
      status.calendar = calResp.ok
    } catch {
      // Ignore
    }
    
    // Telegram Status
    try {
      const tgResp = await fetchWithAuth(`${BACKEND_URL}/integrations/telegram`, {
        method: 'POST',
        body: JSON.stringify({ tenant_id: getTenantId() }),
      })
      status.telegram = tgResp.ok
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

