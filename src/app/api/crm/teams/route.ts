import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '../../_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gatewayUrl = getGatewayUrl()
    const authHeaders = buildForwardAuthHeaders(request)

    // Sanitize: Only allow limit (tenant_id comes from auth)
    const allowedParams = new URLSearchParams()
    if (searchParams.has('limit')) {
      allowedParams.append('limit', searchParams.get('limit')!)
    }

    const response = await fetch(`${gatewayUrl}/crm/teams?${allowedParams.toString()}`, {
      headers: {
        ...authHeaders,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'backend_error', message: 'Backend service returned an error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('CRM teams list proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

