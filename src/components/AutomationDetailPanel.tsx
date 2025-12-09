'use client'
import { sendChatMessage } from '@/lib/chatClient'

import { useState } from 'react'
import clsx from 'clsx'
import { WidgetCard } from '@/components/ui/WidgetCard'

type AutomationRun = {
  id: string
  dateTime: string
  resultLabel: 'Erfolgreich' | 'Warnung' | 'Fehlgeschlagen'
  statusColor: 'success' | 'warning' | 'danger'
  itemsProcessed: number
  summary: string
  errorNote?: string
  metrics: Array<{ label: string; value: string }>
}

type AutomationPreview = {
  hasPreview: boolean
  adoptEnabled: boolean
  trigger: string
  steps: string[]
  goals: string[]
}

type AutomationDetailPanelProps = {
  workflowId: string | null
}

const MOCK_PREVIEW: AutomationPreview = {
  hasPreview: true,
  adoptEnabled: true,
  trigger: 'Wenn in Zendesk ein neues Support-Ticket erstellt wird',
  steps: [
    'Priorität und Kategorie aus dem Tickettext erkennen',
    'Asana-Aufgabe im richtigen Projekt anlegen',
    'Kund:in per E-Mail über Empfang informieren',
    'Slack-Channel #support benachrichtigen',
  ],
  goals: [
    'Schnelle, konsistente Ticket-Triage',
    'Transparente Übergabe an das Delivery-Team',
  ],
}

const MOCK_RUNS: AutomationRun[] = [
  {
    id: 'run_1',
    dateTime: '2025-12-09 10:43',
    resultLabel: 'Erfolgreich',
    statusColor: 'success',
    itemsProcessed: 42,
    summary: 'Import und Benachrichtigungen wurden ohne Probleme abgeschlossen.',
    metrics: [
      { label: 'Dauer', value: '14s' },
      { label: 'Warnungen', value: '0' },
    ],
  },
  {
    id: 'run_2',
    dateTime: '2025-12-09 09:15',
    resultLabel: 'Warnung',
    statusColor: 'warning',
    itemsProcessed: 39,
    summary: '3 Tickets ohne Kategorie wurden als \'Allgemein\' zugewiesen.',
    metrics: [
      { label: 'Dauer', value: '18s' },
      { label: 'Warnungen', value: '3' },
    ],
  },
  {
    id: 'run_3',
    dateTime: '2025-12-08 17:02',
    resultLabel: 'Fehlgeschlagen',
    statusColor: 'danger',
    itemsProcessed: 0,
    summary: 'Die Verbindung zu Asana war nicht erreichbar.',
    errorNote: 'HTTP 503 von Asana API',
    metrics: [
      { label: 'Wiederholungen', value: '2' },
    ],
  },
]



type AutomationSuggestion = {
  id: string
  label: string
  description: string
  prompt: string
}

