'use client'

import type { FC } from 'react'
import { emitQuickAction, type QuickActionPayload } from '@/lib/quickActionsBus'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { OutputCardFrame } from '@/components/ui/OutputCardFrame'

type Suggestion = {
  id: string
  label: string
  description: string
}

type SuggestionGroup = {
  heading: string
  intro: string
  suggestions: Suggestion[]
}

type QuickActionSuggestionPanelProps = {
  action: QuickActionPayload | null
}

function buildSuggestionGroup(action: QuickActionPayload | null): SuggestionGroup | null {
  if (!action) return null

  const source = action.source ?? 'generic'

  if (source === 'marketing') {
    return {
      heading: 'Lass uns eine Marketing-Kampagne starten',
      intro:
        'Ich kann dir sofort Kampagnenideen, Betreffzeilen und komplette Nachrichtenströme vorschlagen.',
      suggestions: [
        {
          id: 'marketing.campaign.newsletter',
          label: 'Newsletter-Kampagne planen',
          description: 'Regelmäßige E-Mail-Serie mit Themenplan und Vorschlägen für Betreffzeilen.',
        },
        {
          id: 'marketing.campaign.promo',
          label: 'Aktionskampagne erstellen',
          description: 'Kurzfristige Rabatt- oder Launch-Kampagne mit Landingpage-Idee.',
        },
        {
          id: 'marketing.campaign.social',
          label: 'Social-Media-Serie ausarbeiten',
          description: 'Post-Ideen für mehrere Kanäle inklusive Hooks und Call-to-Actions.',
        },
        {
          id: 'marketing.campaign.audit',
          label: 'Bestehende Kommunikation analysieren',
          description: 'Bestehende E-Mails oder Posts analysieren und Optimierungsvorschläge machen.',
        },
      ],
    }
  }

  if (source === 'automation') {
    return {
      heading: 'Prozesse automatisieren',
      intro:
        'Wähle einen Einstieg, ich baue dir den passenden Workflow und erkläre die Schritte im Chat.',
      suggestions: [
        {
          id: 'automation.leads.followup',
          label: 'Lead-Follow-up automatisieren',
          description: 'Automatischer Follow-up-Flow nach Formularen oder Telefonaten.',
        },
        {
          id: 'automation.support.triage',
          label: 'Support-Anfragen vorsortieren',
          description: 'Tickets nach Thema und Dringlichkeit klassifizieren und routen.',
        },
        {
          id: 'automation.reminders',
          label: 'Erinnerungen und Check-ins',
          description: 'Wiederkehrende Aufgaben und Kunden-Check-ins automatisch vorbereiten.',
        },
        {
          id: 'automation.pipeline',
          label: 'Sales-Pipeline strukturieren',
          description: 'Deal-Stufen definieren und automatische Aufgaben pro Phase vorschlagen.',
        },
      ],
    }
  }

  if (source === 'memory') {
    return {
      heading: 'Wissen & Memory nutzen',
      intro:
        'Ich kann deine gespeicherten Infos durchsuchen, zusammenfassen und in Aktionen übersetzen.',
      suggestions: [
        {
          id: 'memory.search.customer',
          label: 'Kundendaten zusammensuchen',
          description: 'Alle relevanten Infos zu einer Person oder Firma in einer Übersicht bündeln.',
        },
        {
          id: 'memory.search.conversations',
          label: 'Gesprächshistorie zusammenfassen',
          description: 'Wichtige Punkte aus mehreren Gesprächen zu einem Thema extrahieren.',
        },
        {
          id: 'memory.search.docs',
          label: 'Dokumente nach Antworten durchsuchen',
          description: 'Gezielt Infos oder Entscheidungen in deinen Dokumenten finden.',
        },
        {
          id: 'memory.search.insights',
          label: 'Insights & Chancen finden',
          description: 'Wiederkehrende Muster und Chancen aus deinen Daten ableiten.',
        },
      ],
    }
  }

  return {
    heading: 'Aktion starten',
    intro:
      'Hier sind ein paar Vorschläge, wie ich dir direkt helfen kann. Du kannst danach immer noch frei weiter schreiben.',
    suggestions: [
      {
        id: 'generic.brainstorm',
        label: 'Ideen sammeln',
        description: 'Gemeinsam Ideen zu einem Thema sammeln und strukturieren.',
      },
      {
        id: 'generic.plan',
        label: 'Schritt-für-Schritt-Plan',
        description: 'Einen klaren Aktionsplan mit nächsten Schritten ausarbeiten lassen.',
      },
      {
        id: 'generic.review',
        label: 'Etwas überprüfen lassen',
        description: 'Text, Idee oder Prozess prüfen und Feedback bekommen.',
      },
      {
        id: 'generic.summarize',
        label: 'Zusammenfassung erstellen',
        description: 'Lange Inhalte auf das Wesentliche herunterbrechen.',
      },
    ],
  }
}

export const QuickActionSuggestionPanel: FC<QuickActionSuggestionPanelProps> = ({ action }) => {
  const group = buildSuggestionGroup(action)

  if (!group) return null

  const handleClick = (suggestionId: string) => {
    emitQuickAction({ id: suggestionId, source: action?.source ?? 'generic' })
  }

  return (
    <div className="mb-2 flex w-full justify-center px-2">
      <OutputCardFrame>
        <WidgetCard title={group.heading} subtitle={group.intro} padding="md" shadow>
          <div className="grid gap-3 md:grid-cols-2">
            {group.suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleClick(s.id)}
                className="group flex flex-col items-start rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-3 py-2 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface)] hover:ak-shadow-card"
              >
                <span className="ak-body font-semibold text-[var(--ak-color-text-primary)]">
                  {s.label}
                </span>
                <span className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">
                  {s.description}
                </span>
              </button>
            ))}
          </div>
        </WidgetCard>
      </OutputCardFrame>
    </div>
  )
}
