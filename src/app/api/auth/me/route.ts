import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '../../_utils/proxyAuth'

const GATEWAY_URL = getGatewayUrl()

export async function GET(request: NextRequest) {
  try {
    const authHeaders = buildForwardAuthHeaders(request)
    
    const url = `${GATEWAY_URL}/auth/me`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'backend_error', message: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[auth/me] Proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    )
  }
}

