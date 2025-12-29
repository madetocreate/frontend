'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getGatewayUrl, buildForwardAuthHeaders } from '@/app/api/_utils/proxyAuth';

export async function POST(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl();
    const body = await request.json().catch(() => ({}));

    const backendRes = await fetch(`${gatewayUrl}/integrations/nango/connect/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildForwardAuthHeaders(request),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await backendRes.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    return NextResponse.json(json, { status: backendRes.status });
  } catch (error) {
    console.error('Nango connect session proxy failed', error);
    return NextResponse.json(
      { error: 'proxy_failed', message: 'Failed to reach backend for Nango connect session' },
      { status: 502 }
    );
  }
}

