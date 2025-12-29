/**
 * KMU Auto-Reply Presets API Route
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(req: NextRequest) {
  return proxyToKmuBackend(req, '/kmu/auto-reply/presets')
}

