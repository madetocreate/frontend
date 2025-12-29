import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards'
import { BackendUrls } from '@/app/api/_utils/proxyAuth'

const EMPTY_SUMMARY = {
  total_actions: 0,
  unique_actions: 0,
  completed: 0,
  time_saved_minutes: 0,
  time_saved_hours: 0,
  top_actions: [],
  pending_insights_count: 0
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    // Check if INTERNAL_API_KEY is configured
    if (!process.env.INTERNAL_API_KEY) {
      console.warn('[automation-insights/summary] INTERNAL_API_KEY not configured, returning empty data')
      return NextResponse.json(EMPTY_SUMMARY)
    }
    
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true })
    
    const response = await fetch(
      `${BackendUrls.agent()}/api/v1/automation-insights/summary`,
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend error:', errorText)
      return NextResponse.json(EMPTY_SUMMARY)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(EMPTY_SUMMARY)
  }
}

