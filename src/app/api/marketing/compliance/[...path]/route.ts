import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest, getInternalApiKeyHeader } from '@/lib/server/tenant'

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

// Helper function to proxy requests
async function proxyRequest(request: NextRequest, pathPrefix: string) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    // Extract the path after the prefix
    const url = new URL(request.url)
    const pathParts = url.pathname.split(pathPrefix)
    const relativePath = pathParts.length > 1 ? pathParts[1] : ''
    
    // Construct target URL
    const targetUrl = `${BACKEND_URL}${pathPrefix}${relativePath}${url.search}`

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getInternalApiKeyHeader(),
      'x-tenant-id': tenantId,
    }

    // Forward request
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    })

    // Forward response
    const data = await response.text()
    
    try {
      // Try to parse JSON if possible
      const json = JSON.parse(data)
      return NextResponse.json(json, { status: response.status })
    } catch {
      // Return text if not JSON
      return new NextResponse(data, { status: response.status })
    }
  } catch (error) {
    console.error(`Proxy error for ${pathPrefix}:`, error)
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, '/marketing/compliance')
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, '/marketing/compliance')
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, '/marketing/compliance')
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, '/marketing/compliance')
}

