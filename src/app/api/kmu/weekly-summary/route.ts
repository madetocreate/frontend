/**
 * KMU Weekly Summary API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(req: NextRequest) {
  return proxyToKmuBackend(req, '/kmu/weekly-summary/settings')
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/weekly-summary/settings', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

