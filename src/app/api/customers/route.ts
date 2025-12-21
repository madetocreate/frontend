import { NextRequest, NextResponse } from 'next/server'
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

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_API_URL
const ORCHESTRATOR_TENANT_ID = process.env.ORCHESTRATOR_TENANT_ID
// const ORCHESTRATOR_API_TOKEN = process.env.ORCHESTRATOR_API_TOKEN // Not used yet

// function normalizeBaseUrl(url: string): string {
//   return url.endsWith('/') ? url.slice(0, -1) : url
// } // Not used yet

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!ORCHESTRATOR_URL || !ORCHESTRATOR_TENANT_ID) {
    // Return empty array if env vars not set
    return NextResponse.json<{ customers: CustomerData[] }>(
      { customers: [] },
      { status: 200 }
    )
  }

  try {
    // Fetch from backend
    const backendUrl = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000'
    const token = process.env.ORCHESTRATOR_API_TOKEN
    
    const response = await fetch(
      `${backendUrl}/customers?tenantId=${ORCHESTRATOR_TENANT_ID}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Failed to fetch customers:', errorText)
      // Return empty array with error info for graceful degradation
      return NextResponse.json<{ customers: CustomerData[]; error?: string }>(
        { 
          customers: [],
          error: getUserFriendlyErrorMessage({
            error: 'api_error',
            message: errorText,
            statusCode: response.status,
          })
        },
        { status: 200 }
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

    const customers: CustomerData[] = (data.customers || []).map((c: BackendCustomer) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      status: c.status === 'active' ? 'Aktiv' : c.status === 'pending' ? 'Pending' : c.status === 'churn' ? 'Churn' : 'Aktiv',
      revenue: c.revenue,
      lastContact: c.lastContact,
      tags: c.tags,
    }))

    return NextResponse.json<{ customers: CustomerData[] }>(
      { customers },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json<{ customers: CustomerData[] }>(
      { customers: [] },
      { status: 200 }
    )
  }
}

