import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    const response = await fetch(`${gatewayUrl}/reviews/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        reviews_today: 0,
        avg_rating: 0,
        response_rate: 0,
        status_counts: {},
        rating_distribution: {},
        recent_reviews: []
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Reviews stats API error:', error)
    return NextResponse.json({
      reviews_today: 0,
      avg_rating: 0,
      response_rate: 0,
      status_counts: {},
      rating_distribution: {},
      recent_reviews: []
    })
  }
}

