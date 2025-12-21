'use client'

import { useState } from 'react'
import { SparklesIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export type AIActionContext = 
  | 'inbox'
  | 'customer'
  | 'growth'
  | 'document'
  | 'automation'
  | 'telephony'
  | 'marketing'
  | 'memory'
  | 'settings'
  | 'notifications'
  | 'news'
  | 'calendar'
  | 'practice'
  | 'realestate'
  | 'hotel'
  | 'shield'
  | 'website'

export interface AIAction {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface AIActionsProps {
  context: AIActionContext
  initialActions?: AIAction[]
  onActionClick?: (action: AIAction) => void
  className?: string
}

const DEFAULT_ACTIONS: Record<AIActionContext, AIAction[]> = {
  inbox: [
    { id: 'reply', label: 'Antwort verfassen', description: 'KI-generierte Antwort erstellen' },
    { id: 'summarize', label: 'Zusammenfassen', description: 'Thread-Zusammenfassung' },
    { id: 'prioritize', label: 'Priorität setzen', description: 'Dringlichkeit bewerten' },
    { id: 'translate', label: 'Übersetzen', description: 'Nachricht übersetzen' },
    { id: 'suggest-followup', label: 'Follow-up vorschlagen', description: 'Nächste Schritte' },
    { id: 'extract-tasks', label: 'Tasks extrahieren', description: 'To-dos identifizieren' },
  ],
  customer: [
    { id: 'enrich', label: 'Kunde anreichern', description: 'Daten vervollständigen' },
    { id: 'segment', label: 'Segment zuweisen', description: 'Kunden-Segment' },
    { id: 'suggest-offer', label: 'Angebot vorschlagen', description: 'Personalisiertes Angebot' },
    { id: 'analyze-behavior', label: 'Verhalten analysieren', description: 'Kaufverhalten' },
    { id: 'predict-churn', label: 'Churn-Risiko', description: 'Kündigungsrisiko' },
    { id: 'recommend-product', label: 'Produkt empfehlen', description: 'Passende Produkte' },
  ],
  growth: [
    { id: 'start-campaign', label: 'Kampagne starten', description: 'Marketing-Kampagne' },
    { id: 'suggest-audience', label: 'Zielgruppe vorschlagen', description: 'Audience-Segmentierung' },
    { id: 'generate-content', label: 'Content generieren', description: 'Kampagnen-Content' },
    { id: 'analyze-performance', label: 'Performance analysieren', description: 'Kampagnen-Analyse' },
    { id: 'optimize-budget', label: 'Budget optimieren', description: 'Budget-Verteilung' },
    { id: 'suggest-channels', label: 'Kanäle vorschlagen', description: 'Marketing-Kanäle' },
  ],
  document: [
    { id: 'summarize', label: 'Zusammenfassen', description: 'Dokument-Zusammenfassung' },
    { id: 'extract-keypoints', label: 'Kernpunkte extrahieren', description: 'Wichtige Informationen' },
    { id: 'translate', label: 'Übersetzen', description: 'Dokument übersetzen' },
    { id: 'suggest-improvements', label: 'Verbesserungen vorschlagen', description: 'Text-Optimierung' },
    { id: 'check-compliance', label: 'Compliance prüfen', description: 'Richtlinien-Check' },
    { id: 'generate-summary', label: 'Zusammenfassung erstellen', description: 'Executive Summary' },
  ],
  automation: [
    { id: 'optimize-workflow', label: 'Workflow optimieren', description: 'Automatisierung verbessern' },
    { id: 'suggest-triggers', label: 'Trigger vorschlagen', description: 'Neue Trigger' },
    { id: 'analyze-performance', label: 'Performance analysieren', description: 'Workflow-Analyse' },
    { id: 'suggest-actions', label: 'Aktionen vorschlagen', description: 'Neue Aktionen' },
    { id: 'test-scenario', label: 'Szenario testen', description: 'Workflow-Test' },
    { id: 'generate-documentation', label: 'Dokumentation erstellen', description: 'Workflow-Doku' },
  ],
  telephony: [
    { id: 'transcribe-call', label: 'Anruf transkribieren', description: 'Sprache zu Text' },
    { id: 'summarize-call', label: 'Anruf zusammenfassen', description: 'Call-Summary' },
    { id: 'extract-action-items', label: 'Action Items extrahieren', description: 'To-dos aus Anruf' },
    { id: 'suggest-followup', label: 'Follow-up vorschlagen', description: 'Nächste Schritte' },
    { id: 'analyze-sentiment', label: 'Stimmung analysieren', description: 'Sentiment-Analyse' },
    { id: 'generate-report', label: 'Report erstellen', description: 'Anruf-Report' },
  ],
  marketing: [
    { id: 'generate-post', label: 'Post generieren', description: 'Social Media Post' },
    { id: 'suggest-hashtags', label: 'Hashtags vorschlagen', description: 'Relevante Hashtags' },
    { id: 'optimize-timing', label: 'Timing optimieren', description: 'Beste Post-Zeit' },
    { id: 'analyze-engagement', label: 'Engagement analysieren', description: 'Performance-Analyse' },
    { id: 'suggest-content', label: 'Content vorschlagen', description: 'Neue Inhalte' },
    { id: 'create-campaign', label: 'Kampagne erstellen', description: 'Marketing-Kampagne' },
  ],
  memory: [
    { id: 'enrich-memory', label: 'Memory anreichern', description: 'Daten vervollständigen' },
    { id: 'link-related', label: 'Verknüpfen', description: 'Ähnliche Memories' },
    { id: 'suggest-tags', label: 'Tags vorschlagen', description: 'Relevante Tags' },
    { id: 'summarize', label: 'Zusammenfassen', description: 'Memory-Zusammenfassung' },
    { id: 'extract-entities', label: 'Entitäten extrahieren', description: 'Personen, Orte, etc.' },
    { id: 'suggest-actions', label: 'Aktionen vorschlagen', description: 'Nächste Schritte' },
  ],
  settings: [
    { id: 'optimize-config', label: 'Konfiguration optimieren', description: 'Einstellungen verbessern' },
    { id: 'suggest-improvements', label: 'Verbesserungen vorschlagen', description: 'Best Practices' },
    { id: 'analyze-usage', label: 'Nutzung analysieren', description: 'Usage-Analyse' },
    { id: 'check-security', label: 'Sicherheit prüfen', description: 'Security-Check' },
    { id: 'suggest-integrations', label: 'Integrationen vorschlagen', description: 'Neue Integrationen' },
    { id: 'generate-report', label: 'Report erstellen', description: 'Settings-Report' },
  ],
  notifications: [
    { id: 'optimize-rules', label: 'Regeln optimieren', description: 'Notification-Rules' },
    { id: 'suggest-filters', label: 'Filter vorschlagen', description: 'Bessere Filter' },
    { id: 'analyze-frequency', label: 'Häufigkeit analysieren', description: 'Notification-Analyse' },
    { id: 'suggest-quiet-hours', label: 'Ruhigzeiten vorschlagen', description: 'Do-Not-Disturb' },
    { id: 'prioritize-alerts', label: 'Alerts priorisieren', description: 'Wichtige Alerts' },
    { id: 'generate-summary', label: 'Zusammenfassung erstellen', description: 'Notification-Summary' },
  ],
  news: [
    { id: 'summarize-article', label: 'Artikel zusammenfassen', description: 'News-Zusammenfassung' },
    { id: 'extract-keypoints', label: 'Kernpunkte extrahieren', description: 'Wichtige Infos' },
    { id: 'suggest-related', label: 'Ähnliche Artikel', description: 'Verwandte News' },
    { id: 'analyze-sentiment', label: 'Stimmung analysieren', description: 'Sentiment-Analyse' },
    { id: 'translate', label: 'Übersetzen', description: 'Artikel übersetzen' },
    { id: 'generate-briefing', label: 'Briefing erstellen', description: 'News-Briefing' },
  ],
  calendar: [
    { id: 'suggest-times', label: 'Zeiten vorschlagen', description: 'Beste Terminzeiten' },
    { id: 'optimize-schedule', label: 'Terminplan optimieren', description: 'Schedule-Optimierung' },
    { id: 'detect-conflicts', label: 'Konflikte erkennen', description: 'Termin-Konflikte' },
    { id: 'suggest-participants', label: 'Teilnehmer vorschlagen', description: 'Relevante Personen' },
    { id: 'generate-agenda', label: 'Agenda erstellen', description: 'Meeting-Agenda' },
    { id: 'analyze-availability', label: 'Verfügbarkeit analysieren', description: 'Availability-Check' },
  ],
  practice: [
    { id: 'suggest-appointment', label: 'Termin vorschlagen', description: 'Beste Terminzeiten' },
    { id: 'analyze-patient', label: 'Patient analysieren', description: 'Patienten-Daten' },
    { id: 'generate-report', label: 'Bericht erstellen', description: 'Patienten-Bericht' },
    { id: 'suggest-treatment', label: 'Behandlung vorschlagen', description: 'Behandlungsplan' },
    { id: 'check-compliance', label: 'Compliance prüfen', description: 'DSGVO-Check' },
    { id: 'optimize-schedule', label: 'Terminplan optimieren', description: 'Praxis-Schedule' },
  ],
  realestate: [
    { id: 'generate-expose', label: 'Exposé erstellen', description: 'Immobilien-Exposé' },
    { id: 'suggest-price', label: 'Preis vorschlagen', description: 'Marktpreis-Analyse' },
    { id: 'analyze-market', label: 'Markt analysieren', description: 'Markt-Analyse' },
    { id: 'suggest-improvements', label: 'Verbesserungen vorschlagen', description: 'Immobilien-Optimierung' },
    { id: 'generate-description', label: 'Beschreibung generieren', description: 'Immobilien-Text' },
    { id: 'optimize-listing', label: 'Listing optimieren', description: 'Vermarktung' },
  ],
  hotel: [
    { id: 'suggest-pricing', label: 'Preise vorschlagen', description: 'Revenue-Management' },
    { id: 'optimize-occupancy', label: 'Auslastung optimieren', description: 'Occupancy-Optimierung' },
    { id: 'generate-offer', label: 'Angebot erstellen', description: 'Gast-Angebot' },
    { id: 'analyze-guest', label: 'Gast analysieren', description: 'Gast-Profil' },
    { id: 'suggest-upsell', label: 'Upsell vorschlagen', description: 'Zusatzleistungen' },
    { id: 'optimize-revenue', label: 'Revenue optimieren', description: 'Revenue-Management' },
  ],
  shield: [
    { id: 'policy-check', label: 'Policy prüfen', description: 'Eingabe/Antwort auf Richtlinien prüfen' },
    { id: 'pii-scan', label: 'PII Scan', description: 'Sensible Daten erkennen' },
    { id: 'risk-report', label: 'Risiko-Report', description: 'Sicherheitsbewertung' },
  ],
  website: [
    { id: 'optimize-widget', label: 'Widget optimieren', description: 'Chat-Widget UX/Copy verbessern' },
    { id: 'analyze-traffic', label: 'Traffic analysieren', description: 'Besucher-Insights' },
    { id: 'generate-snippets', label: 'Snippets generieren', description: 'Antwort-Snippets erstellen' },
  ],
}

export function AIActions({ 
  context, 
  initialActions,
  onActionClick,
  className 
}: AIActionsProps) {
  const [showMore, setShowMore] = useState(false)
  const allActions = initialActions || DEFAULT_ACTIONS[context] || []
  // Immer mindestens 3 Actions anzeigen
  const visibleActions = showMore ? allActions : allActions.slice(0, 2)
  const hasMore = allActions.length > 2

  const handleActionClick = (action: AIAction) => {
    // Trigger AI Action Wizard
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('aklow-ai-action-wizard', { 
          detail: { 
            context, 
            action,
            source: 'detail-drawer'
          } 
        })
      )
    }
    onActionClick?.(action)
  }

  if (allActions.length === 0) {
    return null
  }

  // Stelle sicher, dass immer mindestens 3 Actions angezeigt werden
  const displayActions = visibleActions.length >= 2 ? visibleActions : allActions.slice(0, 2)

  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', className)}>
      <div className="flex items-center gap-1.5 px-0.5 mb-0.5">
        <SparklesIcon className="h-3 w-3 text-[var(--ak-color-accent)]" />
        <span className="text-[10px] font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wide">
          KI Vorschläge
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {displayActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleActionClick(action)}
            className="group relative inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] hover:bg-[var(--ak-color-bg-surface)] transition-all duration-150 text-[11px] font-medium text-[var(--ak-color-text-primary)] hover:shadow-sm active:scale-[0.98]"
            title={action.description}
          >
            <span className="truncate max-w-[120px]">{action.label}</span>
          </button>
        ))}
        
        {hasMore && !showMore && (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-[11px] font-medium text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
          >
            Mehr
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        )}
        
        {hasMore && showMore && (
          <button
            type="button"
            onClick={() => setShowMore(false)}
            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-[11px] font-medium text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
          >
            Weniger
            <ChevronDownIcon className="h-3 w-3 rotate-180" />
          </button>
        )}
      </div>
    </div>
  )
}

