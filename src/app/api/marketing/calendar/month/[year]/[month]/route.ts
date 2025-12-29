import { NextRequest, NextResponse } from 'next/server';
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; month: string }> }
) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const { year, month } = await params;
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    // Python Backend (FastAPI) typically expects tenant_id as a query parameter
    const url = new URL(`${BACKEND_URL}/api/v1/marketing/calendar/month/${year}/${month}`);
    url.searchParams.append('tenant_id', tenantId);

    const response = await fetch(
      url.toString(),
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}

