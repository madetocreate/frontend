import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest, requireTenantIdFromRequest, getInternalApiKeyHeader } from "@/lib/server/tenant";
import { BackendUrls } from "@/app/api/_utils/proxyAuth";

export async function POST(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request);
    if (tenantRes instanceof NextResponse) return tenantRes;
    const tenantId = tenantRes;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const metadata = formData.get("metadata") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }

    // Create form data for backend - using upload-batch pipeline
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("tenant_id", tenantId);
    if (metadata) {
      backendFormData.append("metadata", metadata);
    }

    const response = await fetch(`${BackendUrls.agent()}/documents/upload-batch`, {
      method: "POST",
      headers: {
        ...getInternalApiKeyHeader(),
        'x-tenant-id': tenantId,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to upload");
      return NextResponse.json(
        { error: errorText || "Failed to upload document" },
        { status: 502 }
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
    const tenantRes = requireTenantIdFromRequest(request);
    if (tenantRes instanceof NextResponse) return tenantRes;
    const tenantId = tenantRes;

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const includeDemo = searchParams.get("include_demo") === "true";
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";

    const params = new URLSearchParams({
      tenant_id: tenantId,
      limit,
      offset,
    });
    if (category) params.append("category", category);
    if (includeDemo) params.append("include_demo", "true");

    const response = await fetch(`${BackendUrls.agent()}/documents?${params.toString()}`, {
      headers: {
        ...getInternalApiKeyHeader(),
        'x-tenant-id': tenantId,
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to fetch");
      return NextResponse.json(
        { error: errorText || "Failed to fetch documents" },
        { status: 502 }
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

