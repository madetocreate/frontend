import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, BackendUrls } from '@/app/api/_utils/proxyAuth';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = BackendUrls.orchestrator();
    const authHeaders = buildForwardAuthHeaders(request);
    
    const res = await fetch(`${backendUrl}/integrations/telegram/chats`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('[telegram/chats] Backend error:', res.status, errorText);
      // Return empty array as fallback
      return NextResponse.json({ chats: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[telegram/chats] Error fetching chats:', error);
    return NextResponse.json({ chats: [] }, { status: 500 });
  }
}
