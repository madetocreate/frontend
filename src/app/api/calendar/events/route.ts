import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id') || 'default'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const params = new URLSearchParams({
      account_id: accountId,
    })
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    const response = await fetch(`${BACKEND_URL}/calendar/events?${params.toString()}`, {
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
    console.error('Calendar events API error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, account_id, ...eventData } = body

    if (action === 'create') {
      const response = await fetch(`${BACKEND_URL}/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: account_id || 'default',
          ...eventData,
        }),
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to create event' },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Calendar events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

