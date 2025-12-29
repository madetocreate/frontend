import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, getGatewayUrl } from '@/app/api/_utils/proxyAuth';

/**
 * Next.js Route Handler Proxy für Lead Detail Endpoints
 * 
 * GET /api/leads/:id - Get lead details
 * PATCH /api/leads/:id - Update lead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gatewayUrl = getGatewayUrl();
    const authHeader = buildForwardAuthHeaders(request);
    
    const url = `${gatewayUrl}/v1/leads/${id}`;
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
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
    console.error('Lead GET error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const gatewayUrl = getGatewayUrl();
    const authHeader = buildForwardAuthHeaders(request);
    
    const url = `${gatewayUrl}/v1/leads/${id}`;
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'PATCH',
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
    console.error('Lead PATCH error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

