'use client'

import { useCallback } from 'react'
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

  // Setup navigation listener
  if (typeof window !== 'undefined') {
    window.addEventListener('aklow-navigate', ((event: CustomEvent) => {
      const { path } = event.detail
      if (path) {
        router.push(path)
      }
    }) as EventListener)
  }

  return {
    handleAction,
    registerAction,
  }
}

