'use client'

import { useState } from 'react'
import { 
  ServerIcon, 
  WrenchScrewdriverIcon, 
  ArrowPathIcon,
  ClockIcon,
  BoltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsToggle, SettingsInput } from './SettingsSection'

type SettingsMode = 'simple' | 'expert'

export function SettingsAgents({ mode }: { mode: SettingsMode }) {
  const [mcpEnabled, setMcpEnabled] = useState(true)
  const [mcpUrl, setMcpUrl] = useState('http://127.0.0.1:9000/mcp')
  const [mcpName, setMcpName] = useState('simple-gpt-mcp')
  const [maxRetries, setMaxRetries] = useState('3')
  const [sessionTimeout, setSessionTimeout] = useState('20.0')
  const [retryBackoffBase, setRetryBackoffBase] = useState('0.5')
  const [retryBackoffMax, setRetryBackoffMax] = useState('8.0')

  return (
    <div className="p-6 space-y-6">
      {/* MCP Server Configuration */}
      <SettingsSection 
        title="Model Context Protocol (MCP)" 
        description={mode === 'simple' ? 'Externe Tools und Agenten verbinden' : 'MCP Server für erweiterte Agent-Funktionen'}
        mode={mode}
      >
        <SettingsRow
          title="MCP Server Status"
          subtitle={mode === 'expert' ? 'Verbindungsstatus zum MCP Server' : 'Server-Verbindung'}
          leading={<ServerIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
          trailing={
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--ak-semantic-success)] rounded-full animate-pulse"></div>
              <span className="text-sm text-[var(--ak-semantic-success)] font-medium">Online</span>
            </div>
          }
          mode={mode}
        />
        <SettingsToggle
          title="MCP Tools aktivieren"
          subtitle={mode === 'expert' ? 'ENABLE_MCP_TOOLS' : 'Externe Tools verwenden'}
          leading={<WrenchScrewdriverIcon className="h-5 w-5" />}
          checked={mcpEnabled}
          onChange={setMcpEnabled}
          mode={mode}
        />
        {mcpEnabled && (
          <>
            <SettingsInput
              title="MCP Server URL"
              subtitle={mode === 'expert' ? 'MCP_SERVER_URL' : 'Server-Adresse'}
              leading={<ServerIcon className="h-5 w-5 text-[var(--ak-semantic-info)]" />}
              value={mcpUrl}
              onChange={setMcpUrl}
              mode={mode}
            />
            {mode === 'expert' && (
              <SettingsInput
                title="MCP Server Name"
                subtitle="MCP_NAME"
                leading={<ServerIcon className="h-5 w-5" />}
                value={mcpName}
                onChange={setMcpName}
                mode={mode}
              />
            )}
          </>
        )}
      </SettingsSection>

      {/* Resilience & Retries - Expert mode */}
      {mode === 'expert' && mcpEnabled && (
        <SettingsSection 
          title="Resilience & Retries" 
          description="Fehlerbehandlung und Wiederholungslogik"
          mode={mode}
        >
          <SettingsInput
            title="Max Retry Attempts"
            subtitle="MCP_MAX_RETRY_ATTEMPTS"
            leading={<ArrowPathIcon className="h-5 w-5" />}
            value={maxRetries}
            onChange={setMaxRetries}
            type="number"
            mode={mode}
          />
          <SettingsInput
            title="Session Timeout"
            subtitle="MCP_CLIENT_SESSION_TIMEOUT_SECONDS (Sekunden)"
            leading={<ClockIcon className="h-5 w-5" />}
            value={sessionTimeout}
            onChange={setSessionTimeout}
            type="number"
            mode={mode}
          />
          <SettingsInput
            title="Retry Backoff Base"
            subtitle="MCP_RETRY_BACKOFF_SECONDS_BASE (Sekunden)"
            leading={<BoltIcon className="h-5 w-5" />}
            value={retryBackoffBase}
            onChange={setRetryBackoffBase}
            type="number"
            mode={mode}
          />
          <SettingsInput
            title="Retry Backoff Max"
            subtitle="MCP_RETRY_BACKOFF_SECONDS_MAX (Sekunden)"
            leading={<BoltIcon className="h-5 w-5" />}
            value={retryBackoffMax}
            onChange={setRetryBackoffMax}
            type="number"
            mode={mode}
          />
        </SettingsSection>
      )}

      {/* Agent Configuration - Simple mode */}
      {mode === 'simple' && (
        <SettingsSection 
          title="Agent-Konfiguration" 
          description="Grundlegende Agent-Einstellungen"
          mode={mode}
        >
          <SettingsRow
            title="Aktive Agenten"
            subtitle="Anzahl der laufenden Agenten"
            leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
            trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">12</span>}
            mode={mode}
          />
          <SettingsRow
            title="Verfügbare Tools"
            subtitle="Anzahl der konfigurierten Tools"
            leading={<WrenchScrewdriverIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">24</span>}
            mode={mode}
          />
        </SettingsSection>
      )}

      {/* Advanced Agent Settings - Expert mode */}
      {mode === 'expert' && (
        <>
          <SettingsSection 
            title="Agent-Typen" 
            description="Konfiguration verschiedener Agent-Typen"
            mode={mode}
          >
            <SettingsRow
              title="Customer Success Agent"
              subtitle="Kundenbetreuung und Support"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Aktiv</span>}
              mode={mode}
            />
            <SettingsRow
              title="Website Agent"
              subtitle="Website-Chat und Interaktionen"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Aktiv</span>}
              mode={mode}
            />
            <SettingsRow
              title="Marketing Agent"
              subtitle="Content-Generierung und Kampagnen"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Aktiv</span>}
              mode={mode}
            />
            <SettingsRow
              title="Knowledge Agent"
              subtitle="Wissensbasis und Dokumentation"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Aktiv</span>}
              mode={mode}
            />
            <SettingsRow
              title="Documents Agent"
              subtitle="Dokumentenverarbeitung"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Aktiv</span>}
              mode={mode}
            />
          </SettingsSection>

          <SettingsSection 
            title="Tool-Konfiguration" 
            description="Verfügbare Tools und deren Konfiguration"
            mode={mode}
          >
            <SettingsRow
              title="Gmail Integration"
              subtitle="E-Mail-Verwaltung über Gmail API"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Verfügbar</span>}
              mode={mode}
            />
            <SettingsRow
              title="Calendar Integration"
              subtitle="Google Calendar Integration"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Verfügbar</span>}
              mode={mode}
            />
            <SettingsRow
              title="Drive Integration"
              subtitle="Google Drive Dateizugriff"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Verfügbar</span>}
              mode={mode}
            />
            <SettingsRow
              title="Telegram Bot"
              subtitle="Telegram Bot Integration"
              leading={<CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
              trailing={<span className="text-sm text-[var(--ak-semantic-success)] font-medium">Verfügbar</span>}
              mode={mode}
            />
          </SettingsSection>
        </>
      )}
    </div>
  )
}
