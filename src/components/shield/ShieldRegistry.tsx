'use client'

import { useEffect, useState } from 'react'
import { AkButton } from '@/components/ui/AkButton'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { PlusIcon, GlobeAltIcon, CommandLineIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Server {
    server_id?: string;
    url?: string;
    transport?: string;
    [key: string]: unknown;
}

export function ShieldRegistry() {
    const [servers, setServers] = useState<Server[]>([])
    const [loading, setLoading] = useState(true)

    const fetchServers = async () => {
        setLoading(true)
        try {
            const { authedFetch } = await import('@/lib/api/authedFetch')
            const res = await authedFetch('/api/shield/v1/mcp/registry')
            if (res.ok) {
                const contentType = res.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                    const data = await res.json()
                    if (data && data.servers) {
                        setServers(Object.values(data.servers))
                    } else {
                        setServers([])
                    }
                } else {
                    console.warn('Shield API returned non-JSON')
                    setServers([])
                }
            } else {
                console.warn('Shield API error', res.status)
                setServers([])
            }
        } catch (e) {
            console.error('Shield API network error', e)
            setServers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchServers()
    }, [])

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Registrierte Server</h2>
                <div className="flex gap-2">
                    <AkButton 
                        leftIcon={<ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />} 
                        variant="ghost" 
                        onClick={fetchServers}
                    >
                        Aktualisieren
                    </AkButton>
                    <AkButton leftIcon={<PlusIcon className="h-4 w-4" />} variant="primary">Server hinzufügen</AkButton>
                </div>
            </div>
            
            <div className="grid gap-4">
                {servers.length === 0 && !loading ? (
                    <div className="text-[var(--ak-color-text-secondary)] text-center py-10 bg-[var(--ak-color-bg-surface)] rounded-xl border border-[var(--ak-color-border-subtle)]">
                        Keine Server registriert
                    </div>
                ) : (
                    servers.map((server) => (
                         <WidgetCard key={server.server_id || Math.random()} padding="sm" className="ak-bg-glass hover:border-[var(--ak-color-border-strong)] transition-colors cursor-pointer">
                            <AkListRow
                                title={<span className="text-sm font-medium text-[var(--ak-color-text-primary)]">{server.server_id || 'Unknown ID'}</span>}
                                subtitle={<span className="text-xs text-[var(--ak-color-text-secondary)] truncate block">{server.url || 'No URL'}</span>}
                                leading={server.transport === 'sse' ? <GlobeAltIcon className="h-5 w-5 text-[var(--ak-semantic-info)]"/> : <CommandLineIcon className="h-5 w-5 text-[var(--ak-accent-documents)]"/>}
                                trailing={
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${server.preset === 'read_only' ? 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] border-[var(--ak-semantic-success-soft)]' : 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)] border-[var(--ak-semantic-warning-soft)]'}`}>
                                            {(() => {
                                              const preset = (server as { preset?: unknown }).preset
                                              return typeof preset === 'string' ? preset : 'read_only'
                                            })()}
                                        </span>
                                    </div>
                                }
                            />
                         </WidgetCard>
                    ))
                )}
            </div>
        </div>
    )
}
