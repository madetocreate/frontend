/**
 * Client-Component für Action Registry Validierung
 * Wird beim App-Start ausgeführt (nur in Dev)
 */

'use client'

import { useEffect } from 'react'
import { validateRegistryOnInit } from '@/lib/actions/validate'

export function ActionRegistryValidator() {
  useEffect(() => {
    // Validiere Registry beim Mount (nur in Dev)
    validateRegistryOnInit()
  }, [])

  // Kein UI-Rendering
  return null
}

