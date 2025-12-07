import { NextResponse } from 'next/server'

type MemoryInboxItemFromBackend = {
  id: string
  type: string
  content: string
  metadata?: Record<string, unknown>
  sourceId?: string | null
  conversationId?: string | null
  messageId?: string | null
  documentId?: string | null
  createdAt: string | Date
}

type InboxChannel = 'email' | 'messenger' | 'support'

type InboxItem = {
  id: string
  channel: InboxChannel
  type: string
  source: string
  contactName: string
  title: string
  preview: string
  time: string
  unread: boolean
  threadId?: string | null
}

type OperatorInboxResponse = {
  tenantId: string
  limit?: number
  types?: string[]
  items: MemoryInboxItemFromBackend[]
}

type InboxApiResponse = {
  items: InboxItem[]
  error?: string
  statusCode?: number
}

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_API_URL
const ORCHESTRATOR_TENANT_ID = process.env.ORCHESTRATOR_TENANT_ID
const ORCHESTRATOR_API_TOKEN = process.env.ORCHESTRATOR_API_TOKEN

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mapItems(items: MemoryInboxItemFromBackend[]): InboxItem[] {
  return items.map((item) => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>
    const type = item.type ?? 'custom'
    const previewContent = item.content ?? ''
    const preview =
      previewContent.length > 200
        ? `${previewContent.slice(0, 197)}...`
        : previewContent

    let channel: InboxChannel = 'email'
    let source = ''
    let contactName = ''
    let title = ''
    const createdAt =
      typeof item.createdAt === 'string'
        ? item.createdAt
        : item.createdAt.toString()
    const time = formatTime(createdAt)
    const threadId =
      (item.conversationId as string | null | undefined) ??
      (metadata['sessionId'] as string | null | undefined) ??
      null

    if (type === 'email') {
      channel = 'email'
      const from = (metadata['from'] as string | undefined) ?? ''
      const subject = metadata['subject'] as string | undefined
      contactName = from || 'E-Mail'
      title =
        subject && subject.trim().length > 0
          ? subject
          : `E-Mail von ${contactName || 'Unbekannt'}`
      source =
        (metadata['channel'] as string | undefined) ||
        (metadata['source'] as string | undefined) ||
        'E-Mail'
    } else if (type === 'dm') {
      channel = 'messenger'
      const from = (metadata['from'] as string | undefined) ?? ''
      contactName = from || 'Nachricht'
      title = `Nachricht von ${contactName || 'Unbekannt'}`
      source =
        (metadata['platform'] as string | undefined) ||
        (metadata['channel'] as string | undefined) ||
        'Messenger'
    } else if (type === 'review') {
      channel = 'support'
      const authorName = (metadata['authorName'] as string | undefined) ?? ''
      const rating = metadata['rating'] as number | undefined
      contactName = authorName || 'Bewertung'
      if (typeof rating === 'number') {
        title = `Bewertung ${rating}/5`
      } else {
        title = 'Neue Bewertung'
      }
      source =
        (metadata['sourcePlatform'] as string | undefined) ||
        (metadata['channel'] as string | undefined) ||
        'Review'
    } else {
      channel = 'support'
      const kind = (metadata['kind'] as string | undefined) ?? 'support'
      const issueSummary = metadata['issueSummary'] as string | undefined
      contactName =
        (metadata['customerName'] as string | undefined) ??
        (metadata['contactName'] as string | undefined) ??
        kind
      title = issueSummary ?? `Support-Update (${kind})`
      source =
        (metadata['source'] as string | undefined) ||
        (metadata['channel'] as string | undefined) ||
        'Support'
    }

    return {
      id: String(item.id),
      channel,
      type,
      source,
      contactName,
      title,
      preview,
      time,
      unread: true,
      threadId,
    }
  })
}

export async function GET() {
  if (!ORCHESTRATOR_URL || !ORCHESTRATOR_TENANT_ID) {
    return NextResponse.json<InboxApiResponse>(
      {
        items: [],
        error:
          'ORCHESTRATOR_API_URL oder ORCHESTRATOR_TENANT_ID ist nicht gesetzt. Es werden nur Dummy-Daten angezeigt.',
      },
      { status: 200 },
    )
  }

  try {
    const response = await fetch(
      `${normalizeBaseUrl(ORCHESTRATOR_URL)}/operator/inbox`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(ORCHESTRATOR_API_TOKEN
            ? { Authorization: `Bearer ${ORCHESTRATOR_API_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          tenantId: ORCHESTRATOR_TENANT_ID,
          limit: 50,
        }),
      },
    )

    if (!response.ok) {
      let friendlyError =
        'Fehler beim Laden des Operator-Inbox-Endpunkts. Es werden Dummy-Daten angezeigt.'
      let raw = ''

      try {
        raw = await response.text()
      } catch {
        raw = ''
      }

      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { error?: string }
          if (parsed && typeof parsed.error === 'string') {
            friendlyError = parsed.error
          } else {
            friendlyError = raw
          }
        } catch {
          friendlyError = raw
        }
      }

      if (response.status === 401 && friendlyError === 'invalid_auth_token') {
        friendlyError =
          'Auth-Fehler: invalid_auth_token. Prüfe ORCHESTRATOR_API_TOKEN im Frontend und AUTH_SECRET im Backend.'
      }

      return NextResponse.json<InboxApiResponse>(
        {
          items: [],
          error: friendlyError,
          statusCode: response.status,
        },
        { status: 200 },
      )
    }

    const payload = (await response.json()) as OperatorInboxResponse
    const mapped = mapItems(payload.items ?? [])

    return NextResponse.json<InboxApiResponse>(
      {
        items: mapped,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Fehler im Inbox-Proxy', error)
    return NextResponse.json<InboxApiResponse>(
      {
        items: [],
        error: 'Interner Fehler beim Laden der Inbox. Es werden Dummy-Daten angezeigt.',
      },
      { status: 200 },
    )
  }
}
