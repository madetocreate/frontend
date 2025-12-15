'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkBadge } from '@/components/ui/AkBadge'
import { AIActions } from '@/components/ui/AIActions'
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'

type CustomerDetailsDrawerProps = {
  customerId: string
  onClose: () => void
}

export function CustomerDetailsDrawer({ customerId, onClose }: CustomerDetailsDrawerProps) {
  // Mock data based on ID
  const customer = {
      id: customerId,
      name: 'Max Mustermann',
      role: 'CEO',
      company: 'Acme GmbH',
      email: 'max@acme.com',
      phone: '+49 123 456789',
      stage: 'Verhandlung',
      value: '12.500 €',
      tags: ['VIP', 'Entscheider']
  }

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
        {/* Header */}
        <div className="flex-none p-6 border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] backdrop-blur-md">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm border border-blue-200">
                        {customer.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)]">{customer.name}</h2>
                        <p className="text-sm text-[var(--ak-color-text-secondary)]">{customer.role} bei {customer.company}</p>
                        <div className="flex gap-2 mt-2">
                             {customer.tags.map(tag => <AkBadge key={tag} tone="neutral" size="sm">{tag}</AkBadge>)}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            
            <div className="flex gap-2 mt-4">
                <AkButton className="flex-1" leftIcon={<PhoneIcon className="h-4 w-4"/>}>Anrufen</AkButton>
                <AkButton className="flex-1" variant="secondary" leftIcon={<EnvelopeIcon className="h-4 w-4"/>}>Email</AkButton>
                <AkButton className="flex-none w-10 px-0" variant="ghost" leftIcon={<EllipsisHorizontalIcon className="h-5 w-5 mx-auto"/>} />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* AI Actions */}
            <AIActions context="customer" />
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                        <CurrencyDollarIcon className="h-3 w-3" /> Potential
                    </p>
                    <p className="text-lg font-bold text-green-700">{customer.value}</p>
                 </div>
                 <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> Nächster Schritt
                    </p>
                    <p className="text-sm font-semibold text-blue-700">Meeting Fr. 14:00</p>
                 </div>
            </div>

            {/* Kontakt */}
            <WidgetCard title="Kontakt" padding="none">
                <div className="divide-y divide-[var(--ak-color-border-hairline)]">
                    <AkListRow 
                        title="Email" 
                        subtitle={customer.email} 
                        leading={<EnvelopeIcon className="h-4 w-4 text-gray-400"/>} 
                        trailing={<AkButton variant="ghost" size="sm">Kopieren</AkButton>}
                    />
                    <AkListRow 
                        title="Telefon" 
                        subtitle={customer.phone} 
                        leading={<PhoneIcon className="h-4 w-4 text-gray-400"/>} 
                    />
                </div>
            </WidgetCard>

            {/* Pipeline / Deals */}
            <WidgetCard title="Pipeline" padding="none">
                 <div className="p-4 bg-[var(--ak-color-bg-surface)]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Q1 Enterprise Lizenz</span>
                        <span className="text-sm font-bold text-[var(--ak-color-text-primary)]">12.500 €</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Discovery</span>
                        <span className="font-medium text-blue-600">Verhandlung</span>
                        <span>Closed</span>
                    </div>
                 </div>
            </WidgetCard>

            {/* Notizen */}
            <WidgetCard title="Notizen" padding="sm" action={<AkButton variant="ghost" size="sm" leftIcon={<PencilIcon className="h-3 w-3"/>}>Neu</AkButton>}>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--ak-color-text-primary)]">
                                Interesse an der AI Shield Integration gezeigt. Budgetfreigabe erwartet bis Ende der Woche.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Gestern, 14:30 • Von Dir</p>
                        </div>
                    </div>
                     <div className="flex gap-3">
                        <div className="mt-1">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <PhoneIcon className="h-4 w-4 text-gray-500" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--ak-color-text-primary)]">
                                Intro Call war positiv. Technischer Ansprechpartner ist Herr Schmidt.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Vor 3 Tagen • Von Anna</p>
                        </div>
                    </div>
                </div>
            </WidgetCard>

        </div>
    </div>
  )
}
