import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenant_id') || 'default-tenant'
    const filter = searchParams.get('filter') || 'all'
    const unreadOnly = searchParams.get('unread_only') === 'true'

    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''
    
    const response = await fetch(`${API_BASE_URL}/v1/notifications?tenant_id=${tenantId}&filter=${filter}&unread_only=${unreadOnly}`, {
      method: 'GET',
      headers: {
        'x-ai-shield-admin-key': adminKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notification_id, tenant_id } = body

    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

    let endpoint = ''
    if (action === 'mark-read') {
      endpoint = `${API_BASE_URL}/v1/notifications/${notification_id}/read`
    } else if (action === 'mark-all-read') {
      endpoint = `${API_BASE_URL}/v1/notifications/mark-all-read`
    } else if (action === 'mute') {
      endpoint = `${API_BASE_URL}/v1/notifications/${notification_id}/mute`
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-ai-shield-admin-key': adminKey,
        'Content-Type': 'application/json',
        'x-tenant-id': tenant_id || 'default-tenant',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

