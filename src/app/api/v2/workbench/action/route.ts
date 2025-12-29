import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Proxy zu Node Backend
    const backendUrl = getGatewayUrl()
    const authHeader = buildForwardAuthHeaders(request)

    const response = await fetch(`${backendUrl}/api/workbench/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Workbench action error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

