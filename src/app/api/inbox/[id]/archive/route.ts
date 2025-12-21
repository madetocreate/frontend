import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const id = resolvedParams.id

  try {
    // Call backend to archive the item
    const backendUrl = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000'
    const token = process.env.ORCHESTRATOR_API_TOKEN
    
    // For now, we mark it as archived in memory by updating metadata
    // In the future, this could be a dedicated archive endpoint
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
          metadata: { archived: true, archivedAt: new Date().toISOString() },
        }),
      }
    )

    if (!response.ok) {
      // If backend call fails, still return success for optimistic UI
      console.warn('Failed to archive item in backend, but returning success for optimistic UI')
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Archive API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
