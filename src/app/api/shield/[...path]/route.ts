import { NextRequest, NextResponse } from 'next/server';

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:4051';
const ADMIN_KEY = process.env.CONTROL_PLANE_ADMIN_KEY || 'your-admin-key-min-32-chars';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${CONTROL_PLANE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const res = await fetch(url, {
      headers: {
        'x-ai-shield-admin-key': ADMIN_KEY,
        'Content-Type': 'application/json',
      },
    });

    // Handle non-JSON responses (like errors or empty bodies)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } else {
        const text = await res.text();
        return new NextResponse(text, { status: res.status });
    }
  } catch (error) {
    console.error('Shield API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Control Plane' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join('/');
  const url = `${CONTROL_PLANE_URL}/${path}`;
  
  let body;
  try {
      body = await request.json();
  } catch {
      body = {};
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-ai-shield-admin-key': ADMIN_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } else {
        const text = await res.text();
        return new NextResponse(text, { status: res.status });
    }
  } catch (error) {
    console.error('Shield API Error:', error);
    return NextResponse.json({ error: 'Failed to post to Control Plane' }, { status: 500 });
  }
}
