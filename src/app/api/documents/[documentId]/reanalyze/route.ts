import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest, getInternalApiKeyHeader } from "@/lib/server/tenant";

const BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    // Security: Tenant-ID comes from auth context (JWT), not query
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "missing_tenant", message: "Tenant ID is required but not available. Please login or select workspace." },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
      ...getInternalApiKeyHeader(),
    };

    const response = await fetch(
      `${BACKEND_URL}/documents/${resolvedParams.documentId}/reanalyze?tenant_id=${tenantId}`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to reanalyze document" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reanalyzing document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

