'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkButton } from '@/components/ui/AkButton'
import { BoltIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'

const WORKFLOWS = [
    { id: '1', name: 'New Lead Welcome', trigger: 'Lead Created', status: 'active', runs: 1245 },
    { id: '2', name: 'Stalled Deal Nudge', trigger: 'Deal Idle 7d', status: 'active', runs: 45 },
    { id: '3', name: 'Post-Purchase Review', trigger: 'Order Completed', status: 'paused', runs: 890 },
    { id: '4', name: 'Churn Prevention', trigger: 'Usage Drop', status: 'draft', runs: 0 },
]

export function GrowthAutomation() {
  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
       <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Automatisierung</h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Workflows und Trigger verwalten.
            </p>
        </div>
        <AkButton variant="primary" leftIcon={<PlusIcon className="h-4 w-4"/>}>Neuer Workflow</AkButton>
      </div>

      {/* AI Automation Insight */}
      <div className="flex items-center gap-2 p-3 bg-[var(--ak-accent-documents-soft)] border border-[var(--ak-accent-documents)]/25 rounded-xl text-[11px] text-[var(--ak-accent-documents)]">
          <SparklesIcon className="h-4 w-4 shrink-0" />
          <span>KI-Tipp: Der &quot;New Lead Welcome&quot; Workflow hat eine 15% höhere Abschlussquote wenn er innerhalb von 5 Min läuft.</span>
      </div>

       <div className="grid grid-cols-1 gap-4">
            {WORKFLOWS.map((wf) => (
                <WidgetCard key={wf.id} padding="md" className="group ak-bg-glass hover:border-[var(--ak-color-accent-growth)] transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
                                <BoltIcon className="h-6 w-6 text-[var(--ak-color-text-secondary)] group-hover:text-[var(--ak-color-accent-growth)] transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-medium text-[var(--ak-color-text-primary)]">{wf.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] font-mono">Trigger: {wf.trigger}</span>
                                    <span className="text-xs text-[var(--ak-color-text-secondary)]">• {wf.runs} Ausführungen</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             {wf.status === 'active' && <AkBadge tone="success">Aktiv</AkBadge>}
                             {wf.status === 'paused' && <AkBadge tone="warning">Pausiert</AkBadge>}
                             {wf.status === 'draft' && <AkBadge tone="muted">Entwurf</AkBadge>}
                             
                             <AkButton variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                Bearbeiten
                             </AkButton>
                        </div>
                    </div>
                </WidgetCard>
            ))}
       </div>
    </div>
  )
}
