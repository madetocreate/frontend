import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.AGENT_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tenantId = formData.get("tenant_id") as string;
    const metadata = formData.get("metadata") as string | null;

    if (!file || !tenantId) {
      return NextResponse.json(
        { error: "file and tenant_id are required" },
        { status: 400 }
      );
    }

    // Create form data for backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("tenant_id", tenantId);
    if (metadata) {
      backendFormData.append("metadata", metadata);
    }

    const response = await fetch(`${BACKEND_URL}/documents/upload`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to upload document" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenant_id");
    const category = searchParams.get("category");
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id is required" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      tenant_id: tenantId,
      limit,
      offset,
    });
    if (category) params.append("category", category);

    const response = await fetch(`${BACKEND_URL}/documents?${params.toString()}`);

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to fetch documents" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

