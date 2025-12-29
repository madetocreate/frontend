'use client'

import { useEffect } from 'react'

/**
 * Hook to listen for the centralized 'ak-escape-pressed' event.
 * This avoids duplicate keydown listeners and ensures consistent ESC handling.
 */
export function useAklowEscape({
  enabled,
  onEscape,
}: {
  enabled: boolean
  onEscape: () => void
}) {
  useEffect(() => {
    if (!enabled) return

    const handler = () => {
      onEscape()
    }

    window.addEventListener('ak-escape-pressed', handler)
    return () => {
      window.removeEventListener('ak-escape-pressed', handler)
    }
  }, [enabled, onEscape])
}

