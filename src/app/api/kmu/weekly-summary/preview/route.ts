/**
 * KMU Weekly Summary Preview API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function POST(req: NextRequest) {
  return proxyToKmuBackend(req, '/kmu/weekly-summary/preview', {
    method: 'POST',
  })
}
