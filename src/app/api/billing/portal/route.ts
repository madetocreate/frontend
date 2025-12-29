import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth';

/**
 * Next.js Route Handler Proxy für Billing Portal
 * 
 * Proxied zu Node Gateway (Port 4000) -> /v1/billing/portal
 */
export async function POST(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl();
    const authHeader = buildForwardAuthHeaders(request);
    
    const url = `${gatewayUrl}/v1/billing/portal`;
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
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
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

