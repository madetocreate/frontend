import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    const response = await fetch(`${gatewayUrl}/telephony/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        calls_today: 0,
        avg_duration_seconds: 0,
        success_rate: 0,
        active_calls: 0,
        appointments_created: 0,
        recent_activity: []
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Telephony stats API error:', error)
    return NextResponse.json({
      calls_today: 0,
      avg_duration_seconds: 0,
      success_rate: 0,
      active_calls: 0,
      appointments_created: 0,
      recent_activity: []
    })
  }
}

