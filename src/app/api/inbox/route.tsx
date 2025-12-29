import { NextResponse, type NextRequest } from 'next/server'
import { UniversalInboxItem, InboxChannel, InboxState } from '@/lib/inbox/types'
import { normalizeInboxItem } from '@/lib/inbox/guards'
import { requireTenantIdFromRequest, getInternalApiKeyHeader } from '@/lib/server/tenant'

type MemoryInboxItemFromBackend = {
  id: string
  type: string
  content: string
  metadata?: Record<string, unknown>
  rawPayloadJson?: Record<string, unknown> | string
  sourceId?: string | null
  conversationId?: string | null
  messageId?: string | null
  documentId?: string | null
  createdAt: string | Date
  is_demo?: boolean // From Python backend: is_demo field
}

type InboxItem = UniversalInboxItem

type OperatorInboxResponse = {
  tenantId: string
  limit?: number
  types?: string[]
  items: MemoryInboxItemFromBackend[]
}

type InboxApiResponse = {
  items?: InboxItem[]
  error?: string
  message?: string
  statusCode?: number
}

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_API_URL || 'http://localhost:4000'

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

type SmartAction = {
  id: string
  label: string
  icon?: string
  actionId?: string
}

function determineSmartActions(item: MemoryInboxItemFromBackend): SmartAction[] {
  const actions: SmartAction[] = []
  const type = item.type ?? 'custom'
  const meta = (item.metadata ?? {}) as Record<string, unknown>
  const content = (item.content ?? '').toLowerCase()
  const fullContent = item.content ?? ''
  
  // Erweiterte Spracherkennung
  const isForeign = 
    content.includes('bonjour') || content.includes('hello') || content.includes('hola') ||
    content.includes('merci') || content.includes('thank you') || content.includes('gracias') ||
    content.includes('french') || content.includes('français') ||
    content.includes('english') || content.includes('spanish') || content.includes('español')

  // Erkennung von Dringlichkeit
  const isUrgent = 
    content.includes('dringend') || content.includes('urgent') || content.includes('sofort') ||
    content.includes('wichtig') || content.includes('important') || content.includes('asap') ||
    content.includes('bitte schnell') || content.includes('please hurry')

  // Erkennung von Fragen
  const hasQuestions = 
    content.includes('?') || content.includes('frage') || content.includes('question') ||
    content.includes('wann') || content.includes('when') || content.includes('wie') ||
    content.includes('warum') || content.includes('why') || content.includes('was')

  // Erkennung von Problemen/Beschwerden
  const isProblem = 
    content.includes('problem') || content.includes('fehler') || content.includes('error') ||
    content.includes('beschwerde') || content.includes('complaint') || content.includes('nicht funktioniert') ||
    content.includes('kaputt') || content.includes('broken') || content.includes('defekt')

  // Erkennung von Bestellungen/Anfragen
  const isOrder = 
    content.includes('bestellung') || content.includes('order') || content.includes('bestellen') ||
    content.includes('anfrage') || content.includes('inquiry') || content.includes('angebot') ||
    content.includes('quote') || content.includes('preis') || content.includes('price')

  // 1. Reply / Analyze - Priorität für alle kommunikativen Typen
  if (type === 'review') {
    actions.push({ id: 'analyze', label: 'Bewertung analysieren', icon: 'ChartBar', actionId: 'reviews.analyze_sentiment' })
    actions.push({ id: 'reply', label: 'Antwort vorschlagen', icon: 'Sparkles', actionId: 'reviews.draft_review_reply' })
  } else if (['email', 'telegram', 'whatsapp', 'support_ticket', 'dm'].includes(type)) {
    // Antwortentwurf ist fast immer sinnvoll
    actions.push({ id: 'reply', label: 'Antwortentwurf', icon: 'Sparkles', actionId: 'inbox.draft_reply' })
    
    // Bei Fragen: Zusätzlich "Fehlende Infos abfragen"
    if (hasQuestions) {
      actions.push({ id: 'ask_missing', label: 'Rückfragen stellen', icon: 'Sparkles', actionId: 'inbox.ask_missing_info' })
    }
  }

  // 2. Next Steps - besonders bei Problemen oder dringenden Nachrichten
  if (isProblem || isUrgent || type === 'support_ticket') {
    actions.push({ id: 'next_steps', label: 'Nächste Schritte', icon: 'ArrowRight', actionId: 'inbox.next_steps' })
  }

  // 3. Übersetzen - bei fremdsprachigen Nachrichten
  // (In EXECUTABLE_ACTION_IDS fehlt derzeit eine dedizierte Übersetzungs-Action für Inbox, 
  // wir nutzen daher den Chat-Fallback oder eine ähnliche Action falls vorhanden)
  if (isForeign) {
    // actions.push({ id: 'translate', label: 'Übersetzen', icon: 'Language', actionId: 'inbox.translate' })
  }

  // 4. Customer Data - Intelligente Erkennung
  const hasCustomerName = Boolean(meta.customerName || meta.contactName || meta.authorName)
  const hasEmail = Boolean(meta.from || meta.email || meta.contactEmail)
  
  if (type === 'email' && hasEmail && !hasCustomerName) {
    // E-Mail vorhanden aber kein Name -> Neuer Kunde
    actions.push({ id: 'create_customer', label: 'Als Kunde speichern', icon: 'UserPlus', actionId: 'customers.create' })
  }

  // 5. Zusammenfassung - bei langen Nachrichten
  if (fullContent.length > 500) {
    actions.push({ id: 'summarize', label: 'Zusammenfassen', icon: 'Sparkles', actionId: 'inbox.summarize' })
  }

  // 6. Spezielle Aktionen je nach Typ
  if (type === 'shopify' || type === 'order') {
    // actions.push({ id: 'track_order', label: 'Status prüfen', icon: 'Truck', actionId: 'shopify.track_order' })
  }

  if (type === 'webform' || type === 'website') {
    actions.push({ id: 'next_steps', label: 'Nächste Schritte', icon: 'ArrowRight', actionId: 'inbox.next_steps' })
  }

  // 7. Fallback: Mindestens 2 sinnvolle Aktionen anbieten
  if (actions.length < 2) {
    // Standard-Aktionen die fast immer sinnvoll sind
    if (!actions.some(a => a.actionId === 'inbox.draft_reply')) {
      actions.push({ id: 'reply', label: 'Antwortentwurf', icon: 'Sparkles', actionId: 'inbox.draft_reply' })
    }
    if (!actions.some(a => a.actionId === 'inbox.next_steps')) {
      actions.push({ id: 'next_steps', label: 'Nächste Schritte', icon: 'ArrowRight', actionId: 'inbox.next_steps' })
    }
  }

  // 8. Priorisierung: Wichtige Aktionen zuerst
  const priorityOrder = [
    'inbox.draft_reply',
    'inbox.next_steps',
    'inbox.ask_missing_info',
    'inbox.summarize',
    'reviews.draft_review_reply',
    'reviews.analyze_sentiment',
    'customers.create',
  ]

  actions.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.actionId || '')
    const bIndex = priorityOrder.indexOf(b.actionId || '')
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  // Maximal 4 Aktionen zurückgeben (die wichtigsten)
  return actions.slice(0, 4)
}

