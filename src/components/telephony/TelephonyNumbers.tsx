'use client'

import { useState } from 'react'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { PlusIcon, PhoneIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

type PhoneNumber = {
  id: string
  number: string
  label: string
  mode: 'reservation' | 'support' | 'appointment'
  voice: string
  status: 'active' | 'inactive'
}

const MOCK_NUMBERS: PhoneNumber[] = [
  { id: '1', number: '+49 89 12345678', label: 'Hauptleitung Restaurant', mode: 'reservation', voice: 'Nova', status: 'active' },
  { id: '2', number: '+49 89 87654321', label: 'Support Hotline', mode: 'support', voice: 'Alloy', status: 'active' },
  { id: '3', number: '+49 151 55566677', label: 'VIP Line', mode: 'appointment', voice: 'Shimmer', status: 'inactive' },
]

export function TelephonyNumbers() {
  const [numbers] = useState<PhoneNumber[]>(MOCK_NUMBERS)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Rufnummern</h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Verwalte deine Telefonnummern und deren Zuweisung.
          </p>
        </div>
        <AkButton variant="primary" leftIcon={<PlusIcon className="h-4 w-4" />}>
          Nummer hinzufügen
        </AkButton>
      </div>

      <div className="grid gap-4">
        {numbers.map((num) => (
          <WidgetCard key={num.id} padding="none" className="overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[var(--ak-color-bg-sidebar)] flex items-center justify-center text-[var(--ak-color-text-secondary)]">
                  <PhoneIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--ak-color-text-primary)]">{num.number}</span>
                    {num.status === 'active' ? (
                      <AkBadge tone="success">Aktiv</AkBadge>
                    ) : (
                      <AkBadge tone="neutral">Inaktiv</AkBadge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-[var(--ak-color-text-secondary)]">
                    <span>{num.label}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--ak-color-border-strong)]" />
                    <span className="capitalize">{num.mode} Mode</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--ak-color-border-strong)]" />
                    <span>Voice: {num.voice}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <AkButton variant="secondary">Konfigurieren</AkButton>
                <AkButton variant="ghost" className="px-2">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </AkButton>
              </div>
            </div>
          </WidgetCard>
        ))}
      </div>
    </div>
  )
}
