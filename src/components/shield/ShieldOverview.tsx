'use client'

import { useEffect, useState } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { ShieldCheckIcon, ServerStackIcon } from '@heroicons/react/24/outline'

interface HealthData {
    status: string;
    detail?: string;
    [key: string]: unknown;
}

interface RegistryData {
    servers: Record<string, unknown>;
    [key: string]: unknown;
}

export function ShieldOverview() {
    const [health, setHealth] = useState<HealthData | null>(null)
    const [registry, setRegistry] = useState<RegistryData | null>(null)

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/shield/health')
                if (res.ok) {
                    const contentType = res.headers.get('content-type')
                    if (contentType && contentType.includes('application/json')) {
                        const data = await res.json()
                        setHealth(data)
                    } else {
                        setHealth({ status: 'error', detail: 'Invalid response type' })
                    }
                } else {
                    setHealth({ status: 'error', detail: `HTTP ${res.status}` })
                }
            } catch {
                setHealth({ status: 'error', detail: 'Network error' })
            }
        }

        const fetchRegistry = async () => {
            try {
                const res = await fetch('/api/shield/v1/mcp/registry')
                if (res.ok) {
                    const contentType = res.headers.get('content-type')
                    if (contentType && contentType.includes('application/json')) {
                        const data = await res.json()
                        setRegistry(data)
                    } else {
                        setRegistry({ servers: {} })
                    }
                } else {
                    setRegistry({ servers: {} })
                }
            } catch {
                setRegistry({ servers: {} })
            }
        }

        fetchHealth()
        fetchRegistry()
    }, [])

    const serverCount = registry?.servers ? Object.keys(registry.servers).length : 0

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WidgetCard title="System Status" padding="lg">
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${health?.status === 'ok' ? 'bg-[var(--ak-color-success)]' : 'bg-[var(--ak-color-bg-danger-soft)]'}`} />
                            <span className="text-[var(--ak-color-text-primary)] font-medium text-lg">
                                {health?.status === 'ok' ? 'Operational' : 'Systemfehler'}
                            </span>
                        </div>
                        <p className="text-[var(--ak-color-text-secondary)] text-sm">
                            Control Plane ist {health?.status === 'ok' ? 'aktiv' : 'offline'}.
                        </p>
                    </div>
                </WidgetCard>
                
                <WidgetCard title="MCP Server" padding="lg">
                     <div className="flex flex-col gap-2 mt-2">
                         <div className="flex items-center gap-3">
                            <ServerStackIcon className="h-6 w-6 text-[var(--ak-color-accent)]" />
                            <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">
                                {serverCount}
                            </span>
                         </div>
                         <p className="text-[var(--ak-color-text-secondary)] text-sm">
                            Registrierte Tool-Provider
                         </p>
                     </div>
                </WidgetCard>
                
                 <WidgetCard title="Aktive Policies" padding="lg">
                     <div className="flex flex-col gap-2 mt-2">
                         <div className="flex items-center gap-3">
                            <ShieldCheckIcon className="h-6 w-6 text-[var(--ak-color-warning)] text-orange-500" />
                            <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">
                                Active
                            </span>
                         </div>
                         <p className="text-[var(--ak-color-text-secondary)] text-sm">
                            Gateway Protection enabled
                         </p>
                     </div>
                </WidgetCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <WidgetCard title="Gateway Metriken" className="min-h-[300px]">
                    <div className="flex items-center justify-center h-full text-[var(--ak-color-text-muted)]">
                        <p>Lade Grafana Dashboards...</p>
                    </div>
                 </WidgetCard>
                 <WidgetCard title="Letzte Aktivitäten" className="min-h-[300px]">
                    <div className="flex items-center justify-center h-full text-[var(--ak-color-text-muted)]">
                        <p>Keine Logs verfügbar</p>
                    </div>
                 </WidgetCard>
            </div>
        </div>
    )
}
