/**
 * KMU Auto-Reply Rule Toggle API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const enabled = searchParams.get('enabled') === 'true'
  
  return proxyToKmuBackend(req, '/kmu/auto-reply/rules/{id}/toggle', {
    method: 'PATCH',
    pathParams: { id },
    searchParams: { enabled: String(enabled) },
  })
}

