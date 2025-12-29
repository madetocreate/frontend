import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl, buildForwardAuthHeaders } from '@/app/api/_utils/proxyAuth';

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = getGatewayUrl();
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get("provider");
    
    const queryParams = new URLSearchParams();
    if (provider) queryParams.set("provider", provider);
    const queryString = queryParams.toString();

    const res = await fetch(`${gatewayUrl}/integrations/qa/overview${queryString ? `?${queryString}` : ''}`, {
      headers: {
        "Content-Type": "application/json",
        ...buildForwardAuthHeaders(request),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

