import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Route Handler Proxy für Dev Token Endpoint
 * 
 * Nur in Development verfügbar, proxied zu Node Gateway
 */
export async function POST(request: NextRequest) {
  // Only allow in development (check string value, not type)
  const nodeEnv = process.env.NODE_ENV || 'development'
  if (nodeEnv === 'production') {
    return NextResponse.json(
      { error: 'not_allowed', message: 'Dev endpoint not available in production' },
      { status: 403 }
    )
  }
  
  try {
    const body = await request.json()
    
    // Gateway URL (Node Backend auf Port 4000)
    const gatewayUrl = process.env.ORCHESTRATOR_API_URL || process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 'http://localhost:4000'
    
    const response = await fetch(`${gatewayUrl}/auth/dev/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'token_generation_failed', message: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // Optional: Set Cookie für Dev Token (nur in Development)
    const responseWithCookie = NextResponse.json(data)
    if (data.token) {
      responseWithCookie.cookies.set('dev_token', data.token, {
        httpOnly: false, // Client-seitig lesbar für Authorization Header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.expiresIn || 86400,
      })
    }
    
    return responseWithCookie
  } catch (error) {
    console.error('Dev token proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

