'use client'

import { 
  CircleStackIcon, 
  BoltIcon, 
  ArchiveBoxIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow } from './SettingsSection'

type SettingsMode = 'simple' | 'expert'

export function SettingsDatabase({ mode }: { mode: SettingsMode }) {
  return (
    <div className="p-6 space-y-6">
      {/* Primary Database */}
      <SettingsSection 
        title="Primäre Datenbank" 
        description={mode === 'simple' ? 'Hauptdatenbank-Verbindung' : 'PostgreSQL Datenbank-Konfiguration'}
        mode={mode}
      >
        <SettingsRow
          title="PostgreSQL"
          subtitle={mode === 'expert' ? 'DATABASE_URL' : 'Datenbank-Verbindung'}
          leading={<CircleStackIcon className="h-5 w-5 text-indigo-500" />}
          trailing={
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Verbunden</span>
            </div>
          }
          mode={mode}
        />
        {mode === 'expert' && (
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-mono text-gray-500 break-all">
              postgresql://postgres:******@localhost:5432/ai_agent_db
            </div>
          </div>
        )}
        {mode === 'simple' && (
          <SettingsRow
            title="Datenbank-Status"
            subtitle="Verbindungsqualität"
            leading={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
            trailing={<span className="text-sm text-gray-600">Optimal</span>}
            mode={mode}
          />
        )}
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="Connection Pool Size"
              subtitle="Anzahl der Verbindungen im Pool"
              leading={<CircleStackIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-gray-600">20</span>}
              mode={mode}
            />
            <SettingsRow
              title="Query Timeout"
              subtitle="Timeout für Datenbankabfragen"
              leading={<CircleStackIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-gray-600">30s</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Caching */}
      <SettingsSection 
        title="Caching" 
        description={mode === 'simple' ? 'Redis Cache für bessere Performance' : 'Redis Cache-Konfiguration'}
        mode={mode}
      >
        <SettingsRow
          title="Redis Cache"
          subtitle={mode === 'expert' ? 'Host: redis, Port: 6379' : 'Cache-Server'}
          leading={<BoltIcon className="h-5 w-5 text-red-500" />}
          trailing={
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Verbunden</span>
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
              trailing={<span className="text-sm text-gray-600">3600s</span>}
              mode={mode}
            />
            <SettingsRow
              title="Max Memory"
              subtitle="Maximaler Speicherverbrauch"
              leading={<BoltIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-gray-600">256MB</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Observability Store - Expert mode */}
      {mode === 'expert' && (
        <SettingsSection 
          title="Observability Store" 
          description="Gespeicherte Objekte in der Datenbank"
          mode={mode}
        >
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {['key', 'team', 'user', 'mcp', 'spend_logs', 'audit_logs'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Database Stats - Simple mode */}
      {mode === 'simple' && (
        <SettingsSection 
          title="Datenbank-Statistiken" 
          description="Übersicht über Ihre Datenbank"
          mode={mode}
        >
          <SettingsRow
            title="Gespeicherte Einträge"
            subtitle="Anzahl der Datensätze"
            leading={<ArchiveBoxIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-gray-600">12.458</span>}
            mode={mode}
          />
          <SettingsRow
            title="Datenbank-Größe"
            subtitle="Gesamtgröße der Datenbank"
            leading={<CircleStackIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-gray-600">2.4 GB</span>}
            mode={mode}
          />
        </SettingsSection>
      )}
    </div>
  )
}
