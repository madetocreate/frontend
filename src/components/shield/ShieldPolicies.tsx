'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkBadge } from '@/components/ui/AkBadge'
import { ShieldCheckIcon, GlobeAltIcon, UserGroupIcon, CommandLineIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import type { ComponentType } from 'react'

type PolicyPreset = {
  id: string
  name: string
  description: string
  icon: ComponentType<{ className?: string }>
  rules: {
    read: boolean
    write: boolean
    dangerous: boolean
    pii: 'mask' | 'block' | 'none'
  }
}

const PRESETS: PolicyPreset[] = [
  {
    id: 'public_website',
    name: 'Public Website',
    description: 'Maximale Sicherheit für öffentliche Chatbots. Nur Lese-Zugriff, PII wird maskiert.',
    icon: GlobeAltIcon,
    rules: { read: true, write: false, dangerous: false, pii: 'mask' }
  },
  {
    id: 'internal_support',
    name: 'Internal Support',
    description: 'Für interne Support-Agents. Schreibzugriff erlaubt, kritische Tools blockiert.',
    icon: UserGroupIcon,
    rules: { read: true, write: true, dangerous: false, pii: 'none' }
  },
  {
    id: 'ops_agent',
    name: 'Ops / Admin Agent',
    description: 'Voller Zugriff für System-Administratoren. Vorsicht geboten.',
    icon: CommandLineIcon,
    rules: { read: true, write: true, dangerous: true, pii: 'none' }
  }
]

export function ShieldPolicies() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Sicherheits-Richtlinien</h2>
        <p className="text-sm text-[var(--ak-color-text-secondary)]">
          Definierte Presets für den Zugriff auf MCP-Tools und Daten.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PRESETS.map((preset) => (
          <WidgetCard key={preset.id} className="flex flex-col h-full ak-bg-glass" padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[var(--ak-color-bg-sidebar)] text-[var(--ak-color-accent)]">
                <preset.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--ak-color-text-primary)]">{preset.name}</h3>
                <span className="text-xs text-[var(--ak-color-text-secondary)] font-mono">{preset.id}</span>
              </div>
            </div>
            
            <p className="text-sm text-[var(--ak-color-text-secondary)] mb-6 flex-1">
              {preset.description}
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--ak-color-text-secondary)]">Lesen</span>
                {preset.rules.read ? (
                    <AkBadge tone="success">Erlaubt</AkBadge>
                ) : (
                    <AkBadge tone="danger">Blockiert</AkBadge>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--ak-color-text-secondary)]">Schreiben</span>
                {preset.rules.write ? (
                    <AkBadge tone="success">Erlaubt</AkBadge>
                ) : (
                    <AkBadge tone="danger">Blockiert</AkBadge>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--ak-color-text-secondary)]">Gefährlich</span>
                {preset.rules.dangerous ? (
                    <AkBadge tone="warning">Warnung</AkBadge>
                ) : (
                    <AkBadge tone="danger">Blockiert</AkBadge>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--ak-color-text-secondary)]">PII Schutz</span>
                <span className="text-[var(--ak-color-text-primary)] font-medium capitalize">{preset.rules.pii}</span>
              </div>
            </div>
          </WidgetCard>
        ))}
      </div>

      <WidgetCard title="Custom Rules" padding="sm" className="ak-bg-glass">
        <div className="p-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-sidebar)]/30">
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Zusätzliche Regeln für spezifische Tools oder User-Gruppen.
            </p>
        </div>
        <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <AkListRow
                title="Global Block: 'delete_database'"
                subtitle="Verhindert das Löschen von Datenbanken auf allen Ebenen"
                leading={<LockClosedIcon className="h-5 w-5 text-[var(--ak-semantic-danger)]" />}
                trailing={<AkBadge tone="danger">Active</AkBadge>}
            />
            <AkListRow
                title="PII Masking: Email & Phone"
                subtitle="Automatische Maskierung in allen Logs"
                leading={<ShieldCheckIcon className="h-5 w-5 text-[var(--ak-semantic-info)]" />}
                trailing={<AkBadge tone="success">Active</AkBadge>}
            />
        </div>
      </WidgetCard>
    </div>
  )
}
