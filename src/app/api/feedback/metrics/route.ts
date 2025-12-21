import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenant_id') || 'demo-tenant'
    const days = searchParams.get('days') || '7'

    const response = await fetch(`${BACKEND_URL}/feedback/metrics?tenant_id=${tenantId}&days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
