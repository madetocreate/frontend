'use client'

import clsx from 'clsx'
import {
  Squares2X2Icon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PhoneIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'
import type { PracticeView } from './PracticeDashboard'

const VIEWS: { id: PracticeView; label: string; icon: typeof Squares2X2Icon; category: string }[] = [
  { id: 'overview', label: 'Übersicht', icon: Squares2X2Icon, category: 'Haupt' },
  { id: 'patients', label: 'Patienten', icon: UserGroupIcon, category: 'Haupt' },
  { id: 'appointments', label: 'Termine', icon: CalendarIcon, category: 'Haupt' },
  { id: 'documents', label: 'Dokumente', icon: DocumentTextIcon, category: 'Haupt' },
  { id: 'statistics', label: 'Statistiken', icon: ChartBarIcon, category: 'Haupt' },
  { id: 'phone', label: 'Telefon-Empfang', icon: PhoneIcon, category: 'Kommunikation' },
  { id: 'forms', label: 'Formulare', icon: ClipboardDocumentListIcon, category: 'Verwaltung' },
  { id: 'billing', label: 'Abrechnung', icon: CreditCardIcon, category: 'Verwaltung' },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon, category: 'Sicherheit' },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon, category: 'Verwaltung' },
]

type PracticeSidebarWidgetProps = {
  activeView: PracticeView
  onViewSelect: (view: PracticeView) => void
}

export function PracticeSidebarWidget({
  activeView,
  onViewSelect,
}: PracticeSidebarWidgetProps) {
  const grouped = VIEWS.reduce((acc, view) => {
    if (!acc[view.category]) acc[view.category] = []
    acc[view.category].push(view)
    return acc
  }, {} as Record<string, typeof VIEWS>)

  return (
    <WidgetCard
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
    >
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([category, views]) => (
          <div key={category} className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              {category}
            </h3>
            <ul className="flex flex-col gap-1">
              {views.map((view) => {
                const isActive = view.id === activeView
                const Icon = view.icon
                return (
                  <li key={view.id}>
                    <AkListRow
                      accent="neutral"
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
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

export type { PracticeView }

