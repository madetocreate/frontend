import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenant_id') || 'default-tenant'

    const response = await fetch(`${BACKEND_URL}/telephony/realtime/calls?tenant_id=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Telephony calls API error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, call_id, tenant_id, ...rest } = body

    let endpoint = ''
    if (action === 'takeover') {
      endpoint = `${BACKEND_URL}/telephony/realtime/calls/${call_id}/takeover`
    } else if (action === 'pause-bot') {
      endpoint = `${BACKEND_URL}/telephony/realtime/calls/${call_id}/pause-bot`
    } else if (action === 'end-call') {
      endpoint = `${BACKEND_URL}/telephony/realtime/calls/${call_id}/end`
    } else if (action === 'change-mode') {
      endpoint = `${BACKEND_URL}/telephony/realtime/mode`
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant_id: tenant_id || 'default-tenant',
        ...rest,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to execute telephony action' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Telephony API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

