'use client'

import { useState } from 'react'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { 
    UserPlusIcon, 
    FunnelIcon, 
    PhoneIcon,
    EnvelopeIcon,
    EllipsisHorizontalIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { CustomersView } from './CustomersSidebarWidget'
import { CustomerDetailsDrawer } from './CustomerDetailsDrawer'

// Mock Data
const OPPORTUNITIES = [
    { id: 'o1', type: 'upsell', customer: 'Tech Solutions KG', potential: 'High', message: 'Vertrag läuft in 30 Tagen aus. Upsell-Chance für Premium-Plan.' },
    { id: 'o2', type: 'risk', customer: 'StartUp Inc.', potential: 'High', message: 'Weniger Login-Aktivität in den letzten 7 Tagen. Churn-Risiko.' },
]

const CUSTOMERS = [
    { id: 'c1', name: 'Max Mustermann', company: 'Acme GmbH', status: 'Active', stage: 'Negotiation', value: '€12.500', lastContact: '2h', tags: ['VIP', 'Tech'] },
    { id: 'c2', name: 'Julia Design', company: 'Creative Studio', status: 'Lead', stage: 'Discovery', value: '€4.200', lastContact: '1d', tags: ['Creative'] },
    { id: 'c3', name: 'Tech Solutions KG', company: 'Tech Sol', status: 'Active', stage: 'Closed Won', value: '€45.000', lastContact: '3d', tags: ['Enterprise'] },
    { id: 'c4', name: 'Dr. Müller', company: 'Praxis Müller', status: 'Active', stage: 'Proposal', value: '€8.900', lastContact: '5h', tags: ['Healthcare'] },
    { id: 'c5', name: 'Global Trade AG', company: 'Global Trade', status: 'Active', stage: 'Renewal', value: '€120.000', lastContact: '1w', tags: ['Enterprise', 'Logistics'] },
]

export function CustomersDashboard({ view }: { view?: CustomersView }) {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null) // Replace any with type

  // Mock handler for drawer
  const handleCustomerClick = (customer: any) => {
    // Needs a full customer object with email etc. enriching mock
    setSelectedCustomer({ ...customer, email: 'demo@example.com', phone: '+49 123 4567890', ltv: 12500 })
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                Sales Intelligence
            </h1>
            <div className="flex items-center gap-3">
                <div className="w-64">
                    <AkSearchField 
                        placeholder="Kunden suchen..." 
                        value={search}
                        onChange={setSearch}
                    />
                </div>
                <AkButton variant="secondary" leftIcon={<FunnelIcon className="h-4 w-4"/>}>Filter</AkButton>
                <AkButton variant="primary" leftIcon={<UserPlusIcon className="h-4 w-4"/>}>Neu</AkButton>
            </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6 space-y-8">
            
            {/* AI Insights Section */}
            <div>
                <h2 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
                    AI Opportunities & Risiken
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {OPPORTUNITIES.map((opp) => (
                        <div key={opp.id} className="p-5 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:scale-[1.01] transition-transform cursor-pointer relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full ${opp.type === 'upsell' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {opp.type === 'upsell' ? (
                                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className="font-semibold text-[var(--ak-color-text-primary)]">{opp.customer}</span>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${opp.type === 'upsell' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {opp.type === 'upsell' ? 'Opportunity' : 'Risk Warning'}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed mb-3">
                                {opp.message}
                            </p>
                            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button className="text-xs font-medium text-[var(--ak-color-accent)] hover:underline flex items-center gap-1">
                                    <ChatBubbleLeftRightIcon className="w-3 h-3" />
                                    Aktion starten
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions / Segments */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 apple-glass-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] flex flex-col items-center justify-center text-center gap-2 hover:bg-[var(--ak-color-bg-hover)] transition-colors cursor-pointer group shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PhoneIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Call List (3)</span>
                </div>
                <div className="p-4 apple-glass-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] flex flex-col items-center justify-center text-center gap-2 hover:bg-[var(--ak-color-bg-hover)] transition-colors cursor-pointer group shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Follow-Ups (5)</span>
                </div>
                <div className="p-4 apple-glass-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] flex flex-col items-center justify-center text-center gap-2 hover:bg-[var(--ak-color-bg-hover)] transition-colors cursor-pointer group shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <SparklesIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Smart Segments</span>
                </div>
                <div className="p-4 apple-glass-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] flex flex-col items-center justify-center text-center gap-2 hover:bg-[var(--ak-color-bg-hover)] transition-colors cursor-pointer group shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ClockIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Overdue</span>
                </div>
            </div>

            {/* Recent List */}
            <div>
                <h2 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-4">Aktive Kunden</h2>
                <div className="bg-[var(--ak-color-bg-surface)] rounded-2xl border border-[var(--ak-color-border-subtle)] shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--ak-color-bg-surface-muted)] border-b border-[var(--ak-color-border-subtle)]">
                            <tr>
                                <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Kunde</th>
                                <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
                                <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">Pipeline Stage</th>
                                <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)]">LTV</th>
                                <th className="px-6 py-4 font-medium text-[var(--ak-color-text-secondary)] text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ak-color-border-hairline)]">
                            {CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((customer) => (
                                <tr 
                                    key={customer.id} 
                                    className="hover:bg-[var(--ak-color-bg-hover)] cursor-pointer transition-colors"
                                    onClick={() => handleCustomerClick(customer)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-600 border border-indigo-200 shadow-sm">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[var(--ak-color-text-primary)]">{customer.name}</div>
                                                <div className="text-xs text-[var(--ak-color-text-secondary)]">{customer.company}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <AkBadge tone={customer.status === 'Active' ? 'success' : customer.status === 'Lead' ? 'warning' : 'muted'}>
                                            {customer.status}
                                        </AkBadge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[var(--ak-color-text-primary)]">{customer.stage}</span>
                                            <div className="w-24 h-1 bg-[var(--ak-color-bg-surface-muted)] rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[var(--ak-color-accent)] rounded-full" 
                                                    style={{ width: customer.stage === 'Closed Won' ? '100%' : customer.stage === 'Negotiation' ? '75%' : '25%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-[var(--ak-color-text-primary)]">
                                        {customer.value}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] p-2 rounded-lg hover:bg-[var(--ak-color-bg-surface-muted)] transition-colors">
                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>

        <CustomerDetailsDrawer 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)} 
        />
    </div>
  )
}
