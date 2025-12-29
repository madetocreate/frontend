import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest } from "@/lib/server/tenant";
import { BackendUrls } from '@/app/api/_utils/proxyAuth';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
        { status: 401 }
      );
    }

    const url = new URL(`${BackendUrls.agent()}/api/v1/reviews/inbox/counts`);
    url.searchParams.set("tenant_id", tenantId);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (INTERNAL_API_KEY) {
      headers["x-internal-api-key"] = INTERNAL_API_KEY;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Backend error", message: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reviews counts API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

