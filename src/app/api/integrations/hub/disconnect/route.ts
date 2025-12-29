/**
 * Integration Hub Disconnect API
 * 
 * Disconnects an integration.
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

    // For now, mock disconnect
    // Later: Call Nango disconnect
    const useMock = process.env.FEATURE_INTEGRATIONS_MOCK !== 'false'

    if (useMock) {
      return NextResponse.json({
        success: true,
        provider,
        message: 'Mock mode: Connection would be removed here',
      })
    }

    // TODO: Disconnect via Nango when ready

    return NextResponse.json({
      success: true,
      provider,
    })
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

