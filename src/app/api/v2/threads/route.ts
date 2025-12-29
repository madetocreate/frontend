import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

/**
 * Next.js Route Handler Proxy für v2 Threads Endpoints
 * 
 * Proxied zu Node Gateway (Port 4000) -> Python Backend (Port 8000)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gatewayUrl = getGatewayUrl()
    const authHeader = buildForwardAuthHeaders(request)
    
    const queryString = searchParams.toString()
    const url = `${gatewayUrl}/v2/threads${queryString ? `?${queryString}` : ''}`
    
    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      })
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Cannot connect to gateway at ${gatewayUrl}`,
          details: { gatewayUrl, originalError: errorMessage }
        },
        { status: 503 }
      )
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'backend_error', message: 'Backend service returned an error', details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // Transform backend response { items: [...] } to frontend format { threads: [...] }
    if (data.items && Array.isArray(data.items)) {
      const threads = data.items.map((item: any) => ({
        threadId: item.sessionId,
        title: item.title || 'Neuer Chat',
        lastMessageAt: item.lastMessageAt ? new Date(item.lastMessageAt).getTime() : undefined,
        preview: item.summary || '',
        archived: item.archived || false,
        pinned: !!item.pinnedAt,
        pinnedAt: item.pinnedAt ? new Date(item.pinnedAt).getTime() : undefined,
        createdAt: item.createdAt ? new Date(item.createdAt).getTime() : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : undefined,
        projectId: item.projectId,
      }))
      
      return NextResponse.json({
        threads,
        cursor: data.nextCursor,
        hasMore: !!data.nextCursor,
      })
    }
    
    // If already in correct format, return as-is
    return NextResponse.json(data)
  } catch (error) {
    console.error('v2 threads proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const gatewayUrl = getGatewayUrl()
    const authHeader = buildForwardAuthHeaders(request)
    
    let response: Response
    try {
      response = await fetch(`${gatewayUrl}/v2/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(body),
      })
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Cannot connect to gateway at ${gatewayUrl}`,
          details: { gatewayUrl, originalError: errorMessage }
        },
        { status: 503 }
      )
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'backend_error', message: 'Backend service returned an error', details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('v2 threads proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

