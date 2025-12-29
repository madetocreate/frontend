import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards'

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

/**
 * GET /api/worklog
 * 
 * SECURITY HARDENED:
 * - Tenant ID ONLY from authenticated JWT
 * 
 * Query Params:
 * - range: "today"|"7d"|"30d"|"all" (default "7d")
 * - types: optional comma list ("executed","suggestion","setup","ingress")
 * - limit: int default 200
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    // Extract query params
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    const types = searchParams.get('types')
    const limit = searchParams.get('limit') || '200'

    // Build URL with query params
    const url = new URL(`${AGENT_BACKEND_URL}/api/v1/worklog`)
    url.searchParams.set('range', range)
    if (types) {
      url.searchParams.set('types', types)
    }
    url.searchParams.set('limit', limit)

    // Build secure service-to-service headers
    const headers = buildServiceToServiceHeaders({ 
      tenantId, 
      includeInternalKey: true 
    })

    let response: Response
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      })
    } catch (fetchError) {
      // Connection error (backend not reachable)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error(`WorkLog: Cannot connect to backend at ${AGENT_BACKEND_URL}:`, errorMessage)
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Backend nicht erreichbar (${AGENT_BACKEND_URL}).`,
          entries: [],
        },
        { status: 503 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend worklog GET error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Backend error', message: errorText, entries: [] },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('WorkLog GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error', entries: [] },
      { status: 500 }
    )
  }
}

