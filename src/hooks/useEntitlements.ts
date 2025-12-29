'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ModuleId } from '@/lib/entitlements/modules'
import { useAuth } from '@/contexts/AuthContext'

type Entitlements = Record<ModuleId, boolean>

// Global cache for entitlements (shared across all hook instances)
let globalCache: Entitlements | null = null
let lastFetched = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useEntitlements() {
  const { user } = useAuth()
  const isDeveloper = user?.isDeveloper === true || process.env.NEXT_PUBLIC_AKLOW_DEV_MODE === 'true'

  // Initial state: all locked (will be loaded from API)
  const [entitlements, setEntitlements] = useState<Entitlements>({
    reviews: false,
    website_assistant: false,
    telephony: false,
    telegram: false,
    ai_shield: false,
    memory: false,
    crm: false,
    documents: false,
    inbox: false,
    teams: false,
    directMessages: false,
    marketing: false, // BETA: Marketing disabled by default
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  // ... (mountedRef effect)

  const fetchEntitlements = useCallback(async (force = false): Promise<Entitlements> => {
    // DEVELOPER OVERRIDE
    if (isDeveloper) {
      return {
        reviews: true,
        website_assistant: true,
        telephony: true,
        telegram: true,
        ai_shield: true,
        memory: true,
        crm: true,
        documents: true,
        inbox: true,
        teams: true,
        directMessages: true,
        marketing: true, // BETA: Dev mode enables marketing
      }
    }

    // DEV BYPASS (ENV)
    if (process.env.NEXT_PUBLIC_ENTITLEMENTS_BYPASS === '1') {
      return {
        reviews: true,
        website_assistant: true,
        telephony: true,
        telegram: true,
        ai_shield: true,
        memory: true,
        crm: true,
        documents: true,
        inbox: true,
        teams: true,
        directMessages: true,
        marketing: true, // BETA: Bypass enables marketing
      }
    }

    // Check cache
    const now = Date.now()
    if (!force && globalCache && (now - lastFetched < CACHE_TTL)) {
      return globalCache
    }

    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/entitlements/check', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (!response.ok) {
        throw new Error(`Entitlements request failed: ${response.status}`)
      }
      
      const data = await response.json() as { entitlements?: Record<string, boolean> }
      const newEntitlements = (data?.entitlements || {}) as Entitlements
      
      // Use API response directly (no forced unlock)
      // Update global cache
      globalCache = newEntitlements
      lastFetched = now
      
      return newEntitlements
    } catch (err) {
      console.warn('[useEntitlements] Failed to load entitlements', err)
      setError(err instanceof Error ? err.message : String(err))
      // On error, return empty entitlements (all locked)
      // This ensures users don't accidentally get access when API fails
      return {
        reviews: false,
        website_assistant: false,
        telephony: false,
        telegram: false,
        ai_shield: false,
        memory: false,
        crm: false,
        documents: false,
        inbox: false,
        teams: false,
        directMessages: false,
        marketing: false, // BETA: Marketing locked on error
      }
    }
  }, [])

  const isEntitled = useCallback((moduleId: ModuleId): boolean => {
    if (isDeveloper) return true;
    return entitlements[moduleId] === true
  }, [entitlements, isDeveloper])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchEntitlements(true)
      if (mountedRef.current) {
        setEntitlements(data)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to refresh entitlements')
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [fetchEntitlements])

  useEffect(() => {
    // Initial fetch (honors cache)
    const init = async () => {
      setIsLoading(true)
      const data = await fetchEntitlements()
      if (mountedRef.current) {
        setEntitlements(data)
        setIsLoading(false)
      }
    }
    init()
  }, [fetchEntitlements, isDeveloper])

  return {
    entitlements,
    isEntitled,
    refresh,
    isLoading,
    error,
  }
}

