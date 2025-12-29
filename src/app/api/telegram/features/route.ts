import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    const res = await fetch(`${gatewayUrl}/integrations/telegram/features`, {
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
    console.error('Telegram features GET proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const gatewayUrl = getGatewayUrl()
    
    const res = await fetch(`${gatewayUrl}/integrations/telegram/features`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
      body: JSON.stringify(body),
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
    console.error('Telegram features PUT proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Legacy POST handler (redirect to PUT)
export async function POST(request: NextRequest) {
  return PUT(request)
}

