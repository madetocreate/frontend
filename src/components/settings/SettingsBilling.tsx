'use client'

import { useState } from 'react'
import { CheckCircleIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow } from './SettingsSection'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'

type SettingsMode = 'simple' | 'expert'

export function SettingsBilling({ mode }: { mode: SettingsMode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async (planId: 'base_plan' | 'pro_plan' | 'premium_plan' = 'pro_plan') => {
    setIsLoading(true)
    setError(null)
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          interval: 'month',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (data.error === 'stripe_not_configured') {
          setError('Stripe ist nicht konfiguriert. Bitte kontaktiere den Support.')
          return
        }
        throw new Error(data.message || 'Failed to create checkout session')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Checkout-Session')
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (data.error === 'stripe_not_configured') {
          setError('Stripe ist nicht konfiguriert. Bitte kontaktiere den Support.')
          return
        }
        if (data.error === 'no_subscription') {
          setError('Kein Abonnement gefunden. Bitte erstelle zuerst ein Abonnement.')
          return
        }
        throw new Error(data.message || 'Failed to create portal session')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL returned')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Öffnen des Billing-Portals')
      setIsLoading(false)
    }
  }
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Abrechnung</h2>
        <p className="text-sm text-[var(--ak-color-text-muted)] font-medium mt-1">
          Verwalte deine Abrechnung, Zahlungsmethoden und deinen Plan.
        </p>
      </div>
      <SettingsSection 
        title="Aktueller Plan" 
        description={mode === 'simple' ? 'Ihr aktueller Abonnement-Plan' : 'Plan-Details und Abrechnungsinformationen'}
        mode={mode}
      >
        <div className="px-4 py-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-[var(--ak-color-text-primary)]">Enterprise Plan</h3>
                <AkBadge tone="success">Aktiv</AkBadge>
              </div>
              <p className="text-sm text-[var(--ak-color-text-secondary)]">Nächste Abrechnung am 01.01.2026</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-[var(--ak-color-text-primary)]">
                €299<span className="text-sm text-[var(--ak-color-text-muted)] font-normal">/mo</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-primary)]">
              <CheckCircleIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
              <span>Unbegrenzte Agenten</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-primary)]">
              <CheckCircleIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
              <span>Advanced AI Shield</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-primary)]">
              <CheckCircleIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
              <span>Priority Support</span>
            </div>
            {mode === 'expert' && (
              <>
                <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-primary)]">
                  <CheckCircleIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
                  <span>Custom Integrations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-primary)]">
                  <CheckCircleIcon className="h-4 w-4 text-[var(--ak-semantic-success)]" />
                  <span>Dedicated Support</span>
                </div>
              </>
            )}
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-[var(--ak-color-status-danger-soft)] border border-[var(--ak-color-status-danger-border)] text-sm text-[var(--ak-color-status-danger-text)] mb-4">
              {error}
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t border-[var(--ak-color-border-subtle)]">
            <AkButton 
              variant="primary" 
              size="sm"
              onClick={() => handleUpgrade('pro_plan')}
              disabled={isLoading}
            >
              {isLoading ? 'Wird geladen...' : 'Upgrade'}
            </AkButton>
            <AkButton 
              variant="ghost" 
              size="sm"
              onClick={handleManageBilling}
              disabled={isLoading}
            >
              {isLoading ? 'Wird geladen...' : 'Billing verwalten'}
            </AkButton>
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
            leading={<DocumentTextIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />}
            trailing={
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">{inv.amount}</span>
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
