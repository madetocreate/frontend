import { NextRequest, NextResponse } from 'next/server'
import { buildForwardAuthHeaders, getGatewayUrl } from '../../_utils/proxyAuth'

type ChatMessage = {
  id: string
  content: string
  timestamp: string
  isOutgoing: boolean
  status?: 'sent' | 'delivered' | 'read'
}

type ChatThreadData = {
  id: string
  contactName: string
  contactAvatar?: string
  platform: 'whatsapp' | 'telegram' | 'sms' | 'messenger' | 'chat'
  messages: ChatMessage[]
  lastActivity?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const resolvedParams = await params
  const threadId = resolvedParams.threadId

  const searchParams = request.nextUrl.searchParams
  const platform = (searchParams.get('platform') || 'chat') as ChatThreadData['platform']

  const gatewayUrl = getGatewayUrl()
  const authHeaders = buildForwardAuthHeaders(request)

  try {
    const response = await fetch(
      `${gatewayUrl}/messages/${threadId}?platform=${platform}&limit=50`,
      {
        method: 'GET',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`[messages/${threadId}] Backend returned ${response.status}:`, errorText)
      
      // Return empty thread as fallback for graceful UI handling
      return NextResponse.json<ChatThreadData>(
        {
          id: threadId,
          contactName: 'Kontakt',
          platform,
          messages: [],
          lastActivity: 'Gerade eben',
        },
        { status: 200 }
      )
    }

    const data = await response.json()
    return NextResponse.json<ChatThreadData>(data, { status: 200 })
  } catch (error) {
    console.error('[messages] Error fetching chat thread:', error)
    // Return empty thread as fallback for graceful UI handling
    return NextResponse.json<ChatThreadData>(
      {
        id: threadId,
        contactName: 'Kontakt',
        platform,
        messages: [],
        lastActivity: 'Gerade eben',
      },
      { status: 200 }
    )
  }
}
