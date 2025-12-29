/**
 * Onboarding Track Step API Route (Server-Only)
 * 
 * SECURITY: tenant_id wird serverseitig aus JWT gezogen, nicht aus Client-Body.
 * x-internal-api-key wird serverseitig hinzugefügt.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest } from '@/lib/server/tenant'

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

export async function POST(request: NextRequest) {
  // Tenant-ID aus verifiziertem JWT
  const tenantResult = requireTenantIdFromRequest(request)
  if (tenantResult instanceof NextResponse) {
    return tenantResult // Error response
  }
  const tenantId = tenantResult

  try {
    const body = await request.json()
    const { step_id, step_name, completed, data } = body

    if (!step_id || !step_name) {
      return NextResponse.json(
        { error: 'step_id and step_name are required' },
        { status: 400 }
      )
    }

    const internalApiKey = process.env.INTERNAL_API_KEY
    if (!internalApiKey) {
      return NextResponse.json(
        { error: 'INTERNAL_API_KEY not configured (server-only)' },
        { status: 500 }
      )
    }

    // Proxy zu Python Backend
    // tenant_id kommt NICHT aus Client-Body, sondern serverseitig
    const response = await fetch(`${AGENT_BACKEND_URL}/api/v1/onboarding/track_step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': internalApiKey,
      },
      body: JSON.stringify({
        tenant_id: tenantId,
        step_id,
        step_name,
        completed: completed ?? false,
        data: data || {},
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Onboarding track_step error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

