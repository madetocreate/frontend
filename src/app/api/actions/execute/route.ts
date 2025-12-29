import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, requireAdminTenantOverride } from '@/lib/server/securityGuards'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'
import { normalizeExecutableActionId } from '@/lib/actions/registry'

export async function POST(request: NextRequest) {
  // SECURITY: Try user tenant first (from JWT)
  let tenantId = requireUserTenant(request);
  
  // If no user tenant, try admin override (x-tenant-id header with admin session)
  if (tenantId instanceof NextResponse) {
    tenantId = requireAdminTenantOverride(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401/403 if no auth
    }
  }
  
  // tenantId is guaranteed string here (from JWT or admin override)
  return await executeAction(request, tenantId);
}

async function executeAction(request: NextRequest, tenantId: string) {
  try {
    const body = await request.json()
    const { context, actionId, config, stream: bodyStream } = body
    
    // Set x-correlation-id from context.target.id if available (for tracing)
    const targetId = context?.target?.id
    const correlationId = typeof targetId === 'string' && targetId.length > 0 ? targetId : undefined

    const normalizedActionId = normalizeExecutableActionId(actionId)
    if (!normalizedActionId) {
      return NextResponse.json(
        { error: 'action_not_executable', message: `Action "${actionId}" ist nicht erlaubt.` },
        { status: 400 }
      )
    }

    // Determine if client wants streaming
    const acceptHeader = request.headers.get('accept') || ''
    const wantsStream = acceptHeader.includes('text/event-stream') || bodyStream === true

    // Proxy zu Node Backend (der dann zu Python Backend proxyt)
    const backendUrl = getGatewayUrl()
    
    // Forward Authorization header
    const authHeaders = buildForwardAuthHeaders(request)
    
    // Build secure headers with tenant from auth context
    const { buildServiceToServiceHeaders, buildUserForwardHeaders } = await import('@/lib/server/securityGuards');
    const serviceHeaders = buildServiceToServiceHeaders({ tenantId, includeInternalKey: false });
    const forwardHeaders = buildUserForwardHeaders(request);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(wantsStream ? { 'Accept': 'text/event-stream' } : {}),
      ...serviceHeaders, // x-tenant-id from auth context
      ...forwardHeaders, // Authorization + correlation IDs
    }
    
    // Override x-correlation-id with target.id if available (more specific than request header)
    if (correlationId) {
      headers['x-correlation-id'] = correlationId
    }

    const response = await fetch(`${backendUrl}/actions/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tenantId,
        sessionId: `action-${actionId}-${Date.now()}`,
        actionId: normalizedActionId,
        context,
        config,
        stream: wantsStream,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend action execution error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    // Wenn Backend streamt, stream weiter
    if (response.body && response.headers.get('content-type')?.includes('text/event-stream')) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Sonst JSON Response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Action execution error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

