/**
 * API route for fetching runs (proxy to Python backend).
 * 
 * SECURITY: Requires admin session and feature flag ENABLE_RUNS_INSPECTOR.
 * In production, tenant_id query param is ignored.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/adminSession";
import { BackendUrls } from '@/app/api/_utils/proxyAuth';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function GET(request: NextRequest) {
  // Feature flag check - return 404 if not enabled (don't expose endpoint)
  if (process.env.ENABLE_RUNS_INSPECTOR !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Require admin session
  const adminGate = requireAdminSession(request);
  if (adminGate !== null) {
    return adminGate; // Returns 401 response
  }

  // INTERNAL_API_KEY validation
  if (!INTERNAL_API_KEY) {
    const errorMsg = "INTERNAL_API_KEY not configured";
    console.error(`[Runs API] ${errorMsg}`);
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    // In dev: warn but still allow (for local testing)
    console.warn(`[Runs API] WARNING: ${errorMsg} - proceeding in dev mode`);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "50";
    
    // tenant_id handling: ignore in production, allow in dev only with flag
    let tenantId: string | null = null;
    if (process.env.NODE_ENV !== "production") {
      if (process.env.ALLOW_RUNS_TENANT_QUERY_DEV === "true") {
        tenantId = searchParams.get("tenant_id");
      }
    }
    // In production: tenant_id is always ignored (security: don't trust query params)

    const params = new URLSearchParams();
    if (tenantId) params.append("tenant_id", tenantId);
    params.append("limit", limit);

    const response = await fetch(
      `${BackendUrls.agent()}/api/v1/internal/admin/runs?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": INTERNAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch runs", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching runs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

