import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromRequest } from "@/lib/server/tenant";
import { BackendUrls } from "@/app/api/_utils/proxyAuth";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { 
          error: { 
            code: "missing_tenant", 
            message: "Tenant ID is required but not available. Please login or select workspace.",
            details: {}
          } 
        },
        { status: 401 }
      );
    }

    const url = new URL(`${BackendUrls.agent()}/api/v1/reviews/settings`);
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
      const errorText = await response.text().catch(() => 'Unknown error');
      let errorData: unknown = { detail: errorText };
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // Use text as detail
      }
      return NextResponse.json(
        { 
          error: { 
            code: 'backend_error', 
            message: 'Backend service returned an error', 
            details: errorData 
          } 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reviews settings GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { 
          error: { 
            code: "missing_tenant", 
            message: "Tenant ID is required but not available. Please login or select workspace.",
            details: {}
          } 
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const url = `${BackendUrls.agent()}/api/v1/reviews/settings`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (INTERNAL_API_KEY) {
      headers["x-internal-api-key"] = INTERNAL_API_KEY;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        tenantId,
        automationMode: body.automationMode,
        draftOnIngest: body.draftOnIngest,
        brandVoice: body.brandVoice,
        signature: body.signature,
        minRatingForAutopost: body.minRatingForAutopost,
        enableNegativeReviewAlerts: body.enableNegativeReviewAlerts,
        alertEmail: body.alertEmail,
        enableReviewRequests: body.enableReviewRequests,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      let errorData: unknown = { detail: errorText };
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // Use text as detail
      }
      return NextResponse.json(
        { 
          error: { 
            code: 'backend_error', 
            message: 'Backend service returned an error', 
            details: errorData 
          } 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reviews settings PUT API error:", error);
    return NextResponse.json(
      { 
        error: { 
          code: "internal_error", 
          message: "Internal server error", 
          details: error instanceof Error ? { message: error.message } : {}
        } 
      },
      { status: 500 }
    );
  }
}

