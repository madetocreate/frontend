/**
 * API route for real estate calendar viewings.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenant_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!tenantId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "tenant_id, start_date, and end_date are required" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.append("tenant_id", tenantId);
    params.append("start_date", startDate);
    params.append("end_date", endDate);

    const response = await fetch(
      `${BACKEND_URL}/real-estate/calendar/viewings?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch calendar viewings", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching calendar viewings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