const AUTOMATION_SUGGESTIONS_BY_WORKFLOW: Record<string, AutomationSuggestion[]> = {
  workflow_creation: [
    {
      id: 'automation.workflow.ticket_intake',
      label: 'Ticket-Intake automatisieren',
      description: 'Neue Support-Tickets automatisch triagieren und an das richtige Team leiten.',
      prompt: 'Wenn in meinem Helpdesk ein neues Ticket erstellt wird, analysiere Thema und Priorität, erstelle eine Aufgabe im Projekt-Tool und informiere das verantwortliche Team.',
    },
    {
      id: 'automation.workflow.onboarding',
      label: 'Onboarding-Workflow aufsetzen',
      description: 'Einen mehrstufigen Onboarding-Prozess für neue Kundinnen und Kunden definieren.',
      prompt: 'Wenn ein neuer Kunde im CRM angelegt wird, starte einen Onboarding-Workflow mit Begrüßungs-E-Mail, Check-in nach 7 Tagen und Feedback-Abfrage nach 30 Tagen.',
    },
  ],
  task_automation: [
    {
      id: 'automation.tasks.churn_risk',
      label: 'Risiko-Kunden markieren',
      description: 'Kunden mit niedrigem Engagement automatisch kennzeichnen und Aufgaben anlegen.',
      prompt: 'Wenn ein bestehender Kunde sich seit 30 Tagen nicht eingeloggt hat, markiere ihn als Risiko und lege eine Aufgabe für das Customer-Success-Team an.',
    },
  ],
  schedule_automation: [
    {
      id: 'automation.schedule.reporting',
      label: 'Wöchentliche Reports planen',
      description: 'Regelmäßige Report-Erstellung und Versand automatisieren.',
      prompt: 'Erstelle jeden Montagmorgen einen Performance-Report der letzten Woche und sende ihn automatisch an das Team.',
    },
  ],
  email_automation: [
    {
      id: 'automation.email.followup',
      label: 'Follow-up Sequenz bauen',
      description: 'Automatische Erinnerungs-E-Mails nach Formular- oder Demo-Anfragen einrichten.',
      prompt: 'Wenn jemand ein Demo-Formular absendet, sende nach 2 Tagen eine Follow-up-Mail und nach 7 Tagen eine zweite Erinnerung, falls noch keine Antwort erfolgt ist.',
    },
  ],
  approval_workflows: [
    {
      id: 'automation.approval.discounts',
      label: 'Rabatt-Genehmigungen steuern',
      description: 'Genehmigungsprozess für hohe Rabatte oder Sonderkonditionen aufsetzen.',
      prompt: 'Wenn ein Rabatt von mehr als 20 Prozent eingetragen wird, leite die Anfrage an das Management zur Genehmigung weiter und blockiere die Freigabe bis zur Bestätigung.',
    },
  ],
  report_automation: [
    {
      id: 'automation.reporting.summary',
      label: 'Kompakte Management-Reports erzeugen',
      description: 'Verdichtete Zusammenfassungen für die Geschäftsführung erstellen.',
      prompt: 'Fasse jeden Freitag die wichtigsten KPIs der Woche aus CRM und Support-System in einem Management-Report zusammen.',
    },
  ],
}

const getSuggestionsForWorkflow = (workflowId: string | null): AutomationSuggestion[] => {
  if (!workflowId) return []
  return AUTOMATION_SUGGESTIONS_BY_WORKFLOW[workflowId] ?? []
}

const STATUS_COLORS = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
} as const

export function AutomationDetailPanel({ workflowId }: AutomationDetailPanelProps) {
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [preview, setPreview] = useState<AutomationPreview>(MOCK_PREVIEW)
  const [runs] = useState<AutomationRun[]>(MOCK_RUNS)
  const [selectedRunId, setSelectedRunId] = useState<string | null>('run_2')
  const [currentWorkflow] = useState<{ id: string; name: string } | null>(
    workflowId ? { id: workflowId, name: 'Ticket-Intake (Zendesk → Asana)' } : null,
  )

  const [isSendingSuggestion, setIsSendingSuggestion] = useState(false)
  const suggestions = getSuggestionsForWorkflow(workflowId ?? null)

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const prompt = formData.get('ai.prompt') as string
    setAiPrompt(prompt)
    // Simulate AI generation
    setPreview({
      hasPreview: true,
      adoptEnabled: true,
      trigger: `Wenn ${prompt}`,
      steps: ['Schritt 1', 'Schritt 2', 'Schritt 3'],
      goals: ['Ziel 1', 'Ziel 2'],
    })
  }

  const handleExtend = () => {
    console.log('Extend workflow')
  }

  const handleAdopt = () => {
    console.log('Adopt preview to builder')
  }

  const handleSuggestionClick = async (s: AutomationSuggestion) => {
  setAiPrompt(s.prompt)
  setIsSendingSuggestion(true)
  try {
    await sendChatMessage({
      tenantId: 'demo-tenant',
      sessionId: 'automation-panel',
      channel: 'web_chat',
      message: s.prompt,
      metadata: {
        source: 'automation_panel',
        suggestionId: s.id,
        workflowId,
      },
    })
  } catch (error) {
    console.error('Error sending automation suggestion to agent', error)
  } finally {
    setIsSendingSuggestion(false)
  }
}

const handleRunSelect = (id: string) => {
    setSelectedRunId(selectedRunId === id ? null : id)
  }

  if (!workflowId) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">Wähle eine Automatisierung aus</p>
          <p className="mt-1">Klicke auf eine Automatisierung in der linken Sidebar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <WidgetCard padding="sm">
        <div className="flex flex-col gap-3">
          <h2 className="ak-heading">KI-Workflow-Designer</h2>


