/**
 * Integration Hub Connections API
 * 
 * Returns the user's active integration connections.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest } from '@/lib/server/tenant'

export async function GET(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    // For now, return mock connections from user settings or in-memory
    // Later: Fetch from Nango
    const useMock = process.env.FEATURE_INTEGRATIONS_MOCK !== 'false'

    if (useMock) {
      // Mock: Return empty or sample connections
      // In a real implementation, this would be stored in user settings or a separate table
      return NextResponse.json({
        connections: [],
        source: 'mock',
      })
    }

    // TODO: Fetch from Nango when ready
    // const { authedFetch } = await import('@/lib/api/authedFetch')
    // const response = await authedFetch('/api/integrations/nango/status')
    // ...

    return NextResponse.json({
      connections: [],
      source: 'nango',
    })
  } catch (error) {
    console.error('Error fetching integration connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

