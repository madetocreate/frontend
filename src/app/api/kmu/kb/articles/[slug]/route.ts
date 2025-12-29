/**
 * KMU Knowledge Base Articles API Route - Single Article
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  return proxyToKmuBackend(req, '/kmu/kb/articles/{slug}', {
    pathParams: { slug },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/kb/articles/{slug}', {
    method: 'PATCH',
    pathParams: { slug },
    body: JSON.stringify(body),
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  return proxyToKmuBackend(req, '/kmu/kb/articles/{slug}', {
    method: 'DELETE',
    pathParams: { slug },
  })
}

