import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    const res = await fetch(`${gatewayUrl}/integrations/reviews/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'Backend error', message: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Reviews status GET proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

