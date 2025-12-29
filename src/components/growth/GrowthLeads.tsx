'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkButton } from '@/components/ui/AkButton'
import { FunnelIcon, PlusIcon } from '@heroicons/react/24/outline'

const LEADS = [
    { id: '1', name: 'Max Mustermann', company: 'Muster GmbH', status: 'new', score: 85, lastContact: '2h' },
    { id: '2', name: 'Julia Design', company: 'Creative Studio', status: 'contacted', score: 62, lastContact: '1d' },
    { id: '3', name: 'Dr. Tech', company: 'Future Corp', status: 'qualified', score: 94, lastContact: '4h' },
    { id: '4', name: 'Startup Founder', company: 'New Ideas', status: 'new', score: 45, lastContact: '3d' },
]

export function GrowthLeads() {
  return (
    <div className="py-6 space-y-6 h-full flex flex-col">
       <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Leads & Kontakte</h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Deine Pipeline im Überblick.
            </p>
        </div>
        <div className="flex gap-2">
            <AkButton variant="ghost" leftIcon={<FunnelIcon className="h-4 w-4"/>}>Filter</AkButton>
            <AkButton variant="primary" leftIcon={<PlusIcon className="h-4 w-4"/>}>Neu</AkButton>
        </div>
      </div>

      <WidgetCard padding="sm" className="flex-1 overflow-hidden flex flex-col ak-bg-glass">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--ak-color-bg-sidebar)] border-b border-[var(--ak-color-border-subtle)]">
                    <tr>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Name</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Firma</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Score</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Zuletzt</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface)]">
                    {LEADS.map((lead) => (
                        <tr key={lead.id} className="hover:bg-[var(--ak-color-bg-hover)] transition-colors cursor-pointer">
                            <td className="px-4 py-3 font-medium text-[var(--ak-color-text-primary)]">{lead.name}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">{lead.company}</td>
                            <td className="px-4 py-3">
                                {lead.status === 'new' && <AkBadge tone="info">Neu</AkBadge>}
                                {lead.status === 'contacted' && <AkBadge tone="warning">Kontaktiert</AkBadge>}
                                {lead.status === 'qualified' && <AkBadge tone="success">Qualifiziert</AkBadge>}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className={`font-mono font-medium ${lead.score > 80 ? 'text-[var(--ak-semantic-success)]' : lead.score > 50 ? 'text-[var(--ak-semantic-warning)]' : 'ak-text-muted'}`}>
                                    {lead.score}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)] text-right">{lead.lastContact}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </WidgetCard>
    </div>
  )
}
