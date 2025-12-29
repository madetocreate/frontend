/**
 * Integration Hub Connect API
 * 
 * Initiates OAuth connection flow for an integration.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest } from '@/lib/server/tenant'

export async function POST(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    const body = await request.json()
    const { provider } = body

    if (!provider) {
      return NextResponse.json(
        { error: 'provider is required' },
        { status: 400 }
      )
    }

    // For now, return mock connect URL
    // Later: Create Nango connect session
    const useMock = process.env.FEATURE_INTEGRATIONS_MOCK !== 'false'

    if (useMock) {
      return NextResponse.json({
        connect_url: `#mock-connect-${provider}`,
        session_id: `mock-session-${Date.now()}`,
        provider,
        message: 'Mock mode: Connection would be initiated here',
      })
    }

    // TODO: Create Nango connect session when ready
    // const { authedFetch } = await import('@/lib/api/authedFetch')
    // const response = await authedFetch('/api/integrations/nango/connect/session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ tenantId, allowedIntegrations: [provider] }),
    // })

    return NextResponse.json({
      connect_url: `#nango-connect-${provider}`,
      session_id: `session-${Date.now()}`,
      provider,
    })
  } catch (error) {
    console.error('Error initiating integration connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

