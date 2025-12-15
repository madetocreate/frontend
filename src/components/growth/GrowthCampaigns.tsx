'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkButton } from '@/components/ui/AkButton'
import { PlusIcon, PlayIcon, PauseIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const CAMPAIGNS = [
    { id: '1', name: 'Winter Sale 2025', channel: 'Multi', status: 'active', budget: '500€', leads: 42, roas: '4.5' },
    { id: '2', name: 'Newsletter Signup', channel: 'Website', status: 'active', budget: '100€', leads: 150, roas: '-' },
    { id: '3', name: 'Retargeting Q1', channel: 'Social', status: 'paused', budget: '200€', leads: 12, roas: '2.1' },
    { id: '4', name: 'Brand Awareness', channel: 'Display', status: 'draft', budget: '1000€', leads: 0, roas: '-' },
]

export function GrowthCampaigns() {
  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Kampagnen</h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Verwalte deine Marketing-Aktivitäten über alle Kanäle.
            </p>
        </div>
        <AkButton variant="primary" leftIcon={<PlusIcon className="h-4 w-4"/>}>Neue Kampagne</AkButton>
      </div>

      <WidgetCard padding="sm" className="flex-1 overflow-hidden flex flex-col apple-glass-enhanced">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--ak-color-bg-sidebar)] border-b border-[var(--ak-color-border-subtle)]">
                    <tr>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Name</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Kanal</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Budget</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Leads</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">ROAS</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Aktionen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface)]">
                    {CAMPAIGNS.map((camp) => (
                        <tr key={camp.id} className="hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                            <td className="px-4 py-3">
                                {camp.status === 'active' && <AkBadge tone="success">Aktiv</AkBadge>}
                                {camp.status === 'paused' && <AkBadge tone="warning">Pausiert</AkBadge>}
                                {camp.status === 'draft' && <AkBadge tone="muted">Entwurf</AkBadge>}
                            </td>
                            <td className="px-4 py-3 font-medium text-[var(--ak-color-text-primary)]">{camp.name}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">{camp.channel}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-primary)] text-right font-mono text-xs">{camp.budget}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-primary)] text-right font-mono text-xs">{camp.leads}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-primary)] text-right font-mono text-xs">{camp.roas}</td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <AkButton size="sm" variant="ghost">
                                        <ChartBarIcon className="h-4 w-4" />
                                    </AkButton>
                                    {camp.status === 'active' ? (
                                        <AkButton size="sm" variant="ghost">
                                            <PauseIcon className="h-4 w-4" />
                                        </AkButton>
                                    ) : (
                                        <AkButton size="sm" variant="ghost">
                                            <PlayIcon className="h-4 w-4" />
                                        </AkButton>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </WidgetCard>
    </div>
  )
}
