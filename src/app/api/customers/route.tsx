import { NextRequest, NextResponse } from 'next/server'
import { getTenantIdFromRequest } from '@/lib/server/tenant'
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth'
import { getUserFriendlyErrorMessage } from '../../../lib/errorHandler'

type CustomerData = {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  status: string
  revenue?: number
  lastContact?: string
  tags?: string[]
}

// Backend response type
interface BackendCustomer {
  id: string
  name?: string
  company?: string
  email?: string
  phone?: string
  lifecycle_stage?: string
  tags?: string[]
  created_at?: string
  last_interaction_at?: string
  status?: string
  revenue?: number
  lastContact?: string
}

export async function GET(request: NextRequest) {
  const tenantId = getTenantIdFromRequest(request)
  if (!tenantId) {
    return NextResponse.json({ error: 'unauthorized', message: 'Tenant ID required' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  try {
    // Fetch from backend (tenantId as query param - backend expects it)
    const gatewayUrl = getGatewayUrl()
    const response = await fetch(
      `${gatewayUrl}/customers?tenantId=${tenantId}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...buildForwardAuthHeaders(request),
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Failed to fetch customers:', errorText)
      return NextResponse.json(
        { 
          error: 'api_error',
          message: getUserFriendlyErrorMessage({
            error: 'api_error',
            message: errorText,
            statusCode: response.status,
          })
        },
        { status: 502 }
      )
    }

    const data = await response.json()
    
    type BackendCustomer = {
      id: string
      name: string
      company?: string
      email?: string
      phone?: string
      status?: string
      revenue?: number
      lastContact?: string
      tags?: string[]
    }

    // Transform Backend Customers to UI Customer Model
    const customers = (data.customers || []).map((c: BackendCustomer) => {
      const displayName = c.name || c.company || 'Unbekannt';
      const companyName = c.company || '';
      
      return {
        id: c.id,
        // UI expectations mapping
        displayName,
        companyName,
        type: (companyName && displayName === companyName) ? 'company' : 'contact',
        email: c.email || '',
        phone: c.phone || '',
        tags: (c.tags || []).filter((tag: string) => ['lead', 'stammkunde', 'vip'].includes(tag.toLowerCase())),
        lastActivityAt: c.lastContact || new Date().toISOString(),
        lastActivitySummary: c.lastContact ? 'Letzter Kontakt' : 'Neu',
        status: c.status === 'active' ? 'Aktiv' : c.status === 'pending' ? 'Pending' : c.status === 'churn' ? 'Churn' : 'Aktiv',
        revenue: c.revenue || 0,
        counters: {
          openItems: 0,
          tasks: 0
        }
      };
    });

    return NextResponse.json(
      { 
        customers,
        customersTotal: data.total ?? customers.length,
        limit: data.limit ?? limit,
        offset: data.offset ?? 0
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'proxy_failed', message: 'Failed to connect to backend' },
      { status: 502 }
    )
  }
}

