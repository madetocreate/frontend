'use client'

import { CheckCircleIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow } from './SettingsSection'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'

type SettingsMode = 'simple' | 'expert'

export function SettingsBilling({ mode }: { mode: SettingsMode }) {
  return (
    <div className="p-6 space-y-6">
      <SettingsSection 
        title="Aktueller Plan" 
        description={mode === 'simple' ? 'Ihr aktueller Abonnement-Plan' : 'Plan-Details und Abrechnungsinformationen'}
        mode={mode}
      >
        <div className="px-4 py-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-gray-900">Enterprise Plan</h3>
                <AkBadge tone="success">Aktiv</AkBadge>
              </div>
              <p className="text-sm text-gray-500">Nächste Abrechnung am 01.01.2026</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-900">
                €299<span className="text-sm text-gray-400 font-normal">/mo</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>Unbegrenzte Agenten</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>Advanced AI Shield</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>Priority Support</span>
            </div>
            {mode === 'expert' && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>Custom Integrations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>Dedicated Support</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <AkButton variant="primary" size="sm">Plan ändern</AkButton>
            <AkButton variant="ghost" size="sm">Zahlungsmethode</AkButton>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection 
        title="Rechnungen" 
        description={mode === 'simple' ? 'Ihre letzten Rechnungen' : 'Rechnungshistorie und Zahlungsdetails'}
        mode={mode}
      >
        {[
          { id: 'INV-2025-012', date: '01.12.2025', amount: '€299.00', status: 'paid' },
          { id: 'INV-2025-011', date: '01.11.2025', amount: '€299.00', status: 'paid' },
          { id: 'INV-2025-010', date: '01.10.2025', amount: '€299.00', status: 'paid' },
        ].map(inv => (
          <SettingsRow
            key={inv.id}
            title={`Rechnung ${inv.id}`}
            subtitle={inv.date}
            leading={<DocumentTextIcon className="h-5 w-5 text-gray-400" />}
            trailing={
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{inv.amount}</span>
                <AkBadge tone="success">Bezahlt</AkBadge>
                <AkButton variant="ghost" size="sm">PDF</AkButton>
              </div>
            }
            mode={mode}
          />
        ))}
      </SettingsSection>

      {mode === 'expert' && (
        <SettingsSection 
          title="Zahlungsmethode" 
          description="Konfigurierte Zahlungsmethoden"
          mode={mode}
        >
          <SettingsRow
            title="Kreditkarte"
            subtitle="**** **** **** 4242"
            leading={<CreditCardIcon className="h-5 w-5" />}
            trailing={<AkButton variant="ghost" size="sm">Bearbeiten</AkButton>}
            mode={mode}
          />
        </SettingsSection>
      )}
    </div>
  )
}