function mapItems(items: MemoryInboxItemFromBackend[]): InboxItem[] {
  return items.map((item) => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>
    const type = item.type ?? 'custom'
    const content = item.content ?? ''
    const snippet =
      content.length > 200
        ? `${content.slice(0, 197)}...`
        : content

    let channel: InboxChannel = 'support'
    let source = ''
    let sender = ''
    let title = ''
    let nextAction: UniversalInboxItem['nextAction'] = null
    const createdAt =
      typeof item.createdAt === 'string'
        ? item.createdAt
        : item.createdAt.toString()
    const time = formatTime(createdAt)
    const threadId =
      (item.conversationId as string | null | undefined) ??
      (metadata['sessionId'] as string | null | undefined) ??
      item.id

    // Smart Actions ermitteln
    const suggestedActions = determineSmartActions(item)

    if (type === 'email') {
      channel = 'email'
      const from = (metadata['from'] as string | undefined) ?? ''
      const subject = metadata['subject'] as string | undefined
      sender = from || 'E-Mail'
      title =
        subject && subject.trim().length > 0
          ? subject
          : `E-Mail von ${sender || 'Unbekannt'}`
      source =
        (metadata['channel'] as string | undefined) ||
        (metadata['source'] as string | undefined) ||
        'E-Mail'
      nextAction = { label: 'Antwortentwurf', tone: 'info' }
    } else if (type === 'telegram' || type === 'whatsapp' || type === 'dm') {
      channel = 'messenger'
      const from = (metadata['from'] as string | undefined) ?? (metadata['from_address'] as string | undefined) ?? ''
      sender = from || (type === 'telegram' ? 'Telegram' : type === 'whatsapp' ? 'WhatsApp' : 'Nachricht')
      title = `${sender} Nachricht`
      source = (metadata['source'] as string | undefined) || (metadata['platform'] as string | undefined) || type
      nextAction = { label: 'Antwortentwurf', tone: 'info' }
    } else if (type === 'review') {
      channel = 'reviews'
      const authorName = (metadata['authorName'] as string | undefined) ?? ''
      const rating = metadata['rating'] as number | undefined
      sender = authorName || 'Bewertung'
      if (typeof rating === 'number') {
        title = `Bewertung ${rating}/5`
      } else {
        title = 'Neue Bewertung'
      }
      source =
        (metadata['sourcePlatform'] as string | undefined) ||
        (metadata['channel'] as string | undefined) ||
        'Review'
      nextAction = { label: 'Antwort vorschlagen', tone: 'info' }
    } else if (type === 'webform' || type === 'website') {
      channel = 'website'
      sender = (metadata['customerName'] as string | undefined) ?? (metadata['contactName'] as string | undefined) ?? 'Web Lead'
      title = (metadata['issueSummary'] as string | undefined) ?? 'Kontaktanfrage'
      source = (metadata['source'] as string | undefined) || 'Website'
      nextAction = { label: 'Details prüfen', tone: 'neutral' }
    } else if (type === 'document' || type === 'file') {
      channel = 'documents'
      sender = 'System'
      title = (metadata['fileName'] as string | undefined) ?? 'Dokument'
      source = (metadata['source'] as string | undefined) || 'Upload'
      nextAction = { label: 'Zusammenfassen', tone: 'neutral' }
    } else if (type === 'shopify' || type === 'order') {
      channel = 'shopify'
      sender = (metadata['customerName'] as string | undefined) ?? 'Kunde'
      title = `Bestellung #${metadata['orderNumber'] ?? ''}`
      source = 'Shopify'
      nextAction = { label: 'Nächster Schritt', tone: 'info' }
    } else if (type === 'support_ticket' || (metadata['kind'] as string) === 'support_ticket') {
      channel = 'support'
      sender = (metadata['customerName'] as string | undefined) ?? 'Support Kunde'
      title = (metadata['subject'] as string | undefined) ?? 'Support Anfrage'
      source = (metadata['source'] as string | undefined) || 'Support'
      nextAction = { label: 'Ticket bearbeiten', tone: 'urgent' }
    } else if (type === 'support_handover' || (metadata['kind'] as string) === 'support_handover') {
      channel = 'support'
      sender = 'Menschlicher Operator'
      title = 'Handover erforderlich'
      source = (metadata['channel'] as string | undefined) || 'Telefony'
      nextAction = { label: 'Handover prüfen', tone: 'urgent' }
    } else {
      channel = 'notifications'
      sender = (metadata['sender'] as string | undefined) ?? 'System'
      title = (metadata['title'] as string | undefined) ?? 'Benachrichtigung'
      source = (metadata['source'] as string | undefined) || 'System'
    }

    // Extract leadId from raw_payload_json if present
    let leadId: string | undefined;
    if (item.rawPayloadJson) {
      const rawPayload = typeof item.rawPayloadJson === 'string' 
        ? JSON.parse(item.rawPayloadJson) 
        : item.rawPayloadJson;
      leadId = rawPayload?.leadId as string | undefined;
    }

    return {
      id: String(item.id),
      threadId,
      channel,
      source,
      sender,
      title,
      snippet,
      time,
      unread: true,
      nextAction,
      status: (metadata['status'] as string | undefined) || 'new',
      kind: type,
      suggestedActions,
      meta: leadId ? { ...metadata, leadId } : metadata,
      isDemo: item.is_demo || false, // Map is_demo from backend
    }
  })
}

