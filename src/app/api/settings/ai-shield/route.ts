import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

/**
 * Next.js Route Handler Proxy für AI Shield Settings Endpoints
 * 
 * Proxied zu Node Backend (Port 4000) -> /settings/ai-shield
 */
export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    const authHeader = buildForwardAuthHeaders(request)
    
    const url = `${gatewayUrl}/settings/ai-shield`
    
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
    console.error('AI Shield settings GET proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const gatewayUrl = getGatewayUrl()
    const authHeader = buildForwardAuthHeaders(request)
    
    const url = `${gatewayUrl}/settings/ai-shield`
    
    let response: Response
    try {
      response = await fetch(url, {
        method: 'PUT',
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
    console.error('AI Shield settings PUT proxy error:', error)
    return NextResponse.json(
      { error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

