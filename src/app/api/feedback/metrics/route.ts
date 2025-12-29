import { NextRequest, NextResponse } from 'next/server'
import { getTenantIdFromRequest, getInternalApiKeyHeader } from '@/lib/server/tenant'
import { BackendUrls } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    // Security: Tenant-ID comes from auth context (JWT), not query
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams
    const days = searchParams.get('days') || '7'

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      ...getInternalApiKeyHeader(),
    };

    const response = await fetch(`${BackendUrls.agent()}/feedback/metrics?tenant_id=${tenantId}&days=${days}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      // Return fallback metrics if endpoint fails
      return NextResponse.json({
         tenant_id: tenantId,
         agent_name: 'all',
         period_start: new Date().toISOString(),
         period_end: new Date().toISOString(),
         total_feedback: 0,
         thumbs_up_count: 0,
         thumbs_down_count: 0,
         average_rating: 0,
         positive_feedback_rate: 0
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Feedback metrics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
