/**
 * KMU Quick Templates API Route - Single Template
 * 
 * SECURITY: Uses kmuProxy helper for secure header handling.
 */

import { NextRequest } from 'next/server'
import { proxyToKmuBackend } from '@/lib/server/kmuProxy'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return proxyToKmuBackend(req, '/kmu/templates/{id}', {
    pathParams: { id },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  
  return proxyToKmuBackend(req, '/kmu/templates/{id}', {
    method: 'PATCH',
    pathParams: { id },
    body: JSON.stringify(body),
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return proxyToKmuBackend(req, '/kmu/templates/{id}', {
    method: 'DELETE',
    pathParams: { id },
  })
}

