'use client'

import { useState } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkButton } from '@/components/ui/AkButton'
import { ArrowPathIcon, FunnelIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type LogEntry = {
  id: string
  timestamp: string
  model: string
  action: 'allowed' | 'blocked' | 'flagged'
  trigger: string
  latency: string
  user: string
}

const MOCK_LOGS: LogEntry[] = [
  { id: 'req_001', timestamp: '10:42:15', model: 'gpt-4o', action: 'allowed', trigger: 'chat.completion', latency: '1.2s', user: 'user_a' },
  { id: 'req_002', timestamp: '10:42:12', model: 'claude-3-5-sonnet', action: 'allowed', trigger: 'tool:get_weather', latency: '0.8s', user: 'user_b' },
  { id: 'req_003', timestamp: '10:41:58', model: 'gpt-4o', action: 'blocked', trigger: 'tool:delete_users', latency: '0.1s', user: 'internal_test' },
  { id: 'req_004', timestamp: '10:41:30', model: 'gpt-3.5-turbo', action: 'allowed', trigger: 'chat.completion', latency: '0.5s', user: 'website_visitor' },
  { id: 'req_005', timestamp: '10:40:15', model: 'gpt-4o', action: 'flagged', trigger: 'pii:email_detected', latency: '1.4s', user: 'user_a' },
  { id: 'req_006', timestamp: '10:39:22', model: 'gpt-4o', action: 'allowed', trigger: 'tool:search_knowledge', latency: '2.1s', user: 'user_c' },
  { id: 'req_007', timestamp: '10:38:10', model: 'claude-3-opus', action: 'blocked', trigger: 'prompt_injection', latency: '0.2s', user: 'attacker_sim' },
  { id: 'req_008', timestamp: '10:35:55', model: 'gpt-4o', action: 'allowed', trigger: 'chat.completion', latency: '1.1s', user: 'user_b' },
]

export function ShieldLogs() {
  const [query, setQuery] = useState('')
  const [logs, setLogs] = useState(MOCK_LOGS)

  const handleRefresh = () => {
    // In a real app, this would fetch new logs
    const newLog: LogEntry = {
        id: `req_${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString('de-DE'),
        model: 'gpt-4o',
        action: 'allowed',
        trigger: 'chat.completion',
        latency: `${(Math.random() * 2).toFixed(1)}s`,
        user: 'system'
    }
    setLogs(prev => [newLog, ...prev])
  }

  const filteredLogs = logs.filter(log => 
    log.id.includes(query) || 
    log.trigger.includes(query) ||
    log.user.includes(query)
  )

  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Logs & Tracing</h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Überwachung der Anfragen und Sicherheits-Events.
            </p>
        </div>
        <div className="flex gap-2">
            <AkButton variant="secondary" leftIcon={<ArrowPathIcon className="h-4 w-4"/>} onClick={handleRefresh}>
                Refresh
            </AkButton>
            <AkButton variant="secondary" leftIcon={<FunnelIcon className="h-4 w-4"/>}>
                Filter
            </AkButton>
        </div>
      </div>

      <div className="shrink-0">
        <AkSearchField 
            placeholder="Logs durchsuchen (ID, Trigger, User)..." 
            value={query} 
            onChange={setQuery} 
        />
      </div>

      <WidgetCard padding="sm" className="flex-1 overflow-hidden flex flex-col ak-bg-glass">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--ak-color-bg-sidebar)] border-b border-[var(--ak-color-border-subtle)]">
                    <tr>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Zeit</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">ID</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Trigger / Action</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Model</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">User</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Latency</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface)]">
                    {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                            <td className="px-4 py-3">
                                {log.action === 'allowed' && <span className="flex items-center gap-1.5 text-[var(--ak-semantic-success)]"><CheckCircleIcon className="h-4 w-4" /> <span className="text-xs font-medium">Allow</span></span>}
                                {log.action === 'blocked' && <span className="flex items-center gap-1.5 text-[var(--ak-semantic-danger)]"><XCircleIcon className="h-4 w-4" /> <span className="text-xs font-medium">Block</span></span>}
                                {log.action === 'flagged' && <span className="flex items-center gap-1.5 text-[var(--ak-semantic-warning)]"><ExclamationTriangleIcon className="h-4 w-4" /> <span className="text-xs font-medium">Flag</span></span>}
                            </td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)] font-mono text-xs">{log.timestamp}</td>
                            <td className="px-4 py-3 font-mono text-xs text-[var(--ak-color-text-secondary)]">{log.id}</td>
                            <td className="px-4 py-3">
                                <span className={log.action === 'blocked' ? 'text-[var(--ak-semantic-danger)] font-medium' : 'text-[var(--ak-color-text-primary)]'}>
                                    {log.trigger}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">
                                <AkBadge tone="muted">{log.model}</AkBadge>
                            </td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">{log.user}</td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)] text-right font-mono text-xs">{log.latency}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </WidgetCard>
    </div>
  )
}
