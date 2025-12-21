'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EmailCard, 
  ChatThreadCard, 
  DataTableCard, 
  MetricsCard, 
  ConfigurationCard, 
  VisualGridCard 
} from './index'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { PhoneIcon } from '@heroicons/react/24/outline'
import { 
  fetchInboxItem, 
  fetchChatThread, 
  fetchCustomerList, 
  fetchDocument,
  fetchGrowthCampaigns,
  type EmailData,
  type ChatThreadData,
  type CustomerData,
  type DocumentData,
  type GrowthCampaignData
} from '@/lib/contextDataService'

interface ContextCardRendererProps {
  className?: string
}

interface ContextState {
  type: 'inbox' | 'customer' | 'document' | 'growth' | 'shield' | 'phone' | 'website' | 'none'
  item: InboxItem | null
  id: string | null
}

export function ContextCardRenderer({ className }: ContextCardRendererProps) {
  const [context, setContext] = useState<ContextState>({ type: 'none', item: null, id: null })
  const [isLoading, setIsLoading] = useState(false)
  const requestIdRef = useRef(0)
  const requestControllerRef = useRef<AbortController | null>(null)
  
  // Data states
  const [emailData, setEmailData] = useState<EmailData | null>(null)
  const [chatData, setChatData] = useState<ChatThreadData | null>(null)
  const [customerData, setCustomerData] = useState<CustomerData[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_documentData, setDocumentData] = useState<DocumentData | null>(null)
  const [growthData, setGrowthData] = useState<GrowthCampaignData[]>([])

  // Load data when context changes
  const loadContextData = useCallback(async (ctx: ContextState) => {
    if (ctx.type === 'none' || !ctx.id) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (requestControllerRef.current) {
      requestControllerRef.current.abort()
    }
    const controller = new AbortController()
    requestControllerRef.current = controller
    const isStale = () => requestIdRef.current !== requestId || controller.signal.aborted

    setIsLoading(true)

    try {
      switch (ctx.type) {
        case 'inbox':
          if (ctx.item?.channel === 'chat') {
            const chatThread = await fetchChatThread(ctx.id, ctx.item.channel, controller.signal)
            if (isStale()) return
            if (chatThread) {
              setChatData({
                ...chatThread,
                contactName: ctx.item.sender,
              })
            }
          } else {
            const email = await fetchInboxItem(ctx.id, controller.signal)
            if (isStale()) return
            if (email && ctx.item) {
              setEmailData({
                ...email,
                from: ctx.item.sender,
                subject: ctx.item.title,
                preview: ctx.item.snippet,
                date: ctx.item.time,
              })
            } else if (email) {
              setEmailData(email)
            }
          }
          break
          
        case 'customer':
          const customers = await fetchCustomerList(10, controller.signal)
          if (isStale()) return
          setCustomerData(customers.length > 0 ? customers : getMockCustomers())
          break
          
        case 'document':
          const doc = await fetchDocument(ctx.id, controller.signal)
          if (isStale()) return
          setDocumentData(doc)
          break
          
        case 'growth':
          const campaigns = await fetchGrowthCampaigns(10, controller.signal)
          if (isStale()) return
          setGrowthData(campaigns.length > 0 ? campaigns : getMockCampaigns())
          break

        case 'shield':
        case 'phone':
        case 'website':
          // For now, these just show an overview message or can be extended
          break
      }
    } catch (error) {
      console.error('Error loading context data:', error)
    } finally {
      if (!isStale()) {
        setIsLoading(false)
        requestControllerRef.current = null
      }
    }
  }, [])

  // Listen for context card events
  useEffect(() => {
    const handleShowContextCard = (event: CustomEvent<ContextState>) => {
      setContext(event.detail)
      loadContextData(event.detail)
    }

    const handleClearContext = () => {
      setContext({ type: 'none', item: null, id: null })
      requestControllerRef.current?.abort()
      requestControllerRef.current = null
      // Clear all data
      setEmailData(null)
      setChatData(null)
      setCustomerData([])
      setDocumentData(null)
      setGrowthData([])
    }

    window.addEventListener('aklow-show-context-card', handleShowContextCard as EventListener)
    window.addEventListener('aklow-clear-context', handleClearContext as EventListener)
    
    return () => {
      requestControllerRef.current?.abort()
      window.removeEventListener('aklow-show-context-card', handleShowContextCard as EventListener)
      window.removeEventListener('aklow-clear-context', handleClearContext as EventListener)
    }
  }, [loadContextData])

  const handleClose = () => {
    setContext({ type: 'none', item: null, id: null })
    // Dispatch event to clear context in shell
    window.dispatchEvent(new CustomEvent('aklow-clear-context'))
  }

  const handleAction = (action: string) => {
    // Prefill chat with action
    window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
      detail: { 
        prompt: action,
        context: context.type,
        id: context.id
      }
    }))
  }

  if (context.type === 'none') return null

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={context.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={className}
      >
        {context.type === 'inbox' && context.item && (
          <>
            {context.item.channel === 'chat' && chatData ? (
              <ChatThreadCard
                id={chatData.id}
                contactName={chatData.contactName}
                contactAvatar={chatData.contactAvatar}
                platform={chatData.platform}
                messages={chatData.messages}
                lastActivity={chatData.lastActivity}
                onClose={handleClose}
                onAction={handleAction}
              />
            ) : emailData ? (
              <EmailCard
                id={emailData.id}
                from={emailData.from}
                fromEmail={emailData.fromEmail}
                to={emailData.to}
                subject={emailData.subject}
                date={emailData.date}
                preview={emailData.preview}
                body={emailData.body}
                attachments={emailData.attachments}
                onClose={handleClose}
                onAction={handleAction}
              />
            ) : (
              // Fallback with item data
              <EmailCard
                id={context.id || '1'}
                from={context.item.sender}
                subject={context.item.title}
                date={context.item.time}
                preview={context.item.snippet}
                onClose={handleClose}
                onAction={handleAction}
              />
            )}
          </>
        )}

        {context.type === 'inbox' && !context.item && (
          <DataTableCard
            id="inbox-overview"
            title="Posteingang Übersicht"
            subtitle="Letzte Nachrichten"
            columns={[
              { key: 'sender', label: 'Absender', type: 'text' },
              { key: 'title', label: 'Betreff', type: 'text' },
              { key: 'time', label: 'Zeit', type: 'text' },
              { key: 'channel', label: 'Kanal', type: 'status' },
            ]}
            rows={[
              { id: '1', sender: 'Max Mustermann', title: 'Anfrage zu Projekt X', time: '10:42', channel: 'Email' },
              { id: '2', sender: 'Erika Musterfrau', title: 'Terminbestätigung', time: '09:15', channel: 'WhatsApp' },
              { id: '3', sender: 'Support Team', title: 'Ticket #1234 gelöst', time: 'Gestern', channel: 'Chat' },
            ]}
            onClose={handleClose}
            onAction={handleAction}
          />
        )}

        {context.type === 'customer' && (
          context.id?.includes('overview') ? (
            <MetricsCard
              id="customer-metrics"
              title="Kunden-Portfolio Analyse"
              metrics={[
                { label: 'Gesamtkunden', value: '1.240', change: '+12%', trend: 'up' },
                { label: 'Churn-Rate', value: '2.4%', change: '-0.5%', trend: 'up' },
                { label: 'Durchschn. LTV', value: '4.250 €', change: '+8%', trend: 'up' },
                { label: 'Aktive Leads', value: '156', change: '+22', trend: 'up' },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          ) : (
            <DataTableCard
              id="customers-list"
              title={context.id?.includes('overview') ? 'Kunden Übersicht' : `Segment: ${context.id}`}
              subtitle={customerData.length > 0 ? `${customerData.length} Kontakte in dieser Ansicht` : undefined}
              columns={[
                { key: 'name', label: 'Kunde', type: 'text' },
                { key: 'company', label: 'Unternehmen', type: 'text' },
                { key: 'revenue', label: 'LTV', type: 'currency', align: 'right' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'lastContact', label: 'Letzter Kontakt', type: 'date' },
              ]}
              rows={customerData.map((c) => ({
                id: c.id,
                name: c.name,
                company: c.company || '-',
                revenue: c.revenue || 0,
                status: c.status,
                lastContact: c.lastContact || '-',
              }))}
              totalRows={customerData.length}
              onClose={handleClose}
              onRowClick={(row) => {
                handleAction(`Öffne Kundenprofil von ${row.name}`)
              }}
              onAction={handleAction}
            />
          )
        )}

        {context.type === 'document' && (
          <VisualGridCard
            id="documents-grid"
            title={context.id?.includes('overview') ? 'Meine Dokumente' : `Ordner: ${context.id}`}
            items={getMockDocuments().map(doc => ({
              id: doc.id,
              name: doc.name,
              sub: `${doc.type} • ${doc.size}`,
              color: doc.type === 'Vertrag' ? 'bg-amber-50 text-orange-600' : 'bg-blue-50 text-blue-600'
            }))}
            onClose={handleClose}
            onItemClick={(item) => handleAction(`Zusammenfassung für ${item.name}`)}
          />
        )}

        {context.type === 'growth' && (
          context.id?.includes('overview') ? (
            <MetricsCard
              id="growth-metrics"
              title="Wachstums-Performance"
              metrics={[
                { label: 'ROI (avg)', value: '4.2x', change: '+0.8', trend: 'up' },
                { label: 'Ad Spend', value: '12.400 €', change: 'On Track', trend: 'neutral' },
                { label: 'CPA', value: '14,20 €', change: '-2,10 €', trend: 'up' },
                { label: 'Conv. Rate', value: '3.8%', change: '+0.4%', trend: 'up' },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          ) : (
            <DataTableCard
              id="growth-campaigns"
              title="Wachstum & Kampagnen"
              subtitle={context.id?.includes('overview') ? 'Strategie Übersicht' : `Kampagnen-Status: ${context.id}`}
              columns={[
                { key: 'name', label: 'Kampagne', type: 'text' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'leads', label: 'Leads', type: 'number', align: 'right' },
                { key: 'budget', label: 'Budget', type: 'currency', align: 'right' },
              ]}
              rows={growthData.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                leads: c.leads,
                budget: c.budget,
              }))}
              totalRows={growthData.length}
              onClose={handleClose}
              onRowClick={(row) => {
                handleAction(`Analysiere Kampagne: ${row.name}`)
              }}
              onAction={handleAction}
            />
          )
        )}

        {context.type === 'shield' && (
          context.id === 'policies' ? (
            <ConfigurationCard
              id="shield-policies"
              title="Sicherheits-Richtlinien"
              options={[
                { label: 'PII Schutz', desc: 'Automatische Anonymisierung von Namen/Daten', active: true },
                { label: 'SQL-Injection Filter', desc: 'Überwachung auf Datenbank-Angriffe', active: true },
                { label: 'Toxizitäts-Blocker', desc: 'Filterung von beleidigenden Inhalten', active: false },
                { label: 'Echtzeit-Tracing', desc: 'Detailliertes Logging aller KI-Aufrufe', active: true },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          ) : (
            <DataTableCard
              id="shield-overview"
              title="Sicherheits-Zentrale"
              subtitle="Systemstatus & Policy-Überwachung"
              columns={[
                { key: 'policy', label: 'Sicherheits-Regel', type: 'text' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'threats', label: 'Abgewehrt', type: 'number', align: 'right' },
                { key: 'lastCheck', label: 'Letzter Scan', type: 'date' },
              ]}
              rows={[
                { id: '1', policy: 'Datenschutz (PII)', status: 'Aktiv', threats: 124, lastCheck: 'Gerade eben' },
                { id: '2', policy: 'SQL Injection', status: 'Aktiv', threats: 0, lastCheck: 'vor 5 Min.' },
                { id: '3', policy: 'Toxizitäts-Filter', status: 'Warnung', threats: 12, lastCheck: 'vor 1 Std.' },
                { id: '4', policy: 'Unbefugter Zugriff', status: 'Aktiv', threats: 3, lastCheck: 'vor 2 Std.' },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          )
        )}

        {context.type === 'phone' && (
          context.id === 'configuration' ? (
            <ConfigurationCard
              id="phone-config"
              title="Bot-Konfiguration"
              options={[
                { label: 'Realtime Voice', desc: 'KI antwortet mit minimaler Latenz', active: true },
                { label: 'Call Transfer', desc: 'Anrufe bei Komplexität an Team leiten', active: true },
                { label: 'Recording', desc: 'Gespräche für Analyse aufzeichnen', active: false },
                { label: 'Termin-Buchung', desc: 'Direkter Zugriff auf Kalender', active: true },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          ) : context.id === 'numbers' ? (
            <VisualGridCard
              id="phone-numbers"
              title="Aktive Rufnummern"
              items={[
                { id: '1', name: '+49 30 123456', sub: 'Zentrale (Aktiv)', color: 'bg-emerald-50 text-emerald-600', icon: <PhoneIcon className="w-6 h-6" /> },
                { id: '2', name: '+49 30 987654', sub: 'Support (Aktiv)', color: 'bg-emerald-50 text-emerald-600', icon: <PhoneIcon className="w-6 h-6" /> },
                { id: '3', name: '+49 176 55544', sub: 'Marketing (Inaktiv)', color: 'bg-slate-50 text-slate-400', icon: <PhoneIcon className="w-6 h-6" /> },
              ]}
              onClose={handleClose}
              onItemClick={(item) => handleAction(`Details zu Nummer ${item.name}`)}
            />
          ) : context.id?.includes('overview') ? (
            <MetricsCard
              id="phone-metrics"
              title="Telefon-Bot Performance"
              metrics={[
                { label: 'Anrufe heute', value: '128', change: '+15', trend: 'up' },
                { label: 'Bot-Quote', value: '84%', change: '+5%', trend: 'up' },
                { label: 'Ø Dauer', value: '2:14m', change: '-12s', trend: 'up' },
                { label: 'Erfolg', value: '92%', change: 'Stabil', trend: 'neutral' },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          ) : (
            <DataTableCard
              id="phone-overview"
              title="Anruf-Journal"
              subtitle="Letzte Aktivitäten"
              columns={[
                { key: 'contact', label: 'Anrufer', type: 'text' },
                { key: 'type', label: 'Typ', type: 'status' },
                { key: 'duration', label: 'Dauer', type: 'text', align: 'right' },
                { key: 'intent', label: 'Anliegen', type: 'text' },
              ]}
              rows={[
                { id: '1', contact: '+49 176 1234...', type: 'Angenommen', duration: '2:45', intent: 'Terminanfrage' },
                { id: '2', contact: 'Privat', type: 'Verpasst', duration: '-', intent: 'Unbekannt' },
                { id: '3', contact: '+49 30 9876...', type: 'Bot-Erledigt', duration: '1:12', intent: 'Öffnungszeiten' },
                { id: '4', contact: 'Müller GmbH', type: 'Angenommen', duration: '5:20', intent: 'Reklamation' },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          )
        )}

        {context.type === 'website' && (
          context.id === 'appearance' ? (
            <ConfigurationCard
              id="web-appearance"
              title="Widget Design"
              options={[
                { label: 'Branding', desc: 'Logo und Firmenfarben verwenden', active: true },
                { label: 'Auto-Greeting', desc: 'Besucher proaktiv begrüßen', active: true },
                { label: 'Bubble-Animation', desc: 'Dezente Animation beim Laden', active: true },
                { label: 'Dark Mode Support', desc: 'Design an System-Theme anpassen', active: false },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          ) : context.id?.includes('overview') ? (
            <MetricsCard
              id="web-metrics"
              title="Website Conversions"
              metrics={[
                { label: 'Besucher', value: '2.4k', change: '+18%', trend: 'up' },
                { label: 'Chats', value: '156', change: '+22', trend: 'up' },
                { label: 'Leads', value: '42', change: '+8', trend: 'up' },
                { label: 'Conv. Rate', value: '3.2%', change: '+0.5%', trend: 'up' },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          ) : (
            <DataTableCard
              id="website-overview"
              title="Seiten-Interaktionen"
              subtitle="Top performende Seiten"
              columns={[
                { key: 'page', label: 'Besuchte Seite', type: 'text' },
                { key: 'visitors', label: 'Besucher', type: 'number', align: 'right' },
                { key: 'conversion', label: 'Conv. Rate', type: 'text', align: 'right' },
                { key: 'leads', label: 'Leads', type: 'number', align: 'right' },
              ]}
              rows={[
                { id: '1', page: '/home', visitors: 1240, conversion: '4.2%', leads: 52 },
                { id: '2', page: '/preise', visitors: 450, conversion: '8.1%', leads: 36 },
                { id: '3', page: '/blog/ki-news', visitors: 890, conversion: '1.2%', leads: 11 },
                { id: '4', page: '/kontakt', visitors: 120, conversion: '25.0%', leads: 30 },
              ]}
              onClose={handleClose}
              onAction={handleAction}
            />
          )
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Fallback mock data functions
function getMockCustomers(): CustomerData[] {
  return [
    { id: '1', name: 'Müller GmbH', company: 'Müller GmbH', status: 'Aktiv', revenue: 125000, lastContact: 'Heute' },
    { id: '2', name: 'Schmidt AG', company: 'Schmidt AG', status: 'Aktiv', revenue: 98500, lastContact: 'Gestern' },
    { id: '3', name: 'Weber & Co', company: 'Weber & Co', status: 'Pending', revenue: 87200, lastContact: '12.12.' },
    { id: '4', name: 'Fischer KG', company: 'Fischer KG', status: 'Aktiv', revenue: 76800, lastContact: '18.12.' },
    { id: '5', name: 'Bauer Corp', company: 'Bauer Corp', status: 'Churn', revenue: 65400, lastContact: '01.12.' },
  ]
}

function getMockCampaigns(): GrowthCampaignData[] {
  return [
    { id: '1', name: 'Winter Sale 2024', status: 'Aktiv', leads: 234, budget: 5000 },
    { id: '2', name: 'Newsletter Q1', status: 'Pending', leads: 89, budget: 1500 },
    { id: '3', name: 'Social Media Push', status: 'Aktiv', leads: 156, budget: 3000 },
    { id: '4', name: 'Webinar Series', status: 'Inaktiv', leads: 42, budget: 1200 },
  ]
}

function getMockDocuments() {
  return [
    { id: '1', name: 'Vertrag_Schmidt_AG.pdf', type: 'Vertrag', size: '1.2 MB', date: 'Heute' },
    { id: '2', name: 'Rechnung_2024_042.pdf', type: 'Rechnung', size: '450 KB', date: 'Gestern' },
    { id: '3', name: 'Marketing_Q1_Draft.docx', type: 'Entwurf', size: '2.4 MB', date: '18.12.' },
    { id: '4', name: 'Produktfotos_Zip.zip', type: 'Archiv', size: '15.8 MB', date: '15.12.' },
  ]
}
