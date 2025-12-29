import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Route Handler Proxy für Chat-Endpoint
 * 
 * Proxied zu Node Gateway (Port 4000) -> Python Backend (Port 8000)
 * Same-origin für Frontend, keine CORS-Probleme
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Gateway URL (Node Backend auf Port 4000)
    const gatewayUrl = process.env.ORCHESTRATOR_API_URL || process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 'http://localhost:4000'
    
    // Authorization Header Handling
    const authHeader: Record<string, string> = {}
    const headerToken = request.headers.get('authorization')
    
    // Immer Authorization Header weiterleiten (auch in Production)
    if (headerToken) {
      authHeader['authorization'] = headerToken
    }
    
    // Dev Token Cookie Support (nur in Development, kann Header überschreiben)
    if (process.env.NODE_ENV !== 'production') {
      const cookieToken = request.cookies.get('dev_token')?.value
      if (cookieToken) {
        authHeader['authorization'] = cookieToken.startsWith('Bearer ') ? cookieToken : `Bearer ${cookieToken}`
      }
    }
    
    let response: Response
    try {
      response = await fetch(`${gatewayUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(body),
      })
    } catch (fetchError) {
      // Connection error (ECONNREFUSED, network error, etc.)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error('Chat proxy connection error:', errorMessage, { gatewayUrl })
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Cannot connect to gateway at ${gatewayUrl}. Is the Node Gateway running on port 4000?`,
          details: { 
            gatewayUrl,
            originalError: errorMessage,
            ...(process.env.NODE_ENV !== 'production' && {
              hint: 'Make sure the Node Gateway is running: npm run dev'
            })
          }
        },
        { status: 503 }
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
      
      return NextResponse.json(
        { error: 'backend_error', message: 'Backend service returned an error', details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

