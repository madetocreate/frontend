/**
 * Core-7 Diagnostics API Route (Admin-Only)
 * 
 * SECURITY: Erfordert gültige Admin-Session (kein Browser-Key!).
 * tenant_id optional via Query oder x-tenant-id Header (nur wenn Admin-Session gültig).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminTenantOverride, buildServiceToServiceHeaders } from '@/lib/server/securityGuards'

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Admin-only route - allows tenant override via x-tenant-id or query param
    const tenantId = requireAdminTenantOverride(request)
    if (tenantId instanceof NextResponse) {
      return tenantId // 401/403 if not admin
    }
    
    // If query param tenant_id provided, use it (admin override)
    const queryTenantId = request.nextUrl.searchParams.get('tenant_id')
    const finalTenantId = queryTenantId || tenantId

    const internalApiKey = process.env.INTERNAL_API_KEY
    if (!internalApiKey) {
      return NextResponse.json(
        { error: 'INTERNAL_API_KEY not configured (server-only)' },
        { status: 500 }
      )
    }

    // Proxy zu Python Backend
    const url = new URL(`${AGENT_BACKEND_URL}/api/v1/internal/admin/diagnostics/core7`)
    if (finalTenantId) {
      url.searchParams.set('tenant_id', finalTenantId)
    }

    const headers = buildServiceToServiceHeaders({ tenantId: finalTenantId, includeInternalKey: true })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Core-7 diagnostics error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

