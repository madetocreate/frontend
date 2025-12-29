import { NextRequest, NextResponse } from "next/server";
import { getGatewayUrl, buildForwardAuthHeaders } from '@/app/api/_utils/proxyAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; connectionId: string }> }
) {
  try {
    const gatewayUrl = getGatewayUrl();
    const { provider, connectionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const providerParam = searchParams.get("provider");
    
    const queryParams = new URLSearchParams();
    if (providerParam) queryParams.set("provider", providerParam);
    const queryString = queryParams.toString();

    const res = await fetch(
      `${gatewayUrl}/integrations/${provider}/${connectionId}/mappings${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...buildForwardAuthHeaders(request),
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; connectionId: string }> }
) {
  try {
    const gatewayUrl = getGatewayUrl();
    const { provider, connectionId } = await params;
    const body = await request.json();

    const res = await fetch(
      `${gatewayUrl}/integrations/${provider}/${connectionId}/mappings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...buildForwardAuthHeaders(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

