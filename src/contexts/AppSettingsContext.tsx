'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from '@/i18n'
import { useAuth } from './AuthContext'
import { 
  fetchUserSettings, 
  updateUserSettings as updateUserSettingsApi,
  fetchTenantSettings,
  updateTenantSettings as updateTenantSettingsApi,
  type UserSettings,
  type TenantSettings,
  DEFAULT_USER_SETTINGS,
  DEFAULT_TENANT_SETTINGS,
} from '@/lib/settings/appSettingsClient'
import { writeMemoryEnabled } from '@/lib/preferences/memoryPreferences'
import { loadCustomInstructions } from '@/lib/customInstructionsStore'
import { deepMerge } from '@/lib/utils'

interface AppSettingsContextValue {
  userSettings: UserSettings
  tenantSettings: TenantSettings
  updateUserSettings: (patch: Partial<UserSettings>) => Promise<void>
  updateTenantSettings: (patch: Partial<TenantSettings>) => Promise<void>
  reload: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined)

// Debounce utility
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS)
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>(DEFAULT_TENANT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setTheme } = useTheme()
  const { i18n } = useTranslation()
  const mountedRef = useRef(true)
  const pendingUserPatchRef = useRef<Partial<UserSettings> | null>(null)
  const pendingTenantPatchRef = useRef<Partial<TenantSettings> | null>(null)

  // Load settings only when authenticated
  const loadSettings = useCallback(async () => {
    // Don't load settings if user is not authenticated
    if (!isAuthenticated) {
      setIsLoading(false)
      setUserSettings(DEFAULT_USER_SETTINGS)
      setTenantSettings(DEFAULT_TENANT_SETTINGS)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const [userData, tenantData] = await Promise.all([
        fetchUserSettings().catch(() => DEFAULT_USER_SETTINGS),
        fetchTenantSettings().catch(() => DEFAULT_TENANT_SETTINGS),
      ])

      if (!mountedRef.current) return

      setUserSettings(userData)
      setTenantSettings(tenantData)

      // Apply theme immediately
      if (userData.appearance?.theme) {
        setTheme(userData.appearance.theme)
      }

      // Apply language immediately
      if (userData.locale?.language) {
        i18n.changeLanguage(userData.locale.language)
      }

      // Sync memory preference
      if (userData.memory?.enabled !== undefined) {
        writeMemoryEnabled(userData.memory.enabled)
      } else if (userData.ai?.memoryEnabled !== undefined) {
        writeMemoryEnabled(userData.ai.memoryEnabled)
      }

      // Sync custom instructions cache
      if (userData.customInstructions) {
        loadCustomInstructions().catch(() => {
          // Ignore errors, cache will be updated on next access
        })
      }
    } catch (err) {
      if (!mountedRef.current) return
      // Only set error for non-auth errors (401 is expected when not authenticated)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings'
      if (!errorMessage.includes('401') && !errorMessage.includes('Unauthorized')) {
        setError(errorMessage)
        console.error('[AppSettings] Failed to load settings:', err)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, setTheme, i18n])

  // Debounced save function for user settings
  const debouncedSaveUser = useDebounce(async (patch: Partial<UserSettings>) => {
    try {
      const updated = await updateUserSettingsApi(patch)
      if (mountedRef.current) {
        setUserSettings(updated)
        pendingUserPatchRef.current = null
      }
    } catch (err) {
      console.error('[AppSettings] Failed to save user settings:', err)
      // Show user-friendly error message
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
        const isNetworkError = errorMessage.includes('Network error') || 
                               errorMessage.includes('502') || 
                               errorMessage.includes('503') || 
                               errorMessage.includes('504') ||
                               errorMessage.includes('fetch failed')
        
        if (isNetworkError) {
          setError('Backend nicht erreichbar. Ihre Einstellungen werden lokal gespeichert und später synchronisiert.')
          // Bei Netzwerkfehlern: KEIN Rollback, behalte optimistischen Update
          // Die Einstellungen bleiben lokal erhalten
          pendingUserPatchRef.current = null // Markiere als verarbeitet, auch wenn nicht gespeichert
        } else {
          setError(errorMessage)
          // Bei anderen Fehlern: Rollback durchführen
          await loadSettings()
        }
      }
    }
  }, 800)

  // Debounced save function for tenant settings
  const debouncedSaveTenant = useDebounce(async (patch: Partial<TenantSettings>) => {
    try {
      const updated = await updateTenantSettingsApi(patch)
      if (mountedRef.current) {
        setTenantSettings(updated)
        pendingTenantPatchRef.current = null
      }
    } catch (err) {
      console.error('[AppSettings] Failed to save tenant settings:', err)
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
        const isNetworkError = errorMessage.includes('Network error') || 
                               errorMessage.includes('502') || 
                               errorMessage.includes('503') || 
                               errorMessage.includes('504') ||
                               errorMessage.includes('fetch failed')
        
        if (isNetworkError) {
          // Bei Netzwerkfehlern: KEIN Rollback, behalte optimistischen Update
          pendingTenantPatchRef.current = null
        } else {
          // Bei anderen Fehlern: Rollback durchführen
          await loadSettings()
        }
      }
    }
  }, 800)

  const updateUserSettings = useCallback(async (patch: Partial<UserSettings>) => {
    // Optimistic update with deep merge
    setUserSettings((prev) => deepMerge(prev, patch))
    pendingUserPatchRef.current = patch

    // Apply theme immediately if changed
    if (patch.appearance?.theme) {
      setTheme(patch.appearance.theme)
    }

    // Apply language immediately if changed
    if (patch.locale?.language) {
      i18n.changeLanguage(patch.locale.language)
    }

    // Sync memory preference immediately
    if (patch.memory?.enabled !== undefined) {
      writeMemoryEnabled(patch.memory.enabled)
    } else if (patch.ai?.memoryEnabled !== undefined) {
      writeMemoryEnabled(patch.ai.memoryEnabled)
    }

    // Debounced save
    await debouncedSaveUser(patch)
  }, [setTheme, i18n, debouncedSaveUser])

  const updateTenantSettings = useCallback(async (patch: Partial<TenantSettings>) => {
    // Optimistic update with deep merge
    setTenantSettings((prev) => deepMerge(prev, patch))
    pendingTenantPatchRef.current = patch

    // Debounced save
    await debouncedSaveTenant(patch)
  }, [debouncedSaveTenant])

  // Wait for auth to finish loading before attempting to load settings
  useEffect(() => {
    mountedRef.current = true
    
    // Only load settings after auth has finished loading
    if (!authLoading) {
      loadSettings()
    }
    
    return () => {
      mountedRef.current = false
    }
  }, [loadSettings, authLoading])

  // Reload settings when authentication status changes (e.g., after login)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadSettings()
    } else if (!authLoading && !isAuthenticated) {
      // Reset to defaults when logged out
      setUserSettings(DEFAULT_USER_SETTINGS)
      setTenantSettings(DEFAULT_TENANT_SETTINGS)
      setIsLoading(false)
    }
  }, [isAuthenticated, authLoading, loadSettings])

  return (
    <AppSettingsContext.Provider
      value={{
        userSettings,
        tenantSettings,
        updateUserSettings,
        updateTenantSettings,
        reload: loadSettings,
        isLoading,
        error,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext)
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider')
  }
  return context
}