function parseFilters(request: NextRequest) {
  const url = new URL(request.url)
  const params = url.searchParams
  const toArray = (key: string) =>
    params.get(key)?.split(',').map((v) => v.trim()).filter(Boolean) ?? []

  return {
    q: params.get('q') || undefined,
    type: params.get('type') || undefined,
    status: toArray('status'),
    ai_state: toArray('ai_state'),
    sla: toArray('sla'),
    owner: params.get('owner') || undefined,
    channel: toArray('channel'),
    tags: toArray('tags'),
    sort: params.get('sort') || undefined,
    view: params.get('view') || undefined,
  }
}

/**
 * Generiert Beispielnachrichten für Design-Tests
 */
function generateMockItems(): MemoryInboxItemFromBackend[] {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  return [
    {
      id: 'mock-1',
      type: 'email',
      content: 'Bonjour, je suis intéressé par vos produits. Pouvez-vous m\'envoyer une offre?',
      metadata: {
        from: 'jean.dupont@example.fr',
        subject: 'Demande de produits',
        channel: 'E-Mail',
        status: 'needs_action',
      },
      createdAt: oneHourAgo.toISOString(),
    },
    {
      id: 'mock-2',
      type: 'review',
      content: 'Ausgezeichneter Service! Das Team war sehr hilfsbereit und die Produkte sind von hoher Qualität. Ich kann diese Firma nur weiterempfehlen.',
      metadata: {
        authorName: 'Anna Schmidt',
        rating: 5,
        sourcePlatform: 'Google Reviews',
        channel: 'Review',
        status: 'needs_action',
      },
      createdAt: twoHoursAgo.toISOString(),
    },
    {
      id: 'mock-3',
      type: 'telegram',
      content: 'Hallo, ich habe eine Frage zu meiner Bestellung #12345. Wann wird diese versendet?',
      metadata: {
        from: '+49 123 456789',
        platform: 'Telegram',
        source: 'Telegram',
        status: 'needs_action',
      },
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'mock-4',
      type: 'webform',
      content: 'Ich möchte gerne ein Beratungsgespräch vereinbaren. Bitte kontaktieren Sie mich unter der angegebenen Telefonnummer.',
      metadata: {
        customerName: 'Thomas Weber',
        issueSummary: 'Beratungsgesuch',
        source: 'Website',
        status: 'open',
      },
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'mock-5',
      type: 'email',
      content: 'Sehr geehrte Damen und Herren, ich habe ein Problem mit meiner letzten Bestellung. Die Ware ist beschädigt angekommen. Bitte kontaktieren Sie mich schnellstmöglich.',
      metadata: {
        from: 'unbekannt@example.com',
        // Kein Name -> "Als Kunde speichern" sollte erscheinen
        subject: 'Problem mit Bestellung',
        channel: 'E-Mail',
        status: 'needs_action',
      },
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'mock-6',
      type: 'review',
      content: 'Gute Produkte, aber der Versand dauerte etwas länger als erwartet. Ansonsten zufrieden.',
      metadata: {
        authorName: 'Peter Müller',
        rating: 4,
        sourcePlatform: 'Trustpilot',
        channel: 'Review',
        status: 'open',
      },
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'mock-7',
      type: 'support_ticket',
      content: 'Ich benötige Hilfe bei der Einrichtung meines Accounts. Die Anmeldung funktioniert nicht korrekt.',
      metadata: {
        customerName: 'Lisa Fischer',
        subject: 'Account-Einrichtung',
        source: 'Support',
        kind: 'support_ticket',
        status: 'needs_action',
      },
      createdAt: twoDaysAgo.toISOString(),
    },
  ]
}

