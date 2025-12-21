import { NextRequest, NextResponse } from 'next/server'

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

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_API_URL
const ORCHESTRATOR_TENANT_ID = process.env.ORCHESTRATOR_TENANT_ID
// const ORCHESTRATOR_API_TOKEN = process.env.ORCHESTRATOR_API_TOKEN // Not used yet

// function normalizeBaseUrl(url: string): string {
//   return url.endsWith('/') ? url.slice(0, -1) : url
// } // Not used yet

// function formatTime(value: string | Date): string {
//   const date = typeof value === 'string' ? new Date(value) : value
//   if (Number.isNaN(date.getTime())) {
//     return 'Gerade eben'
//   }
//   
//   const now = new Date()
//   const diffMs = now.getTime() - date.getTime()
//   const diffMins = Math.floor(diffMs / 60000)
//   const diffHours = Math.floor(diffMs / 3600000)
//   const diffDays = Math.floor(diffMs / 86400000)
//
//   if (diffMins < 1) return 'Gerade eben'
//   if (diffMins < 60) return `vor ${diffMins} Min`
//   if (diffHours < 24) return `vor ${diffHours} Std`
//   if (diffDays === 1) return 'Gestern'
//   if (diffDays < 7) return `vor ${diffDays} Tagen`
//   
//   return date.toLocaleDateString('de-DE', {
//     day: '2-digit',
//     month: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//   })
// } // Not used yet

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const resolvedParams = await params
  const threadId = resolvedParams.threadId
  const searchParams = request.nextUrl.searchParams
  const platform = (searchParams.get('platform') || 'chat') as ChatThreadData['platform']

  if (!ORCHESTRATOR_URL || !ORCHESTRATOR_TENANT_ID) {
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

  try {
    // Fetch from backend
    const backendUrl = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000'
    const token = process.env.ORCHESTRATOR_API_TOKEN
    
    const response = await fetch(
      `${backendUrl}/messages/${threadId}?tenantId=${ORCHESTRATOR_TENANT_ID}&platform=${platform}&limit=50`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Failed to fetch messages:', errorText)
      // Return empty thread with error info for graceful degradation
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
    console.error('Error fetching chat thread:', error)
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

