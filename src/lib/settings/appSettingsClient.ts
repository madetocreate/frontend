/**
 * App Settings Client
 * 
 * Client functions to fetch and update user/tenant settings.
 */

import { authedFetch } from '@/lib/api/authedFetch'
import type { UserSettings, TenantSettings } from './appSettingsTypes'
export { DEFAULT_USER_SETTINGS, DEFAULT_TENANT_SETTINGS, type UserSettings, type TenantSettings } from './appSettingsTypes'

export async function fetchUserSettings(): Promise<UserSettings> {
  try {
    const response = await authedFetch('/api/settings/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'unknown', message: 'Unknown error' }))
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`
      
      // For expected errors, log as warning instead of error
      if (response.status === 401) {
        console.warn(`[appSettingsClient] User settings not available (401) - likely unauthenticated`)
      } else if (response.status === 404) {
        console.warn(`[appSettingsClient] User settings route not found (404) - using default settings`)
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        console.warn(`[appSettingsClient] Backend temporarily unavailable (${response.status}) - using default settings`)
      } else {
        console.error(`[appSettingsClient] Failed to fetch user settings (${response.status}): ${errorMessage}`, {
          status: response.status,
          error: errorData,
        })
      }
      
      throw new Error(`Failed to fetch user settings: ${response.status} - ${errorMessage}`)
    }

    const data = await response.json()
    return data.settings || {}
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('[appSettingsClient] Network error - Backend nicht erreichbar, verwende Default-Einstellungen')
      throw new Error('Network error: Backend is not reachable. Please check if the backend server is running.')
    }
    throw error
  }
}

export async function updateUserSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const response = await authedFetch('/api/settings/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patch }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'unknown', message: 'Unknown error' }))
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`
      
      console.error(`[appSettingsClient] Failed to update user settings (${response.status}): ${errorMessage}`, {
        status: response.status,
        error: errorData,
        patch,
      })
      
      throw new Error(`Failed to update user settings: ${response.status} - ${errorMessage}`)
    }

    const data = await response.json()
    return data.settings || {}
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('[appSettingsClient] Network error beim Update - Backend nicht erreichbar')
      throw new Error('Network error: Backend is not reachable. Please check if the backend server is running.')
    }
    throw error
  }
}

export async function fetchTenantSettings(): Promise<TenantSettings> {
  try {
    const response = await authedFetch('/api/settings/tenant', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Log expected errors as warnings instead of errors
      if (response.status === 404) {
        console.warn(`[appSettingsClient] Tenant settings route not found (404) - using default tenant settings`)
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        console.warn(`[appSettingsClient] Backend temporarily unavailable (${response.status}) - using default tenant settings`)
      } else {
        console.error(`[appSettingsClient] Failed to fetch tenant settings: ${response.status}`)
      }
      throw new Error(`Failed to fetch tenant settings: ${response.status}`)
    }

    const data = await response.json()
    return data.settings || {}
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('[appSettingsClient] Network error - Backend nicht erreichbar, verwende Default-Tenant-Einstellungen')
      throw new Error('Network error: Backend is not reachable.')
    }
    throw error
  }
}

export async function updateTenantSettings(patch: Partial<TenantSettings>): Promise<TenantSettings> {
  try {
    const response = await authedFetch('/api/settings/tenant', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patch }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'unknown' }))
      console.error(`[appSettingsClient] Failed to update tenant settings (${response.status})`, errorData)
      throw new Error(`Failed to update tenant settings: ${response.status}`)
    }

    const data = await response.json()
    return data.settings || {}
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('[appSettingsClient] Network error beim Tenant-Update - Backend nicht erreichbar')
      throw new Error('Network error: Backend is not reachable.')
    }
    throw error
  }
}

