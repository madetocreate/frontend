import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '../../_utils/proxyAuth'

const GATEWAY_URL = getGatewayUrl()

export async function GET(request: NextRequest) {
  try {
    const authHeaders = buildForwardAuthHeaders(request)
    
    const url = `${GATEWAY_URL}/settings/tenant`
    console.log('[settings/tenant] Proxying GET to:', url)
    
    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
      })
    } catch (fetchError) {
      // Connection error (ECONNREFUSED, network error, etc.)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error('[settings/tenant] Connection error:', errorMessage, { gatewayUrl: GATEWAY_URL })
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Cannot connect to backend at ${GATEWAY_URL}. Is the Node Backend running on port 4000?`,
          details: { 
            gatewayUrl: GATEWAY_URL,
            originalError: errorMessage,
            ...(process.env.NODE_ENV !== 'production' && {
              hint: 'Make sure the Node Backend is running: cd Backend && npm run dev'
            })
          }
        },
        { status: 503 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`[settings/tenant] Backend returned error ${response.status}:`, errorText)
      return NextResponse.json(
        { error: 'backend_error', message: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[settings/tenant] Proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeaders = buildForwardAuthHeaders(request)
    const body = await request.json()
    
    let response: Response
    try {
      response = await fetch(`${GATEWAY_URL}/settings/tenant`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch (fetchError) {
      // Connection error (ECONNREFUSED, network error, etc.)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error('[settings/tenant] Connection error:', errorMessage, { gatewayUrl: GATEWAY_URL })
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Cannot connect to backend at ${GATEWAY_URL}. Is the Node Backend running on port 4000?`,
          details: { 
            gatewayUrl: GATEWAY_URL,
            originalError: errorMessage,
            ...(process.env.NODE_ENV !== 'production' && {
              hint: 'Make sure the Node Backend is running: cd Backend && npm run dev'
            })
          }
        },
        { status: 503 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'backend_error', message: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[settings/tenant] Proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    )
  }
}

