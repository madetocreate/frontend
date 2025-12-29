import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders, buildUserForwardHeaders } from '@/lib/server/securityGuards'
import { getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    const { runId } = await params

    // Build secure headers for gateway call
    const backendUrl = getGatewayUrl()
    const serviceHeaders = buildServiceToServiceHeaders({ tenantId, includeInternalKey: false })
    const forwardHeaders = buildUserForwardHeaders(request)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...serviceHeaders,
      ...forwardHeaders,
    }

    const response = await fetch(`${backendUrl}/actions/runs/${runId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Action run status error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

