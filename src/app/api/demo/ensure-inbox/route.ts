import { NextResponse, type NextRequest } from 'next/server';
import { requireTenantIdFromRequest, getInternalApiKeyHeader } from '@/lib/server/tenant';

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000';
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function POST(request: NextRequest) {
  const tenantRes = requireTenantIdFromRequest(request);
  if (tenantRes instanceof NextResponse) return tenantRes;
  const tenantId = tenantRes;

  try {
    // Get auth token from request to forward to backend
    const authHeader = request.headers.get('authorization');
    
    // Build headers for backend request
    const backendHeaders: Record<string, string> = {
      'content-type': 'application/json',
      ...getInternalApiKeyHeader(),
    };
    
    // Forward auth token if present
    if (authHeader) {
      backendHeaders['authorization'] = authHeader;
    }

    // Call Python Backend demo/ensure-inbox endpoint
    // Backend expects: { tenant_id, user_id? } (snake_case)
    const response = await fetch(`${normalizeBaseUrl(PYTHON_BACKEND_URL)}/demo/ensure-inbox`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({
        tenant_id: tenantId, // Map to snake_case for Python backend
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in demo/ensure-inbox proxy:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 },
    );
  }
}
