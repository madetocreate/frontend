import { NextRequest, NextResponse } from 'next/server'
import { getTenantIdFromRequest } from '@/lib/server/tenant'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function POST(request: NextRequest) {
  const tenantId = getTenantIdFromRequest(request)
  if (!tenantId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const gatewayUrl = getGatewayUrl()
    
    const response = await fetch(`${gatewayUrl}/integrations/telegram/customer/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Telegram connect error:', error)
    return NextResponse.json({ error: 'proxy_failed' }, { status: 502 })
  }
}
