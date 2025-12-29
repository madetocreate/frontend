import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '../../_utils/proxyAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const gatewayUrl = getGatewayUrl()
    const authHeaders = buildForwardAuthHeaders(request)

    const response = await fetch(`${gatewayUrl}/team-channels/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'backend_error', message: 'Backend service returned an error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Team channels create proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

