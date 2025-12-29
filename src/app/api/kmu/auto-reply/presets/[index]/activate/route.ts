/**
 * KMU Auto-Reply Presets - Activate Preset
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  const { index } = await params
  
  return proxyToKmuBackend(req, '/kmu/auto-reply/presets/{index}/activate', {
    method: 'POST',
    pathParams: { index },
  })
}

