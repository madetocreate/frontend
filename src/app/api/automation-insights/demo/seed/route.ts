import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards'

const BACKEND_URL = process.env.BACKEND_AGENTS_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401 if no auth
    }
    
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true })
    
    const response = await fetch(
      `${BACKEND_URL}/api/v1/automation-insights/demo/seed`,
      {
        method: 'POST',
        headers,
      }
    )

    if (!response.ok) {
      console.error('Backend error:', await response.text())
      return NextResponse.json(
        { error: 'Failed to seed demo data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

