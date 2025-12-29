import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, BackendUrls } from '@/app/api/_utils/proxyAuth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '5';
    
    const backendUrl = BackendUrls.orchestrator();
    const authHeaders = buildForwardAuthHeaders(request);
    
    const res = await fetch(`${backendUrl}/website/conversations?limit=${limit}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('[website/conversations] Backend error:', res.status, errorText);
      return NextResponse.json({ items: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[website/conversations] Error fetching conversations:', error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
