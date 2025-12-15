'use client'

import {
  PhoneIcon,
  TableCellsIcon,
  Cog6ToothIcon,
  QueueListIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

export type TelephonyView = 'overview' | 'logs' | 'configuration' | 'numbers'

export type TelephonyItem = {
  id: string
  title: string
  caller?: string
  duration?: string
  mode?: 'reservierung' | 'termine' | 'support' | 'mailbox'
  timestamp?: string
}

import type { ComponentType } from 'react'

const VIEWS: { id: TelephonyView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: PhoneIcon },
  { id: 'logs', label: 'Anruf-Protokoll', icon: QueueListIcon },
  { id: 'numbers', label: 'Rufnummern', icon: TableCellsIcon },
  { id: 'configuration', label: 'Konfiguration', icon: Cog6ToothIcon },
]

type TelephonySidebarWidgetProps = {
  activeView: TelephonyView
  onViewSelect: (view: TelephonyView) => void
}

export function TelephonySidebarWidget({
  activeView,
  onViewSelect,
}: TelephonySidebarWidgetProps) {
  return (
    <WidgetCard
      title="Telefon-Assistent"
      subtitle="Voice & Reservierungen"
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
    >
      <ul className="flex flex-col gap-1">
        {VIEWS.map((view) => {
          const isActive = view.id === activeView
          const Icon = view.icon
          return (
            <li key={view.id}>
              <AkListRow
                accent="telephony"
                selected={isActive}
                title={view.label}
                leading={
                  <Icon
                    className={clsx(
                      'h-5 w-5',
                      isActive
                        ? 'text-[var(--ak-color-text-primary)]'
                        : 'text-[var(--ak-color-text-secondary)]',
                    )}
                  />
                }
                onClick={() => onViewSelect(view.id)}
              />
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}
