/**
 * KMU Simple Auto-Reply Rules API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const enabledOnly = searchParams.get('enabled_only') === 'true'
  
  return proxyToKmuBackend(req, '/kmu/auto-reply/rules', {
    searchParams: enabledOnly ? { enabled_only: 'true' } : {},
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/auto-reply/rules', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

