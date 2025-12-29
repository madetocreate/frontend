import { NextRequest, NextResponse } from "next/server";
import { requireTenantIdFromRequest } from "@/lib/server/tenant";
import { getInternalApiKeyHeader } from "@/lib/server/tenant";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || process.env.PY_BACKEND_URL || "http://localhost:8000";

/**
 * SECURITY: Session Minting Route
 * 
 * This route:
 * - Authenticates user (server-side)
 * - Calls Python backend /realtime/session server-side
 * - Sets x-internal-api-key ONLY from process.env (never from client)
 * - Returns ONLY ephemeral client_secret to browser
 * 
 * The client_secret is safe to expose to browser (it's ephemeral and scoped to the session).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Authenticate user (server-side)
  const tenantResult = requireTenantIdFromRequest(req);
  if (tenantResult instanceof NextResponse) {
    return tenantResult; // Already 401 response
  }
  const tenantId = tenantResult;

  // Get internal API key from server-side ENV only
  const internalApiKeyHeaders = getInternalApiKeyHeader();
  if (!internalApiKeyHeaders["x-internal-api-key"]) {
    console.error("[Realtime Session] INTERNAL_API_KEY not configured");
    return NextResponse.json(
      { error: "configuration_error", message: "Internal API key not configured" },
      { status: 500 }
    );
  }

  // Call Python backend server-side
  try {
    const res = await fetch(`${PYTHON_BACKEND_URL}/realtime/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": internalApiKeyHeaders["x-internal-api-key"],
        "x-tenant-id": tenantId,
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      // Try fallback endpoint
      if (res.status === 404) {
        const fallbackRes = await fetch(`${PYTHON_BACKEND_URL}/api/v1/realtime/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-api-key": internalApiKeyHeaders["x-internal-api-key"],
            "x-tenant-id": tenantId,
          },
          body: JSON.stringify({}),
        });

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          return NextResponse.json(data, { status: 200 });
        }
      }

      const errorText = await res.text();
      console.error("[Realtime Session] Python backend error:", res.status, errorText);
      return NextResponse.json(
        { error: "session_creation_failed", detail: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Realtime Session] Error calling Python backend:", error);
    return NextResponse.json(
      { error: "internal_error", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}

