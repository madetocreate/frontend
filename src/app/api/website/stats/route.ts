import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    const response = await fetch(`${gatewayUrl}/website/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        conversations_today: 0,
        active_visitors: 0,
        leads_generated: 0,
        handoff_rate: 0,
        avg_messages_per_conversation: 0,
        recent_conversations: [],
        top_topics: []
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Website stats API error:', error)
    return NextResponse.json({
      conversations_today: 0,
      active_visitors: 0,
      leads_generated: 0,
      handoff_rate: 0,
      avg_messages_per_conversation: 0,
      recent_conversations: [],
      top_topics: []
    })
  }
}

