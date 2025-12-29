import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest, getInternalApiKeyHeader } from '@/lib/server/tenant'

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    const channel = searchParams.get('channel')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') || '100'
    const offset = searchParams.get('offset') || '0'

    const params = new URLSearchParams({
      tenant_id: tenantId,
      limit,
      offset,
    })
    if (campaignId) params.append('campaign_id', campaignId)
    if (channel) params.append('channel', channel)
    if (status) params.append('status', status)

    const response = await fetch(`${BACKEND_URL}/social-media/posts?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getInternalApiKeyHeader(),
        'x-tenant-id': tenantId,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ items: [], tenant_id: tenantId, count: 0 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Social media posts API error:', error)
    const tenantRes = requireTenantIdFromRequest(request)
    const tenantId = tenantRes instanceof NextResponse ? 'unknown' : tenantRes
    return NextResponse.json({ items: [], tenant_id: tenantId, count: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/social-media/posts?tenant_id=${tenantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getInternalApiKeyHeader(),
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create post' }))
      return NextResponse.json(
        errorData,
        { status: response.status === 404 ? 502 : response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Social media posts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

