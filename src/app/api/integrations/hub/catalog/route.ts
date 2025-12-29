/**
 * Integration Hub Catalog API
 * 
 * Returns the full catalog of available integrations.
 * Later: Can be enriched with Nango provider data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest } from '@/lib/server/tenant'
import { INTEGRATIONS_CATALOG } from '@/lib/integrations/catalog'

export async function GET(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes

    // For now, return mock catalog
    // Later: Fetch from Nango or enrich with Nango provider data
    const useMock = process.env.FEATURE_INTEGRATIONS_MOCK !== 'false'

    if (useMock) {
      return NextResponse.json({
        integrations: INTEGRATIONS_CATALOG,
        source: 'mock',
      })
    }

    // TODO: Fetch from Nango when ready
    return NextResponse.json({
      integrations: INTEGRATIONS_CATALOG,
      source: 'nango',
    })
  } catch (error) {
    console.error('Error fetching integration catalog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

