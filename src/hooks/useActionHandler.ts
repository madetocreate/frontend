'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { frontendWiring, type ActionConfig } from '@/lib/frontendWiring'

/**
 * Hook to handle frontend actions
 */
export function useActionHandler() {
  const router = useRouter()

  const handleAction = useCallback(async (
    actionId: string,
    additionalPayload?: Record<string, unknown>
  ) => {
    await frontendWiring.executeAction(actionId, additionalPayload)
  }, [])

  const registerAction = useCallback((actionId: string, config: ActionConfig) => {
    frontendWiring.registerAction(actionId, config)
  }, [])

  // Setup navigation listener with cleanup
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleNavigate = (event: CustomEvent<{ path: string }>) => {
      const { path } = event.detail
      if (path) {
        router.push(path)
      }
    }

    window.addEventListener('aklow-navigate', handleNavigate as EventListener)
    return () => window.removeEventListener('aklow-navigate', handleNavigate as EventListener)
  }, [router])

  return {
    handleAction,
    registerAction,
  }
}

