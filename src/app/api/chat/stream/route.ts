import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Route Handler Proxy für Chat Stream-Endpoint (SSE)
 * 
 * Proxied zu Node Gateway (Port 4000) -> Python Backend (Port 8000)
 * Same-origin für Frontend, keine CORS-Probleme
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Gateway URL (Node Backend auf Port 4000)
    const gatewayUrl = process.env.ORCHESTRATOR_API_URL || process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 'http://localhost:4000'
    
    // Dev Token Handling (nur in Development)
    const authHeader: Record<string, string> = {}
    if (process.env.NODE_ENV !== 'production') {
      const cookieToken = request.cookies.get('dev_token')?.value
      const headerToken = request.headers.get('authorization')
      
      if (cookieToken) {
        authHeader['authorization'] = cookieToken.startsWith('Bearer ') ? cookieToken : `Bearer ${cookieToken}`
      } else if (headerToken) {
        authHeader['authorization'] = headerToken
      }
    }
    
    let response: Response
    try {
      response = await fetch(`${gatewayUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'text/event-stream',
          ...authHeader,
        },
        body: JSON.stringify(body),
      })
    } catch (fetchError) {
      // Connection error (ECONNREFUSED, network error, etc.)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error('Chat stream proxy connection error:', errorMessage, { gatewayUrl })
      return new NextResponse(
        JSON.stringify({ 
          error: 'connection_error', 
          message: `Cannot connect to gateway at ${gatewayUrl}. Is the Node Gateway running on port 4000?`,
          details: { 
            gatewayUrl,
            originalError: errorMessage,
            hint: 'Make sure the Node Gateway is running: cd /Users/simple-gpt/Backend && npm run dev'
          }
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorData: unknown = { detail: errorText }
      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Use text as detail
      }
      
      return new NextResponse(
        JSON.stringify({ error: 'backend_error', message: 'Backend service returned an error', details: errorData }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    if (!response.body) {
      return new NextResponse(
        JSON.stringify({ error: 'stream_failed', message: 'No response body from backend' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Stream response (SSE) - pass through from Gateway
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Chat stream proxy error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

