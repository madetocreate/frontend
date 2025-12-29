import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest } from '@/lib/server/tenant'

export async function GET(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    const gatewayUrl = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000'
    const token = request.headers.get('authorization')

    // Append tenantId to query if backend expects it via query (generic pattern)
    // Though it should extract from Auth header. Passing it just in case.
    const response = await fetch(`${gatewayUrl}/integrations/imap/status?tenantId=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(errorData, { status: response.status })
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status })
      }
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('IMAP status proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
