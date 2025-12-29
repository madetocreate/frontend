import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '../../_utils/proxyAuth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const { searchParams } = new URL(request.url)
    const gatewayUrl = getGatewayUrl()
    const authHeaders = buildForwardAuthHeaders(request)

    const response = await fetch(`${gatewayUrl}/team-channels/${sessionId}?${searchParams.toString()}`, {
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
    console.error('Team channel get proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const { searchParams } = new URL(request.url)
    const gatewayUrl = getGatewayUrl()
    const authHeaders = buildForwardAuthHeaders(request)

    const response = await fetch(`${gatewayUrl}/team-channels/${sessionId}?${searchParams.toString()}`, {
      method: 'DELETE',
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

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Team channel delete proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

