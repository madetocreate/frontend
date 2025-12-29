import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth';

/**
 * Next.js Route Handler Proxy für Billing Checkout Session
 * 
 * Proxied zu Node Gateway (Port 4000) -> /v1/billing/checkout-session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gatewayUrl = getGatewayUrl();
    const authHeader = buildForwardAuthHeaders(request);
    
    const url = `${gatewayUrl}/v1/billing/checkout-session`;
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(body),
      });
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error';
      return NextResponse.json(
        { 
          error: 'connection_error', 
          message: `Cannot connect to gateway at ${gatewayUrl}`,
          details: { gatewayUrl, originalError: errorMessage }
        },
        { status: 503 }
      );
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: 'backend_error', message: 'Backend service returned an error', details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Billing checkout session error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

