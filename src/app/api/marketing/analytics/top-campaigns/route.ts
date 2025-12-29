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
    
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'open_rate';
    const limit = searchParams.get('limit') || '10';
    const days = searchParams.get('days') || '30';
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    const response = await fetch(
      `${BACKEND_URL}/api/v1/marketing/analytics/top-campaigns?metric=${metric}&limit=${limit}&days=${days}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top campaigns' },
      { status: 500 }
    );
  }
}

