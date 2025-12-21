import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const id = resolvedParams.id

  try {
    // Call backend to mark item as read
    const backendUrl = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000'
    const token = process.env.ORCHESTRATOR_API_TOKEN
    
    // For now, we mark it as read in memory by updating metadata
    // In the future, this could be a dedicated read endpoint
    const response = await fetch(
      `${backendUrl}/memory/update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id,
          metadata: { read: true, readAt: new Date().toISOString() },
        }),
      }
    )

    if (!response.ok) {
      // If backend call fails, still return success for optimistic UI
      console.warn('Failed to mark item as read in backend, but returning success for optimistic UI')
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Read API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
