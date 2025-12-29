import { NextRequest, NextResponse } from 'next/server';
import { requireUserTenant, buildServiceToServiceHeaders } from '@/lib/server/securityGuards';
import { BackendUrls } from '@/app/api/_utils/proxyAuth';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const { searchParams } = new URL(request.url);
    
    const params = new URLSearchParams();
    if (searchParams.get('status')) params.set('status', searchParams.get('status')!);
    if (searchParams.get('channel')) params.set('channel', searchParams.get('channel')!);
    if (searchParams.get('campaign_id')) params.set('campaign_id', searchParams.get('campaign_id')!);
    if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!);
    if (searchParams.get('offset')) params.set('offset', searchParams.get('offset')!);

    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    const response = await fetch(
      `${BackendUrls.agent()}/api/v1/marketing/content?${params.toString()}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request);
    if (tenantId instanceof NextResponse) {
      return tenantId; // 401 if no auth
    }
    
    const body = await request.json();
    const headers = buildServiceToServiceHeaders({ tenantId, includeInternalKey: true });

    const response = await fetch(
      `${BackendUrls.agent()}/api/v1/marketing/content`,
      {
        method: 'POST',
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
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

