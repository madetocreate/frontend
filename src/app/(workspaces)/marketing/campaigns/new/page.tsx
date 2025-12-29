'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * BETA: Legacy New Campaign Page - Redirects to Marketing Dashboard
 * This page is deprecated in favor of /marketing?view=campaigns
 */
export default function NewCampaignPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/marketing?view=campaigns')
  }, [router])

  return null
}
