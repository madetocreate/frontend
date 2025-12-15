'use client'

import clsx from 'clsx'
import {
  HomeIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline'

import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

export type ShieldView = 'overview' | 'registry' | 'policies' | 'logs'

import type { ComponentType } from 'react'

const VIEWS: { id: ShieldView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: HomeIcon },
  { id: 'registry', label: 'MCP Registry', icon: ServerStackIcon },
  { id: 'policies', label: 'Policies', icon: ShieldCheckIcon },
  { id: 'logs', label: 'Logs & Tracing', icon: CommandLineIcon },
]

type ShieldSidebarWidgetProps = {
  activeView: ShieldView
  onViewSelect: (view: ShieldView) => void
}

export function ShieldSidebarWidget({
  activeView,
  onViewSelect,
}: ShieldSidebarWidgetProps) {
  return (
    <WidgetCard
      title="AI Shield"
      subtitle="Sicherheit & Kontrolle"
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
                // Using 'settings' accent for now as it's neutral/technical
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
