/**
 * KMU Quick Templates API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const activeOnly = searchParams.get('active_only') !== 'false'
  
  return proxyToKmuBackend(req, '/kmu/templates', {
    searchParams: {
      category,
      active_only: String(activeOnly),
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/templates', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

