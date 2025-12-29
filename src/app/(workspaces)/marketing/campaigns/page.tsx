'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * BETA: Legacy Campaigns Page - Redirects to Marketing Dashboard
 * This page is deprecated in favor of /marketing?view=campaigns
 */
export default function CampaignsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/marketing?view=campaigns')
  }, [router])

  return null
}

