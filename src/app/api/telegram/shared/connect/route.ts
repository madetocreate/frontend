import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function POST(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    
    // Generate connect code via backend
    const res = await fetch(`${gatewayUrl}/integrations/telegram/shared/connect-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      console.error('[telegram/shared/connect] Backend error:', res.status, errorText)
      return NextResponse.json(
        { error: 'Backend error', message: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[telegram/shared/connect] Proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

