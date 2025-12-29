/**
 * KMU KB Article Feedback API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const helpful = searchParams.get('helpful') === 'true'
  
  return proxyToKmuBackend(req, '/kmu/kb/articles/{slug}/feedback', {
    method: 'POST',
    pathParams: { slug },
    searchParams: { helpful: String(helpful) },
  })
}

