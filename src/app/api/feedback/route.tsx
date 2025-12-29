import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest, getInternalApiKeyHeader } from "@/lib/server/tenant";
import { BackendUrls } from '@/app/api/_utils/proxyAuth';

export async function POST(request: NextRequest) {
  try {
    // Security: Tenant-ID comes from auth context (JWT), not body
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
        { status: 401 }
      );
    }

    const body = await request.json();
    // Ensure tenant_id in body matches auth context (defense-in-depth)
    const bodyWithTenant = { ...body, tenant_id: tenantId };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
      ...getInternalApiKeyHeader(),
    };

    const response = await fetch(`${BackendUrls.agent()}/feedback`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyWithTenant),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to submit feedback" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const agentName = searchParams.get("agent_name");
    const sessionId = searchParams.get("session_id");
    const feedbackType = searchParams.get("feedback_type");
    const limit = searchParams.get("limit") || "100";

    const params = new URLSearchParams({
      tenant_id: tenantId,
      limit,
    });
    if (agentName) params.append("agent_name", agentName);
    if (sessionId) params.append("session_id", sessionId);
    if (feedbackType) params.append("feedback_type", feedbackType);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
      ...getInternalApiKeyHeader(),
    };

    const response = await fetch(`${BackendUrls.agent()}/feedback?${params.toString()}`, { headers });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to fetch feedback" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

