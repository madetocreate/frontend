import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, BackendUrls } from '@/app/api/_utils/proxyAuth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '5';
    
    const backendUrl = BackendUrls.orchestrator();
    const authHeaders = buildForwardAuthHeaders(request);
    
    const res = await fetch(`${backendUrl}/telephony/realtime/calls?limit=${limit}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('[telephony/calls] Backend error:', res.status, errorText);
      // Return empty array as fallback
      return NextResponse.json({ calls: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[telephony/calls] Error fetching calls:', error);
    return NextResponse.json({ calls: [] }, { status: 500 });
  }
}
