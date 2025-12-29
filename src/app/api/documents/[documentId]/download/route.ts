import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest, getInternalApiKeyHeader } from "@/lib/server/tenant";

const BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(
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
      "x-tenant-id": tenantId,
      ...getInternalApiKeyHeader(),
    };

    const response = await fetch(
      `${BACKEND_URL}/documents/${resolvedParams.documentId}/download?tenant_id=${tenantId}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to download document" },
        { status: response.status }
      );
    }

    // Return the file
    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": response.headers.get("Content-Disposition") || `attachment; filename="document"`,
      },
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

