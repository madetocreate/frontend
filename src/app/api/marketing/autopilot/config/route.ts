import { NextRequest, NextResponse } from 'next/server'
import { getTenantIdFromRequest } from '@/lib/server/tenant'

const AGENT_BACKEND_URL =
  process.env.BACKEND_AGENTS_URL || process.env.AGENT_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request)
    if (!tenantId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const response = await fetch(
      `${AGENT_BACKEND_URL}/api/v1/marketing/autopilot/config`,
      {
        headers: {
          'x-tenant-id': tenantId,
          ...(INTERNAL_API_KEY ? { 'x-internal-api-key': INTERNAL_API_KEY } : {}),
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // If backend returns 404, the endpoint doesn't exist yet - return 501 Not Implemented
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'not_implemented', 
            message: 'Marketing Autopilot config endpoint not yet implemented in backend',
            details: { endpoint: '/api/v1/marketing/autopilot/config' }
          },
          { status: 501 }
        )
      }
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // If connection fails, assume endpoint doesn't exist
    if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))) {
      return NextResponse.json(
        { 
          error: 'not_implemented', 
          message: 'Marketing Autopilot config endpoint not yet implemented in backend',
          details: { endpoint: '/api/v1/marketing/autopilot/config' }
        },
        { status: 501 }
      )
    }
    console.error('Error fetching autopilot config:', error);
    return NextResponse.json(
      { 
        error: 'backend_error', 
        message: 'Failed to fetch autopilot config',
        details: error instanceof Error ? { message: error.message } : {}
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request)
    if (!tenantId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await request.json()

    const response = await fetch(
      `${AGENT_BACKEND_URL}/api/v1/marketing/autopilot/config`,
      {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          ...(INTERNAL_API_KEY ? { 'x-internal-api-key': INTERNAL_API_KEY } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      // If backend returns 404, the endpoint doesn't exist yet - return 501 Not Implemented
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'not_implemented', 
            message: 'Marketing Autopilot config endpoint not yet implemented in backend',
            details: { endpoint: '/api/v1/marketing/autopilot/config' }
          },
          { status: 501 }
        )
      }
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // If connection fails, assume endpoint doesn't exist
    if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))) {
      return NextResponse.json(
        { 
          error: 'not_implemented', 
          message: 'Marketing Autopilot config endpoint not yet implemented in backend',
          details: { endpoint: '/api/v1/marketing/autopilot/config' }
        },
        { status: 501 }
      )
    }
    console.error('Error updating autopilot config:', error);
    return NextResponse.json(
      { 
        error: 'backend_error', 
        message: 'Failed to update autopilot config',
        details: error instanceof Error ? { message: error.message } : {}
      },
      { status: 500 }
    );
  }
}

