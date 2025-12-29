'use client'

import { useState } from 'react'
import { 
  CircleStackIcon, 
  BoltIcon, 
  ArchiveBoxIcon,
  CheckCircleIcon,
  CpuChipIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow } from './SettingsSection'
import { CRMExplorer } from './database/CRMExplorer'
import { MemoryExplorer } from './database/MemoryExplorer'
import clsx from 'clsx'

type SettingsMode = 'simple' | 'expert'
type Tab = 'config' | 'crm' | 'memory'

export function SettingsDatabase({ mode }: { mode: SettingsMode }) {
  const [activeTab, setActiveTab] = useState<Tab>('config')

  const tabs = [
    { id: 'config', label: 'Konfiguration', icon: CogIcon },
    { id: 'crm', label: 'CRM Daten', icon: UsersIcon },
    { id: 'memory', label: 'Memory / Vektor', icon: CpuChipIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-[var(--ak-color-bg-surface-muted)] p-1 border border-[var(--ak-color-border-subtle)] mx-6 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={clsx(
              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--ak-color-bg-surface)]',
              'flex items-center justify-center gap-2 transition-all duration-200',
              activeTab === tab.id
                ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm'
                : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-surface)]/50 hover:text-[var(--ak-color-text-primary)]'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {activeTab === 'config' && (
          <div className="space-y-6 animate-fadeIn">
            <SettingsSection 
              title="Primäre Datenbank" 
              description={mode === 'simple' ? 'Hauptdatenbank-Verbindung' : 'PostgreSQL Datenbank-Konfiguration'}
              mode={mode}
            >
              <SettingsRow
                title="PostgreSQL"
                subtitle={mode === 'expert' ? 'DATABASE_URL' : 'Datenbank-Verbindung'}
                leading={<CircleStackIcon className="h-5 w-5 text-[var(--ak-semantic-info)]" />}
                trailing={
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--ak-semantic-success)] rounded-full animate-pulse"></div>
                    <span className="text-sm text-[var(--ak-semantic-success)] font-medium">Verbunden</span>
                  </div>
                }
                mode={mode}
              />
              {mode === 'expert' && (
                <div className="px-4 py-3 bg-[var(--ak-color-bg-surface-muted)] rounded-lg border border-[var(--ak-color-border-subtle)]">
                  <div className="text-xs font-mono text-[var(--ak-color-text-secondary)] break-all">
                    postgresql://postgres:******@localhost:5432/ai_agent_db
                  </div>
                </div>
              )}
              {mode === 'simple' && (
                <SettingsRow
                  title="Datenbank-Status"
                  subtitle="Verbindungsqualität"
                leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
                  trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">Optimal</span>}
                  mode={mode}
                />
              )}
              {mode === 'expert' && (
                <>
                  <SettingsRow
                    title="Connection Pool Size"
                    subtitle="Anzahl der Verbindungen im Pool"
                    leading={<CircleStackIcon className="h-5 w-5" />}
                    trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">20</span>}
                    mode={mode}
                  />
                  <SettingsRow
                    title="Query Timeout"
                    subtitle="Timeout für Datenbankabfragen"
                    leading={<CircleStackIcon className="h-5 w-5" />}
                    trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">30s</span>}
                    mode={mode}
                  />
                </>
              )}
            </SettingsSection>

            <SettingsSection 
              title="Caching" 
              description={mode === 'simple' ? 'Redis Cache für bessere Performance' : 'Redis Cache-Konfiguration'}
              mode={mode}
            >
              <SettingsRow
                title="Redis Cache"
                subtitle={mode === 'expert' ? 'Host: redis, Port: 6379' : 'Cache-Server'}
                leading={<BoltIcon className="h-5 w-5 text-[var(--ak-semantic-danger)]" />}
                trailing={
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--ak-semantic-success)] rounded-full animate-pulse"></div>
                    <span className="text-sm text-[var(--ak-semantic-success)] font-medium">Verbunden</span>
                  </div>
                }
                mode={mode}
              />
              {mode === 'expert' && (
                <>
                  <SettingsRow
                    title="DB Index"
                    subtitle="Verwendete Datenbank"
                    leading={<ArchiveBoxIcon className="h-5 w-5" />}
                    trailing={<span className="text-sm font-mono">0</span>}
                    mode={mode}
                  />
                  <SettingsRow
                    title="Cache TTL"
                    subtitle="Standard Time-to-Live"
                    leading={<BoltIcon className="h-5 w-5" />}
                    trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">3600s</span>}
                    mode={mode}
                  />
                </>
              )}
            </SettingsSection>
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="animate-fadeIn">
            <CRMExplorer />
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="animate-fadeIn">
            <div className="text-center py-12">
              <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                Memory-Verwaltung wurde nach V2 Settings verschoben.
              </p>
              <a
                href="/settings?tab=memory"
                className="text-sm text-[var(--ak-color-accent)] hover:underline"
              >
                Zu Memory in Settings →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
