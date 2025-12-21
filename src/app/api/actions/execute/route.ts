import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { context, actionId, config } = body

    // Proxy zu Python Backend
    const backendUrl = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:8000'
    const memorySecret = process.env.MEMORY_API_SECRET || ''

    const response = await fetch(`${backendUrl}/api/v1/actions/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(memorySecret ? { 'Authorization': `Bearer ${memorySecret}` } : {}),
      },
      body: JSON.stringify({
        context,
        action_id: actionId,
        config,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend action execution error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Backend error', message: errorText, status: response.status },
        { status: response.status }
      )
    }

    // Wenn Backend streamt, stream weiter
    if (response.body && response.headers.get('content-type')?.includes('text/event-stream')) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Sonst JSON Response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Action execution error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

