import { NextRequest, NextResponse } from 'next/server'
import { getTenantIdFromRequest } from '@/lib/server/tenant'
import { buildForwardAuthHeaders, BackendUrls } from '@/app/api/_utils/proxyAuth'

export async function GET(request: NextRequest) {
  const tenantId = getTenantIdFromRequest(request)
  if (!tenantId) {
    return NextResponse.json({ error: 'missing_tenant' }, { status: 401 })
  }

  try {
    const response = await fetch(`${BackendUrls.orchestrator()}/entitlements/check`, {
      method: 'GET',
      headers: {
        'x-tenant-id': tenantId,
        ...buildForwardAuthHeaders(request),
      },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'error')
      return NextResponse.json({ error: 'entitlements_failed', message: text }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[entitlements] proxy failed', error)
    return NextResponse.json({ error: 'entitlements_proxy_failed' }, { status: 502 })
  }
}

