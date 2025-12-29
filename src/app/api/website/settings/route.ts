import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl()
    const response = await fetch(`${gatewayUrl}/website/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
    })
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorData: unknown = { detail: errorText }
      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Use text as detail
      }
      return NextResponse.json(
        { 
          error: { 
            code: 'backend_error', 
            message: 'Backend service returned an error', 
            details: errorData 
          } 
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Website settings GET error:', error)
    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: 'Internal server error', 
          details: error instanceof Error ? { message: error.message } : {}
        } 
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const gatewayUrl = getGatewayUrl()
    const response = await fetch(`${gatewayUrl}/website/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorData: unknown = { detail: errorText }
      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Use text as detail
      }
      return NextResponse.json(
        { 
          error: { 
            code: 'backend_error', 
            message: 'Backend service returned an error', 
            details: errorData 
          } 
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Website settings PUT error:', error)
    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: 'Internal server error', 
          details: error instanceof Error ? { message: error.message } : {}
        } 
      }, 
      { status: 500 }
    )
  }
}

