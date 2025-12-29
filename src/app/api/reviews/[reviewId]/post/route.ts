import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest } from "@/lib/server/tenant";

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL ?? "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
        { status: 401 }
      );
    }

    const { reviewId } = await params;
    const body = await request.json();
    const replyText = body.replyText || undefined;

    const url = `${AGENT_BACKEND_URL}/api/v1/reviews/${reviewId}/post`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (INTERNAL_API_KEY) {
      headers["x-internal-api-key"] = INTERNAL_API_KEY;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tenantId,
        replyText,
      }),
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
    console.error("Review post API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

