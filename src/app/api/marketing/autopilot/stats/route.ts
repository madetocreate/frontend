import { NextRequest, NextResponse } from 'next/server';
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    const response = await fetch(
      `${BACKEND_URL}/api/v1/marketing/autopilot/stats`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching autopilot stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch autopilot stats' },
      { status: 500 }
    );
  }
}

