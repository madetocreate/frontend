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
    
    // Check if INTERNAL_API_KEY is configured
    if (!process.env.INTERNAL_API_KEY) {
      console.warn('[automation-insights/rules] INTERNAL_API_KEY not configured, returning empty data')
      return NextResponse.json({ rules: [], count: 0 })
    }
    
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true })
    
    const response = await fetch(
      `${BackendUrls.agent()}/api/v1/automation-insights/rules`,
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend error:', errorText)
      return NextResponse.json({ rules: [], count: 0 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ rules: [], count: 0 })
  }
}

