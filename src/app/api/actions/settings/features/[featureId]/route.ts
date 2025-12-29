import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders, validateTenantMatch } from '@/lib/server/securityGuards'

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

/**
 * POST /api/actions/settings/features/[featureId]
 * 
 * SECURITY HARDENED:
 * - Tenant ID ONLY from authenticated JWT (no body, no defaults)
 * - Defense-in-depth: validates body tenant_id matches auth if provided
 * 
 * Request Body:
 * - enabled: boolean
 * - tenant_id: Optional (ignored, only for validation - must match JWT)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ featureId: string }> }
) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    const { featureId } = await params
    const body = await request.json()
    
    // Defense-in-depth: If client sends tenant_id in body, verify it matches auth
    // Note: We read body.tenant_id ONLY for validation, never as source of truth
    const clientTenantId = body.tenant_id
    if (clientTenantId && typeof clientTenantId === 'string') {
      const mismatch = validateTenantMatch(request, clientTenantId)
      if (mismatch) return mismatch // 403 if mismatch
    }

    const enabled = body.enabled
    if (enabled === undefined || enabled === null) {
      return NextResponse.json(
        { error: 'missing_enabled', message: 'enabled field is required' },
        { status: 400 }
      )
    }

    // Backend-URL zusammenstellen
    const url = `${AGENT_BACKEND_URL}/api/actions/settings/features/${featureId}`

    // Build secure service-to-service headers
    const headers = buildServiceToServiceHeaders({ 
      tenantId, 
      includeInternalKey: true 
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tenant_id: tenantId,
        enabled,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend feature settings POST error:', response.status, errorText)
      
      // Versuche, strukturierte Fehlerantwort zu parsen
      let errorData: any = { detail: errorText }
      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Verwende Text als Detail
      }
      
      return NextResponse.json(
        { error: 'Backend error', message: errorText, details: errorData, status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Feature settings POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

