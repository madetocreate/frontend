import { NextRequest, NextResponse } from "next/server";
import { getInternalApiKeyHeader } from "@/lib/server/tenant";
import { getGatewayUrl, buildForwardAuthHeaders } from "@/app/api/_utils/proxyAuth";

/**
 * SECURITY: Realtime Tools Proxy
 * 
 * This route:
 * - Does NOT forward x-internal-api-key from client request
 * - Sets x-internal-api-key ONLY from server-side ENV (process.env.INTERNAL_API_KEY)
 * - Prevents client from injecting internal API key
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const BACKEND_URL = getGatewayUrl();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // SECURITY: Enforce user authentication & extract tenant from JWT
  const { requireUserTenant } = await import('@/lib/server/securityGuards');
  const tenantId = requireUserTenant(req);
  if (tenantId instanceof NextResponse) {
    return tenantId; // 401 if no auth
  }

  const parsedBody = (body && typeof body === "object" ? (body as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  const tool = parsedBody.tool;
  const args = parsedBody.args;
  const threadId = parsedBody.threadId;
  // SECURITY: tenantId comes from JWT (requireUserTenant above), NOT from request body
  // We explicitly do NOT read tenantId from parsedBody to prevent client-controlled tenant injection
  if (!tool || typeof tool !== "string") {
    return NextResponse.json({ error: "Missing tool name" }, { status: 400 });
  }

  const target = `${BACKEND_URL}/realtime/tools/${encodeURIComponent(tool)}`;
  
  // SECURITY: Build headers server-side only
  // Never forward x-internal-api-key from client request
  const headers: Record<string, string> = { 
    "content-type": "application/json",
    ...buildForwardAuthHeaders(req),
  };
  
  // Set internal API key from server-side ENV only
  const internalApiKeyHeaders = getInternalApiKeyHeader();
  if (internalApiKeyHeaders["x-internal-api-key"]) {
    headers["x-internal-api-key"] = internalApiKeyHeaders["x-internal-api-key"];
  }
  
  try {
    const res = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify({
        threadId,
        tenantId,
        ...(args && typeof args === "object" ? (args as Record<string, unknown>) : {}),
      }),
    });
    const txt = await res.text();
    let json: unknown = null;
    if (txt) {
      try {
        json = JSON.parse(txt);
      } catch {
        json = { raw: txt };
      }
    }
    return NextResponse.json(json ?? {}, { status: res.status });
  } catch (error) {
    console.error("realtime tools proxy error", error);
    return NextResponse.json(
      { error: "tools proxy failed" },
      { status: 502 }
    );
  }
}

