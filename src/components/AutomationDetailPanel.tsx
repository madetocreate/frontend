'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { AkButton } from '@/components/ui/AkButton'
import { 
  DrawerHeader, 
  DrawerCard, 
  ActionGroup, 
  ActionButton, 
  DrawerEmptyState 
} from '@/components/ui/drawer-kit'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  CpuChipIcon, 
  SparklesIcon, 
  PlayIcon, 
  CommandLineIcon,
  CheckCircleIcon,
  BoltIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

type AutomationRun = {
  id: string
  dateTime: string
  resultLabel: 'Erfolgreich' | 'Warnung' | 'Fehlgeschlagen'
  statusColor: 'success' | 'warning' | 'danger' | 'muted' | 'info' | 'accent'
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
    'Schnelle, konsistente Inbox-Sortierung',
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

export function AutomationDetailPanel({ workflowId }: AutomationDetailPanelProps) {
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [preview] = useState<AutomationPreview>(MOCK_PREVIEW)
  const [runs] = useState<AutomationRun[]>(MOCK_RUNS)
  const [selectedRunId, setSelectedRunId] = useState<string | null>('run_2')
  
  if (!workflowId) {
    return (
      <AkDrawerScaffold
        header={<DrawerHeader title="Automatisierung" subtitle="Kein Workflow" />}
        bodyClassName="h-full"
      >
        <DrawerEmptyState
          icon={<CpuChipIcon className="h-10 w-10" />}
          title="Kein Workflow ausgewählt"
          description="Wähle einen Workflow aus der Liste aus oder erstelle einen neuen mit KI-Unterstützung."
          primaryAction={{
            label: "KI-Workflow erstellen",
            shortcut: "N",
            onClick: () => console.log('New')
          }}
          secondaryActions={[
            { label: "Alle Vorlagen", shortcut: "V", onClick: () => console.log('Templates') },
            { label: "Doku", shortcut: "?", onClick: () => console.log('Docs') }
          ]}
        />
      </AkDrawerScaffold>
    )
  }

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),360px]">
      <AkDrawerScaffold
        header={<DrawerHeader 
          title="KI-Workflow-Designer" 
          subtitle="Ticket-Intake (Zendesk → Asana)"
          status={{ label: 'Aktiv', tone: 'success' }}
        />}
        bodyClassName="p-4 space-y-6 ak-scrollbar bg-[var(--ak-color-bg-app)]"
      >
        {/* Designer Card */}
        <DrawerCard title="KI-Unterstützung">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="ai.prompt" className="text-xs font-semibold text-[var(--ak-color-text-secondary)]">
                Workflow-Beschreibung
              </label>
              <textarea
                id="ai.prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Beschreibe den Workflow in eigenen Worten..."
                rows={4}
                className="w-full rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-3 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all"
              />
            </div>
            <div className="flex gap-2">
              <AkButton variant="primary" size="sm" className="flex-1" leftIcon={<SparklesIcon className="h-4 w-4" />}>
                Vorschlag generieren
              </AkButton>
              <AkButton variant="secondary" size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>
                Erweitern
              </AkButton>
            </div>
          </div>
        </DrawerCard>

        {/* Preview Card */}
        {preview.hasPreview && (
          <DrawerCard title="Vorschau & Logik" className="border-[var(--ak-accent-inbox)]/25 bg-[var(--ak-accent-inbox-soft)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-[var(--ak-accent-inbox)] tracking-wider">Trigger</p>
                <p className="text-sm text-[var(--ak-color-text-primary)] font-medium">{preview.trigger}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-[var(--ak-accent-inbox)] tracking-wider">Schritte</p>
                <div className="space-y-1.5">
                  {preview.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)]">
                      <div className="h-1 w-1 rounded-full bg-[var(--ak-accent-inbox)]" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <AkButton variant="secondary" size="sm" className="w-full text-[var(--ak-accent-inbox)] bg-[var(--ak-accent-inbox-soft)] border-[var(--ak-accent-inbox)]/25 hover:bg-[var(--ak-accent-inbox-soft)]">
                In Builder übernehmen
              </AkButton>
            </div>
          </DrawerCard>
        )}

        {/* History Card */}
        <DrawerCard title="Letzte Ausführungen">
          <div className="space-y-2">
            {runs.map((run) => (
              <button
                key={run.id}
                onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}
                className={clsx(
                  "w-full flex flex-col gap-2 p-3 rounded-xl border transition-all text-left group",
                  selectedRunId === run.id
                    ? "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-strong)] shadow-md"
                    : "bg-[var(--ak-color-bg-surface-muted)] border-transparent hover:border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ak-color-text-primary)]">{run.dateTime}</span>
                  <AkBadge tone={run.statusColor as 'success' | 'warning' | 'danger' | 'muted' | 'info' | 'accent'} size="sm">{run.resultLabel}</AkBadge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[var(--ak-color-text-muted)] font-medium">
                  <span>Elemente: {run.itemsProcessed}</span>
                  {run.metrics.map((m: { label: string; value: string }, idx: number) => (
                    <span key={idx}>{m.label}: {m.value}</span>
                  ))}
                </div>
                {selectedRunId === run.id && (
                  <div className="mt-1 pt-2 border-t border-[var(--ak-color-border-hairline)] text-xs text-[var(--ak-color-text-secondary)] leading-relaxed">
                    {run.summary}
                    {run.errorNote && <p className="text-[var(--ak-semantic-danger)] mt-1 font-bold">{run.errorNote}</p>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </DrawerCard>
      </AkDrawerScaffold>

      {/* Right Inspector */}
      <div className="border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] dark:bg-[var(--ak-color-graphite-surface)] p-4 space-y-4 overflow-y-auto ak-scrollbar">
        <DrawerCard title="KI-Assistent Aktionen">
          <div className="space-y-4">
            <ActionGroup label="Verstehen">
              <ActionButton icon={<BoltIcon className="h-3.5 w-3.5" />} label="Analyse" shortcut="A" />
              <ActionButton icon={<SparklesIcon className="h-3.5 w-3.5" />} label="Optimieren" shortcut="O" />
            </ActionGroup>
            
            <ActionGroup label="Prüfen">
              <ActionButton icon={<CommandLineIcon className="h-3.5 w-3.5" />} label="Logs scannen" shortcut="L" />
            </ActionGroup>

            <ActionGroup label="Handeln">
              <ActionButton icon={<PlayIcon className="h-3.5 w-3.5" />} label="Testlauf" shortcut="T" />
            </ActionGroup>
          </div>
        </DrawerCard>

        <DrawerCard className="opacity-60" title="Verbindungen">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)] font-medium">
              <CheckCircleIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
              <span>Zendesk API (verbunden)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)] font-medium">
              <CheckCircleIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
              <span>Asana API (verbunden)</span>
            </div>
          </div>
        </DrawerCard>
      </div>
    </div>
  )
}
