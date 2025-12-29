import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '../../_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gatewayUrl = getGatewayUrl()
    let authHeaders = buildForwardAuthHeaders(request)

    // Sanitize: Only allow user_id and team_id (tenant_id comes from auth)
    const allowedParams = new URLSearchParams()
    if (searchParams.has('user_id')) {
      allowedParams.append('user_id', searchParams.get('user_id')!)
    }
    if (searchParams.has('team_id')) {
      allowedParams.append('team_id', searchParams.get('team_id')!)
    }

    // In development, get a dev token if no auth header present
    if (process.env.NODE_ENV !== 'production' && !authHeaders['authorization']) {
      try {
        const devTokenRes = await fetch(`${gatewayUrl}/auth/dev/token`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ tenantId: 'aklow-main', userId: 'dev-user', role: 'admin' }),
        })
        if (devTokenRes.ok) {
          const devTokenData = await devTokenRes.json()
          if (devTokenData.token) {
            authHeaders = { ...authHeaders, 'authorization': `Bearer ${devTokenData.token}` }
          }
        }
      } catch (e) {
        console.warn('[team-channels/list] Failed to get dev token:', e)
      }
    }

    const response = await fetch(`${gatewayUrl}/team-channels/list?${allowedParams.toString()}`, {
      headers: {
        ...authHeaders,
      },
    })

    if (!response.ok) {
      // In dev, return empty array instead of error for better UX
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[team-channels/list] Backend error, returning empty array')
        return NextResponse.json({ channels: [] })
      }
      return NextResponse.json(
        { error: 'backend_error', message: 'Backend service returned an error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Team channels list proxy error:', error)
    // In dev, return empty array instead of error
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ channels: [] })
    }
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

