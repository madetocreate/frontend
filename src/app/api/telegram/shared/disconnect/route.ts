import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function POST(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    
    // Note: Shared bot disconnect might need a different endpoint
    // For now, proxy to a generic disconnect if it exists
    const res = await fetch(`${gatewayUrl}/integrations/telegram/shared/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      console.error('[telegram/shared/disconnect] Backend error:', res.status, errorText)
      return NextResponse.json(
        { error: 'Backend error', message: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[telegram/shared/disconnect] Proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

