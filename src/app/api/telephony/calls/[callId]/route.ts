import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, BackendUrls } from '@/app/api/_utils/proxyAuth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ callId: string }> }
) {
  try {
    const backendUrl = BackendUrls.orchestrator();
    const { callId } = await context.params;
    const authHeaders = buildForwardAuthHeaders(request);
    
    const res = await fetch(`${backendUrl}/telephony/realtime/calls/${callId}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`[telephony/calls/${callId}] Backend error:`, res.status, errorText);
      return NextResponse.json({ error: 'Call not found' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[telephony/calls/[callId]] Error fetching call detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
