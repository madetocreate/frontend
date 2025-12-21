import { NextRequest, NextResponse } from 'next/server'

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

type EmailData = {
  id: string
  from: string
  fromEmail?: string
  to?: string
  subject: string
  date: string
  preview: string
  body?: string
  attachments?: { name: string; size: string }[]
}

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_API_URL
const ORCHESTRATOR_TENANT_ID = process.env.ORCHESTRATOR_TENANT_ID
const ORCHESTRATOR_API_TOKEN = process.env.ORCHESTRATOR_API_TOKEN

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString('de-DE')
  }
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mapToEmailData(item: MemoryInboxItemFromBackend): EmailData {
  const metadata = (item.metadata ?? {}) as Record<string, unknown>
  const from = (metadata['from'] as string | undefined) ?? 'Unbekannter Absender'
  const fromEmail = (metadata['fromEmail'] as string | undefined) ?? (metadata['from'] as string | undefined)
  const to = (metadata['to'] as string | undefined) ?? 'Du'
  const subject = (metadata['subject'] as string | undefined) ?? item.type
  const content = item.content ?? ''
  const preview = content.length > 200 ? `${content.slice(0, 197)}...` : content
  const date = formatDate(item.createdAt)

  // Extract attachments from metadata if available
  const attachments: { name: string; size: string }[] = []
  if (metadata['attachments'] && Array.isArray(metadata['attachments'])) {
    for (const att of metadata['attachments']) {
      if (typeof att === 'object' && att !== null) {
        const attObj = att as Record<string, unknown>
        if (attObj['name'] && attObj['size']) {
          attachments.push({
            name: String(attObj['name']),
            size: String(attObj['size']),
          })
        }
      }
    }
  }

  return {
    id: String(item.id),
    from,
    fromEmail,
    to,
    subject,
    date,
    preview,
    body: content,
    attachments: attachments.length > 0 ? attachments : undefined,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const threadId = resolvedParams.id

  if (!ORCHESTRATOR_URL || !ORCHESTRATOR_TENANT_ID) {
    return NextResponse.json<EmailData>(
      {
        id: threadId,
        from: 'Unbekannter Absender',
        subject: 'Nachricht',
        date: new Date().toLocaleDateString('de-DE'),
        preview: 'ORCHESTRATOR_API_URL oder ORCHESTRATOR_TENANT_ID ist nicht gesetzt.',
      },
      { status: 200 }
    )
  }

  try {
    // Try to fetch from operator/inbox and find the specific item
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
          limit: 100, // Get more items to find the specific one
        }),
      }
    )

    if (!response.ok) {
      return NextResponse.json<EmailData>(
        {
          id: threadId,
          from: 'Unbekannter Absender',
          subject: 'Nachricht',
          date: new Date().toLocaleDateString('de-DE'),
          preview: 'Fehler beim Laden der Nachricht.',
        },
        { status: 200 }
      )
    }

    const payload = (await response.json()) as {
      items: MemoryInboxItemFromBackend[]
    }

    // Find the specific item by id or threadId
    const item = payload.items?.find(
      (i) => String(i.id) === threadId || 
             String(i.conversationId) === threadId ||
             String(i.messageId) === threadId
    )

    if (!item) {
      return NextResponse.json<EmailData>(
        {
          id: threadId,
          from: 'Unbekannter Absender',
          subject: 'Nachricht',
          date: new Date().toLocaleDateString('de-DE'),
          preview: 'Nachricht nicht gefunden.',
        },
        { status: 200 }
      )
    }

    const emailData = mapToEmailData(item)
    return NextResponse.json<EmailData>(emailData, { status: 200 })
  } catch (error) {
    console.error('Fehler im Inbox-Detail-Proxy', error)
    return NextResponse.json<EmailData>(
      {
        id: threadId,
        from: 'Unbekannter Absender',
        subject: 'Nachricht',
        date: new Date().toLocaleDateString('de-DE'),
        preview: 'Interner Fehler beim Laden der Nachricht.',
      },
      { status: 200 }
    )
  }
}

