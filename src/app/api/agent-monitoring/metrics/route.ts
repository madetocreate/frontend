/**
 * API route for fetching agent monitoring metrics.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenant_id");
    const agentName = searchParams.get("agent_name");
    const hours = searchParams.get("hours") || "24";

    const params = new URLSearchParams();
    if (tenantId) params.append("tenant_id", tenantId);
    if (agentName) params.append("agent_name", agentName);
    params.append("hours", hours);

    const response = await fetch(
      `${BACKEND_URL}/agent-monitoring/metrics?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

