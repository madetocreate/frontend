/**
 * API route for fetching run details (proxy to Python backend).
 * 
 * SECURITY: Requires admin session and feature flag ENABLE_RUNS_INSPECTOR.
 * Validates runId format and limits event_limit to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/adminSession";

const BACKEND_URL = process.env.AGENT_BACKEND_URL || "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

// UUID pattern (simplified: alphanumeric, dashes, underscores)
const RUN_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const MAX_EVENT_LIMIT = 500;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
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
    const { runId } = await params;
    
    // Validate runId format (prevent injection/abuse)
    if (!runId || !RUN_ID_PATTERN.test(runId)) {
      return NextResponse.json(
        { error: "Invalid runId format" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let eventLimit = parseInt(searchParams.get("event_limit") || "100", 10);
    
    // Limit event_limit to prevent abuse
    if (isNaN(eventLimit) || eventLimit < 1) {
      eventLimit = 100;
    } else if (eventLimit > MAX_EVENT_LIMIT) {
      eventLimit = MAX_EVENT_LIMIT;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/internal/admin/runs/${runId}?event_limit=${eventLimit}`,
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
        { error: "Failed to fetch run details", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching run details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

