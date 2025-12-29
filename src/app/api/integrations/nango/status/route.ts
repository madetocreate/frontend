'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getGatewayUrl, buildForwardAuthHeaders } from '@/app/api/_utils/proxyAuth';

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl();
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider');

    const backendRes = await fetch(
      `${gatewayUrl}/integrations/nango/status${provider ? `?provider=${encodeURIComponent(provider)}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...buildForwardAuthHeaders(request),
        },
        // avoid caching
        cache: 'no-store',
      }
    );

    const text = await backendRes.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    return NextResponse.json(json, { status: backendRes.status });
  } catch (error) {
    console.error('Nango status proxy failed', error);
    return NextResponse.json(
      { error: 'proxy_failed', message: 'Failed to reach backend for Nango status' },
      { status: 502 }
    );
  }
}

