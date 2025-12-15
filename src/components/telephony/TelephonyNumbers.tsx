'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { PlusIcon, PhoneIcon, EllipsisHorizontalIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNumbers = numbers.filter(num => 
    num.number.includes(searchQuery) || 
    num.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--ak-color-bg-app)]">
      {/* Header - Apple Style */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Rufnummern</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Verwalte deine Telefonnummern und deren Zuweisung
            </p>
          </div>
          <AkButton variant="primary" leftIcon={<PlusIcon className="h-4 w-4" />}>
            Nummer hinzufügen
          </AkButton>
        </div>
        <AkSearchField 
          placeholder="Nummern durchsuchen..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid gap-4 max-w-4xl">
          {filteredNumbers.map((num, i) => (
            <motion.div
              key={num.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <WidgetCard padding="sm" className="apple-glass-enhanced overflow-hidden hover:shadow-[var(--ak-shadow-md)] transition-all">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={num.status === 'active' 
                      ? "h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0"
                      : "h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0"
                    }>
                      <PhoneIcon className={num.status === 'active' ? "h-6 w-6 text-green-600" : "h-6 w-6 text-gray-400"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--ak-color-text-primary)]">{num.number}</span>
                        {num.status === 'active' ? (
                          <AkBadge tone="success" size="sm">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Aktiv
                          </AkBadge>
                        ) : (
                          <AkBadge tone="muted" size="sm">Inaktiv</AkBadge>
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
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <AkButton variant="secondary" size="sm">Konfigurieren</AkButton>
                    <AkButton variant="ghost" size="sm" className="px-2">
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </AkButton>
                  </div>
                </div>
              </WidgetCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
