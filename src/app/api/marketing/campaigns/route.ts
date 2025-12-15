import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenant_id') || 'default-tenant'

    const response = await fetch(`${BACKEND_URL}/marketing/campaigns?tenant_id=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Return empty array if endpoint doesn't exist yet
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Marketing campaigns API error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/marketing/workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_campaign',
        ...body,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Marketing campaigns API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

