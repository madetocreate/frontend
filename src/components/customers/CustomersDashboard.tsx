'use client'

import { useState } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { 
    UserPlusIcon, 
    FunnelIcon, 
    PhoneIcon,
    EnvelopeIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { CustomersView } from './CustomersSidebarWidget'

const CUSTOMERS = [
    { id: 'c1', name: 'Max Mustermann', company: 'Acme GmbH', status: 'Active', stage: 'Negotiation', value: '€12.500', lastContact: '2h' },
    { id: 'c2', name: 'Julia Design', company: 'Creative Studio', status: 'Lead', stage: 'Discovery', value: '€4.200', lastContact: '1d' },
    { id: 'c3', name: 'Tech Solutions KG', company: 'Tech Sol', status: 'Active', stage: 'Closed Won', value: '€45.000', lastContact: '3d' },
    { id: 'c4', name: 'StartUp Inc.', company: 'StartUp', status: 'Churned', stage: '-', value: '€0', lastContact: '1mo' },
    { id: 'c5', name: 'Dr. Müller', company: 'Praxis Müller', status: 'Active', stage: 'Proposal', value: '€8.900', lastContact: '5h' },
]

export function CustomersDashboard({ view }: { view?: CustomersView }) {
  const [search, setSearch] = useState('')

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                {view === 'all' && 'Alle Kunden'}
                {view === 'opportunities' && 'Chancen & Pipeline'}
                {view === 'active' && 'Aktive Kunden'}
                {view === 'archived' && 'Archiv'}
                {!view && 'Kunden'}
            </h1>
            <div className="flex items-center gap-3">
                <div className="w-64">
                    <AkSearchField 
                        placeholder="Suchen..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <AkButton variant="secondary" leftIcon={<FunnelIcon className="h-4 w-4"/>}>Filter</AkButton>
                <AkButton variant="primary" leftIcon={<UserPlusIcon className="h-4 w-4"/>}>Neu</AkButton>
            </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
            <WidgetCard padding="none">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--ak-color-bg-sidebar)] border-b border-[var(--ak-color-border-subtle)]">
                        <tr>
                            <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Name</th>
                            <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Firma</th>
                            <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
                            <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Pipeline</th>
                            <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Wert</th>
                            <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Zuletzt</th>
                            <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--ak-color-border-hairline)]">
                        {CUSTOMERS.map((customer) => (
                            <tr key={customer.id} className="hover:bg-[var(--ak-color-bg-hover)] cursor-pointer group">
                                <td className="px-4 py-3 font-medium text-[var(--ak-color-text-primary)]">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-200">
                                            {customer.name.charAt(0)}
                                        </div>
                                        {customer.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{customer.company}</td>
                                <td className="px-4 py-3">
                                    <AkBadge tone={customer.status === 'Active' ? 'success' : customer.status === 'Churned' ? 'error' : 'neutral'}>
                                        {customer.status}
                                    </AkBadge>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{customer.stage}</td>
                                <td className="px-4 py-3 font-mono text-gray-600">{customer.value}</td>
                                <td className="px-4 py-3 text-gray-400 text-xs">{customer.lastContact}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50">
                                            <PhoneIcon className="h-4 w-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-md hover:bg-indigo-50">
                                            <EnvelopeIcon className="h-4 w-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                            <EllipsisHorizontalIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </WidgetCard>
        </main>
    </div>
  )
}
