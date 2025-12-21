import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenant_id");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/documents/${resolvedParams.documentId}/reanalyze?tenant_id=${tenantId}`,
      {
        method: "POST",
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

