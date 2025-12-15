'use client'

import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

export type WebsiteView = 'overview' | 'conversations' | 'content' | 'appearance'

import type { ComponentType } from 'react'

const VIEWS: { id: WebsiteView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: ChartBarIcon },
  { id: 'conversations', label: 'Gespräche', icon: ChatBubbleLeftRightIcon },
  { id: 'content', label: 'Wissen & Inhalt', icon: DocumentTextIcon },
  { id: 'appearance', label: 'Design & Widget', icon: PaintBrushIcon },
]

type WebsiteSidebarWidgetProps = {
  activeView: WebsiteView
  onViewSelect: (view: WebsiteView) => void
}

export function WebsiteSidebarWidget({
  activeView,
  onViewSelect,
}: WebsiteSidebarWidgetProps) {
  return (
    <WidgetCard
      title="Website-Bot"
      subtitle="Chat & Lead-Capture"
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
                accent="growth" // Using growth accent (orange) for website/marketing
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