export async function GET(request: NextRequest) {
  const tenantRes = requireTenantIdFromRequest(request)
  if (tenantRes instanceof NextResponse) return tenantRes
  const tenantId = tenantRes

  if (!ORCHESTRATOR_URL) {
    return NextResponse.json<InboxApiResponse>(
      { error: 'misconfigured', message: 'ORCHESTRATOR_API_URL is not set.' },
      { status: 500 }
    )
  }

  try {
    const filters = parseFilters(request)
    
    // Get auth token from request to forward to backend
    const authHeader = request.headers.get('authorization')
    
    // Build headers for backend request
    const backendHeaders: Record<string, string> = {
      'content-type': 'application/json',
      ...getInternalApiKeyHeader(),
    }
    
    // Forward auth token if present
    if (authHeader) {
      backendHeaders['authorization'] = authHeader
    } else if (process.env.NODE_ENV !== 'production') {
      // In development, get a dev token if no auth header present
      try {
        const devTokenRes = await fetch(`${normalizeBaseUrl(ORCHESTRATOR_URL)}/auth/dev/token`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ tenantId, userId: 'dev-user', role: 'admin' }),
        })
        if (devTokenRes.ok) {
          const devTokenData = await devTokenRes.json()
          if (devTokenData.token) {
            backendHeaders['authorization'] = `Bearer ${devTokenData.token}`
          }
        }
      } catch (e) {
        console.warn('[Inbox] Failed to get dev token:', e)
      }
    }
    
    const response = await fetch(`${normalizeBaseUrl(ORCHESTRATOR_URL)}/operator/inbox`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({
        tenantId: tenantId,
        limit: 50,
        query: filters.q,
        types: filters.type && filters.type !== 'all' ? [filters.type] : undefined,
        status: filters.status && filters.status.length > 0 ? filters.status : undefined,
        ai_state: filters.ai_state && filters.ai_state.length > 0 ? filters.ai_state : undefined,
        sla: filters.sla && filters.sla.length > 0 ? filters.sla : undefined,
        owner: filters.owner,
        channel: filters.channel && filters.channel.length > 0 ? filters.channel : undefined,
        tags: filters.tags && filters.tags.length > 0 ? filters.tags : undefined,
        sort: filters.sort,
        view: filters.view,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      
      // In Entwicklung: Mock-Daten zurückgeben statt Fehler
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Inbox] Backend-Fehler, verwende Mock-Daten:', errorText)
        const mockItems = generateMockItems()
        const mockMapped = mapItems(mockItems)
        const mockNormalized = mockMapped.map(normalizeInboxItem)
        return NextResponse.json<InboxApiResponse>(
          {
            items: mockNormalized,
          },
          { status: 200 },
        )
      }
      
      return NextResponse.json<InboxApiResponse>(
        {
          items: [],
          error: errorText,
          statusCode: response.status,
        },
        { status: 502 },
      )
    }

    const payload = (await response.json()) as OperatorInboxResponse
    const mapped = mapItems(payload.items ?? [])
    const normalized = mapped.map(normalizeInboxItem)

    // Wenn keine Items vorhanden sind, verwende Mock-Daten für Design-Tests
    if (normalized.length === 0 && process.env.NODE_ENV !== 'production') {
      const mockItems = generateMockItems()
      const mockMapped = mapItems(mockItems)
      const mockNormalized = mockMapped.map(normalizeInboxItem)
      return NextResponse.json<InboxApiResponse>(
        {
          items: mockNormalized,
        },
        { status: 200 },
      )
    }

    return NextResponse.json<InboxApiResponse>(
      {
        items: normalized,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Fehler im Inbox-Proxy', error)
    
    // In Entwicklung: Mock-Daten zurückgeben statt Fehler
    if (process.env.NODE_ENV !== 'production') {
      const mockItems = generateMockItems()
      const mockMapped = mapItems(mockItems)
      const mockNormalized = mockMapped.map(normalizeInboxItem)
      return NextResponse.json<InboxApiResponse>(
        {
          items: mockNormalized,
        },
        { status: 200 },
      )
    }
    
    return NextResponse.json<InboxApiResponse>(
      {
        items: [],
        error: 'Interner Fehler beim Laden der Inbox.',
      },
      { status: 502 },
    )
  }
}
