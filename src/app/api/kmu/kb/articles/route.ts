/**
 * KMU Knowledge Base Articles API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const publishedOnly = searchParams.get('published_only') === 'true'
  const search = searchParams.get('search') || ''
  const limit = searchParams.get('limit') || '50'
  const offset = searchParams.get('offset') || '0'
  
  return proxyToKmuBackend(req, '/kmu/kb/articles', {
    searchParams: {
      category,
      published_only: publishedOnly ? 'true' : '',
      search,
      limit,
      offset,
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/kb/articles', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

