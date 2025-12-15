import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenant_id') || 'default-tenant'

    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

    const response = await fetch(`${API_BASE_URL}/v1/workflows?tenant_id=${tenantId}`, {
      method: 'GET',
      headers: {
        'x-ai-shield-admin-key': adminKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Workflows API error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workflow_id, tenant_id, inputs } = body

    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

    if (action === 'trigger') {
      const response = await fetch(`${API_BASE_URL}/v1/workflows/${workflow_id}/trigger`, {
        method: 'POST',
        headers: {
          'x-ai-shield-admin-key': adminKey,
          'Content-Type': 'application/json',
          'x-tenant-id': tenant_id || 'default-tenant',
        },
        body: JSON.stringify({ inputs }),
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to trigger workflow' },
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
    console.error('Workflows API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

