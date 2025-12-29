import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest, getInternalApiKeyHeader } from "@/lib/server/tenant";

const BACKEND_URL = process.env.AGENT_BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    // Security: Tenant-ID comes from auth context (JWT), not query
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
      ...getInternalApiKeyHeader(),
    };

    const response = await fetch(
      `${BACKEND_URL}/approval-flows/queue?tenant_id=${tenantId}&status=${status}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to fetch approval queue" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching approval queue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

