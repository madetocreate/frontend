import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest } from '@/lib/server/tenant'

export async function POST(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    const body = await request.json()
    const gatewayUrl = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000'
    const token = request.headers.get('authorization')

    const response = await fetch(`${gatewayUrl}/integrations/settings/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify({
        provider: 'imap',
        tenantId, // Ensure tenantId is passed explicitly if backend needs it in body
        ...body
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(errorData, { status: response.status })
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status })
      }
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('IMAP settings proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
