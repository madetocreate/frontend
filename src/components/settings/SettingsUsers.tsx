'use client'

import { ShieldCheckIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow } from './SettingsSection'
import { AkButton } from '@/components/ui/AkButton'

type SettingsMode = 'simple' | 'expert'

const ROLES = [
  { name: 'Admin', scopes: ['*'], description: 'Voller Systemzugriff', users: 2 },
  { name: 'Orchestrator', scopes: ['crm:*', 'memory:*', 'agent:execute'], description: 'AI Agent Supervisor', users: 1 },
  { name: 'Agent', scopes: ['crm:read', 'memory:read'], description: 'Standard Agent Zugriff', users: 5 },
  { name: 'Viewer', scopes: ['read:only'], description: 'Nur Lesezugriff', users: 0 },
]

export function SettingsUsers({ mode }: { mode: SettingsMode }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Rollen & Berechtigungen</h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'simple' 
              ? 'Verwalten Sie Benutzerrollen und Zugriffsrechte'
              : 'Detaillierte Rollenverwaltung mit Scope-basierten Berechtigungen'}
          </p>
        </div>
        <AkButton variant="primary" leftIcon={<PlusIcon className="h-4 w-4"/>}>
          Neue Rolle
        </AkButton>
      </div>

      <SettingsSection 
        title="Verfügbare Rollen" 
        description={mode === 'simple' ? 'Aktive Rollen in Ihrem System' : 'Rollen mit zugeordneten Scopes und Benutzern'}
        mode={mode}
      >
        {ROLES.map((role) => (
          <SettingsRow
            key={role.name}
            title={role.name}
            subtitle={role.description}
            leading={<ShieldCheckIcon className="h-5 w-5 text-indigo-500" />}
            trailing={
              <div className="flex items-center gap-3">
                {mode === 'expert' && (
                  <div className="flex gap-1">
                    {role.scopes.slice(0, 2).map(scope => (
                      <span key={scope} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">
                        {scope}
                      </span>
                    ))}
                    {role.scopes.length > 2 && (
                      <span className="text-xs text-gray-400">+{role.scopes.length - 2}</span>
                    )}
                  </div>
                )}
                <span className="text-sm text-gray-600">{role.users} Nutzer</span>
                <AkButton variant="ghost" size="sm">Bearbeiten</AkButton>
              </div>
            }
            onClick={() => {}}
            mode={mode}
          />
        ))}
      </SettingsSection>

      {mode === 'expert' && (
        <SettingsSection 
          title="Benutzer-Verwaltung" 
          description="Alle Benutzer und deren Rollenzuordnung"
          mode={mode}
        >
          <SettingsRow
            title="Aktive Benutzer"
            subtitle="Anzahl der aktiven Benutzer"
            leading={<UserIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-gray-600">8</span>}
            mode={mode}
          />
          <SettingsRow
            title="Einladungen ausstehend"
            subtitle="Offene Einladungen"
            leading={<UserIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-gray-600">2</span>}
            mode={mode}
          />
        </SettingsSection>
      )}
    </div>
  )
}
