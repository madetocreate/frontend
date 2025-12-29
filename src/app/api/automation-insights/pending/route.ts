import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards'
import { BackendUrls } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '5'
    
    // Check if INTERNAL_API_KEY is configured
    if (!process.env.INTERNAL_API_KEY) {
      // Return empty data gracefully in development
      console.warn('[automation-insights/pending] INTERNAL_API_KEY not configured, returning empty data')
      return NextResponse.json({ insights: [], count: 0, has_more: false })
    }
    
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true })
    
    const response = await fetch(
      `${BackendUrls.agent()}/api/v1/automation-insights/pending?limit=${limit}`,
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend error:', errorText)
      // Return empty data instead of error for better UX
      return NextResponse.json({ insights: [], count: 0, has_more: false })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    // Return empty data instead of error for better UX
    return NextResponse.json({ insights: [], count: 0, has_more: false })
  }
}

