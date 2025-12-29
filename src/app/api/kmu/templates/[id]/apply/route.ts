/**
 * KMU Quick Templates - Apply Template with Variables
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/templates/{id}/apply', {
    method: 'POST',
    pathParams: { id },
    body: JSON.stringify(body),
  })
}

