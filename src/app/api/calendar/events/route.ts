import { NextRequest, NextResponse } from 'next/server'
import { BackendUrls } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const { requireUserTenant } = await import('@/lib/server/securityGuards');
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const searchParams = request.nextUrl.searchParams
    // Note: account_id is NOT tenantId - it's a calendar account identifier
    // But we should not use 'default' as fallback - require explicit account_id
    const accountId = searchParams.get('account_id')
    if (!accountId) {
      return NextResponse.json(
        { error: 'missing_account_id', message: 'account_id query parameter is required' },
        { status: 400 }
      )
    }
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const params = new URLSearchParams({
      account_id: accountId,
    })
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

      const response = await fetch(`${BackendUrls.agent()}/calendar/events?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Calendar events API error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const { requireUserTenant } = await import('@/lib/server/securityGuards');
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const body = await request.json()
    const { action, account_id, ...eventData } = body

    // Require account_id (no default fallback)
    if (!account_id) {
      return NextResponse.json(
        { error: 'missing_account_id', message: 'account_id is required in request body' },
        { status: 400 }
      )
    }

    if (action === 'create') {
      const response = await fetch(`${BackendUrls.agent()}/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id,
          ...eventData,
        }),
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to create event' },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Calendar events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

