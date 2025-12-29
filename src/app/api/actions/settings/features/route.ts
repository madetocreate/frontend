import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders, validateTenantMatch } from '@/lib/server/securityGuards'

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

/**
 * GET /api/actions/settings/features
 * 
 * SECURITY HARDENED:
 * - Tenant ID ONLY from authenticated JWT (no query params, no defaults)
 * - Defense-in-depth: validates query tenant_id matches auth if provided
 * 
 * Query Params:
 * - category: Optional Filter (basic, advanced, expert)
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    // Defense-in-depth: If client sends tenant_id query param, verify it matches auth
    // Note: We read query param ONLY for validation, never as source of truth
    const queryTenantId = request.nextUrl.searchParams.get('tenant_id')
    if (queryTenantId && typeof queryTenantId === 'string') {
      const mismatch = validateTenantMatch(request, queryTenantId)
      if (mismatch) return mismatch // 403 if mismatch
    }
    
    const category = request.nextUrl.searchParams.get('category')

    // Backend-URL zusammenstellen
    const url = new URL(`${AGENT_BACKEND_URL}/api/actions/settings/features`)
    url.searchParams.set('tenant_id', tenantId)
    if (category) {
      url.searchParams.set('category', category)
    }

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
      // Verbindungsfehler (Backend nicht erreichbar)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error(`Feature settings: Cannot connect to backend at ${AGENT_BACKEND_URL}:`, errorMessage)
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Backend nicht erreichbar (${AGENT_BACKEND_URL}). Bitte prüfe, ob das Python-Backend läuft.`,
          details: { backendUrl: AGENT_BACKEND_URL, originalError: errorMessage }
        },
        { status: 503 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend feature settings GET error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Feature settings GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

