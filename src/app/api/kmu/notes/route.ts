/**
 * KMU Internal Notes API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 * Tenant/User from verified JWT tokens only (no header spoofing).
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const inboxItemId = searchParams.get('inbox_item_id')
  const threadId = searchParams.get('thread_id')
  
  return proxyToKmuBackend(req, '/kmu/notes', {
    searchParams: {
      inbox_item_id: inboxItemId || '',
      thread_id: threadId || '',
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/notes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

