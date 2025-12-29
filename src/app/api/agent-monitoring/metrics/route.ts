/**
 * API route for fetching agent monitoring metrics.
 */

import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest, getInternalApiKeyHeader } from "@/lib/server/tenant";
import { BackendUrls } from '@/app/api/_utils/proxyAuth';

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
    const hours = searchParams.get("hours") || "24";

    const params = new URLSearchParams();
    params.append("tenant_id", tenantId);
    if (agentName) params.append("agent_name", agentName);
    params.append("hours", hours);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
      ...getInternalApiKeyHeader(),
    };

    const response = await fetch(
      `${BackendUrls.agent()}/agent-monitoring/metrics?${params.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch metrics", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching agent metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

