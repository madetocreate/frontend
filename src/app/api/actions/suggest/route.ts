import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards'
import { getInternalApiKeyHeader } from '@/lib/server/tenant'

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

/**
 * POST /api/actions/suggest
 * 
 * SECURITY HARDENED:
 * - Tenant ID ONLY from authenticated JWT (no body params, no defaults)
 * 
 * Body:
 * - context: Dict (required)
 * - surface?: string (optional)
 * - maxSuggestions?: number (optional, default: 3)
 * - excludeActionIds?: string[] (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    // Extract userId from auth (optional) - use requireAuthContextFromRequest but don't fail if missing
    let userId: string | undefined
    try {
      const { requireAuthContextFromRequest } = await import('@/lib/server/kmuProxy')
      const authContext = requireAuthContextFromRequest(request)
      if (!(authContext instanceof NextResponse)) {
        userId = authContext.userId
      }
    } catch (error) {
      // userId is optional, ignore errors
    }
    
    const body = await request.json()
    const { context, surface, maxSuggestions, excludeActionIds } = body

    if (!context || typeof context !== 'object') {
      return NextResponse.json(
        { error: 'invalid_request', message: 'context is required' },
        { status: 400 }
      )
    }

    // Build request to Python backend
    const backendRequest = {
      tenant_id: tenantId,
      session_id: `suggest-${Date.now()}`, // not stable, no idempotency issues
      context,
      surface: surface ?? 'ui',
      max_suggestions: maxSuggestions ?? 3,
      exclude_action_ids: excludeActionIds ?? [],
      enable_worklog: true,
    }

    // Build secure service-to-service headers
    const headers = buildServiceToServiceHeaders({ 
      tenantId, 
      includeInternalKey: true 
    })
    
    // Add user ID if available
    if (userId) {
      headers['x-user-id'] = userId
    }
    
    // Optional: Set x-correlation-id from context.target.id if available (for tracing)
    const targetId = context?.target?.id
    if (typeof targetId === 'string' && targetId.length > 0) {
      headers['x-correlation-id'] = targetId
    }

    let response: Response
    try {
      response = await fetch(`${AGENT_BACKEND_URL}/api/v1/actions/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(backendRequest),
      })
    } catch (fetchError) {
      // Connection error (backend not reachable)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error(`Action suggest: Cannot connect to backend at ${AGENT_BACKEND_URL}:`, errorMessage)
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
      console.error('Backend action suggest POST error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Action suggest POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