{suggestions.length > 0 && (
  <div className="flex flex-col gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-3 py-2">
    <p className="ak-caption text-[var(--ak-color-text-secondary)]">
      Starte mit einem dieser Automatisierungs-Vorschläge
    </p>
    <div className="grid gap-2 sm:grid-cols-2">
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => handleSuggestionClick(s)}
          disabled={isSendingSuggestion}
          className={clsx(
            'group flex flex-col items-start rounded-md border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]',
            isSendingSuggestion ? 'opacity-70 cursor-wait' : '',
          )}
        >
          <span className="font-medium text-[var(--ak-color-text-primary)]">
            {s.label}
          </span>
          <span className="ak-caption mt-0.5 text-[var(--ak-color-text-secondary)]">
            {s.description}
          </span>
        </button>
      ))}
    </div>
  </div>
)}

<form onSubmit={handleGenerate}>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="ai.prompt" className="ak-body font-medium text-[var(--ak-color-text-primary)]">
                  Beschreibe deinen Workflow in eigenen Worten …
                </label>
                <textarea
                  id="ai.prompt"
                  name="ai.prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="z. B. Wenn ein Ticket erstellt wird, prüfe Priorität, erstelle Aufgabe und benachrichtige Team."
                  rows={5}
                  className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-accent)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
                >
                  Vorschlag generieren
                </button>
                <button
                  type="button"
                  onClick={handleExtend}
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
                >
                  Workflow erweitern
                </button>
              </div>
            </div>
          </form>

          {preview.hasPreview && (
            <>
              <div className="h-px bg-[var(--ak-color-border-subtle)]" />

              <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="ak-heading">Vorschau</h3>
                    {preview.adoptEnabled && (
                      <button
                        type="button"
                        onClick={handleAdopt}
                        className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-2.5 py-1 text-xs font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]"
                      >
                        In Builder übernehmen
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="ak-caption font-medium text-[var(--ak-color-text-secondary)]">Trigger</p>
                    <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">{preview.trigger}</p>

                    <p className="ak-caption font-medium text-[var(--ak-color-text-secondary)]">Hauptschritte</p>
                    <div className="flex flex-col gap-1">
                      {preview.steps.map((step, i) => (
                        <p key={`step-${i}`} className="ak-body text-sm text-[var(--ak-color-text-primary)]">
                          • {step}
                        </p>
                      ))}
                    </div>

                    <p className="ak-caption font-medium text-[var(--ak-color-text-secondary)]">Ziele</p>
                    <div className="flex flex-col gap-1">
                      {preview.goals.map((goal, i) => (
                        <p key={`goal-${i}`} className="ak-body text-sm text-[var(--ak-color-text-primary)]">
                          • {goal}
                        </p>
                      ))}
                    </div>

                    <p className="ak-caption text-xs text-[var(--ak-color-text-muted)]">
                      Klick auf &quot;In Builder übernehmen&quot; fügt die vorgeschlagenen Schritte in den visuellen Builder ein und aktualisiert bestehende Blöcke, falls vorhanden.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </WidgetCard>

      <WidgetCard padding="sm">
        <div className="flex flex-col gap-3">
          <h2 className="ak-heading">Letzte Ausführungen</h2>
          <p className="ak-caption text-[var(--ak-color-text-secondary)]">
            {currentWorkflow?.name
              ? `Gefiltert nach: ${currentWorkflow.name}`
              : 'Kein Workflow ausgewählt'}
          </p>

          <div className="flex flex-col gap-2">
            {runs.map((run) => (
              <button
                key={run.id}
                type="button"
                onClick={() => handleRunSelect(run.id)}
                className="group flex w-full flex-col gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-3 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:shadow-[var(--ak-shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">{run.dateTime}</p>
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      STATUS_COLORS[run.statusColor],
                    )}
                  >
                    {run.resultLabel}
                  </span>
                </div>
                <p className="ak-caption text-[var(--ak-color-text-secondary)]">
                  Elemente: {run.itemsProcessed}
                </p>

                {selectedRunId === run.id && (
                  <div className="mt-2 rounded-md border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-2">
                    <div className="flex flex-col gap-2">
                      <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">{run.summary}</p>
                      {run.errorNote && (
                        <p className="ak-body text-sm text-red-600">{run.errorNote}</p>
                      )}
                      {run.metrics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {run.metrics.map((m, idx) => (
                            <span
                              key={`${run.id}-m${idx}`}
                              className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                            >
                              {m.label}: {m.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </WidgetCard>
    </div>
  )
}
