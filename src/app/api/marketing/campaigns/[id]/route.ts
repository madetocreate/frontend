import { NextRequest, NextResponse } from 'next/server';
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const { id } = await params;
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    const response = await fetch(
      `${BACKEND_URL}/api/v1/campaigns/${id}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const { id } = await params;
    const body = await request.json();
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    const response = await fetch(
      `${BACKEND_URL}/api/v1/campaigns/${id}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const { id } = await params;
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    const response = await fetch(
      `${BACKEND_URL}/api/v1/campaigns/${id}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
