import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/server/adminSession';
import { buildForwardAuthHeaders } from '@/app/api/_utils/proxyAuth';

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:4051';
const ADMIN_KEY = process.env.CONTROL_PLANE_ADMIN_KEY || process.env.AI_SHIELD_ADMIN_KEY || '';

function isAllowed(method: string, pathParts: string[]): boolean {
  const p = pathParts.join("/");
  // Minimal allowlist (expand consciously):
  if (method === "GET" && p === "health") return true;
  if (method === "GET" && p === "v1/mcp/registry") return true;
  if (method === "GET" && (p === "v1/integrations" || p === "v1/integrations/")) return true;
  // integrations connect/disconnect
  if (method === "POST" && /^v1\/integrations\/[^/]+\/connect$/.test(p)) return true;
  if (method === "POST" && /^v1\/integrations\/[^/]+\/disconnect$/.test(p)) return true;
  return false;
}

async function proxy(request: NextRequest, method: "GET" | "POST", pathParts: string[]) {
  const path = pathParts.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${CONTROL_PLANE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  if (!ADMIN_KEY) {
    return NextResponse.json({ error: "Server admin key not configured" }, { status: 500 });
  }

  // SECURITY: This is an admin proxy route - use requireAdminTenantOverride
  const { requireAdminTenantOverride } = await import('@/lib/server/securityGuards');
  const tenantId = requireAdminTenantOverride(request);
  if (tenantId instanceof NextResponse) {
    return tenantId; // 401/403 if not admin
  }

  const headers: Record<string, string> = {
    'x-ai-shield-admin-key': ADMIN_KEY,
    'Content-Type': 'application/json',
    ...buildForwardAuthHeaders(request),
  };

  // Set tenant from admin override (already verified)
  headers["x-tenant-id"] = tenantId;
  const correlationId = request.headers.get('x-correlation-id') || request.headers.get('x-request-id');
  if (correlationId) {
    headers['x-correlation-id'] = correlationId;
    headers['x-request-id'] = correlationId;
  }

  let body: unknown = undefined;
  if (method === "POST") {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    ...(method === "POST" ? { body: JSON.stringify(body ?? {}) } : {}),
  });

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
  const text = await res.text();
  return new NextResponse(text, { status: res.status });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const pathParts = (await params).path;
  if (!isAllowed("GET", pathParts)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  
  if (pathParts.join("/") !== "health") {
    const adminRes = requireAdminSession(request);
    if (adminRes) return adminRes;
  }

  try {
    return await proxy(request, "GET", pathParts);
  } catch (error) {
    console.error('Shield API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Control Plane' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const pathParts = (await params).path;
  if (!isAllowed("POST", pathParts)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  
  const adminRes = requireAdminSession(request);
  if (adminRes) return adminRes;

  try {
    return await proxy(request, "POST", pathParts);
  } catch (error) {
    console.error('Shield API Error:', error);
    return NextResponse.json({ error: 'Failed to post to Control Plane' }, { status: 500 });
  }
}
