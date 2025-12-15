'use client'

import clsx from 'clsx'
import {
  DocumentIcon,
  CloudArrowUpIcon,
  ReceiptPercentIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

import type { ComponentType } from 'react'

export type DocumentsView = 'all' | 'uploads' | 'invoices' | 'contracts' | 'shared'

const VIEWS: { id: DocumentsView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Alle Dokumente', icon: DocumentIcon },
  { id: 'uploads', label: 'Hochgeladen', icon: CloudArrowUpIcon },
  { id: 'invoices', label: 'Rechnungen', icon: ReceiptPercentIcon },
  { id: 'contracts', label: 'Verträge', icon: ClipboardDocumentCheckIcon },
  { id: 'shared', label: 'Geteilt', icon: FolderIcon },
]

type DocumentsSidebarWidgetProps = {
  activeView: DocumentsView
  onViewSelect: (view: DocumentsView) => void
}

export function DocumentsSidebarWidget({
  activeView,
  onViewSelect,
}: DocumentsSidebarWidgetProps) {
  return (
    <WidgetCard
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
    >
      <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              Bibliothek
            </h3>
            <ul className="flex flex-col gap-1">
              {VIEWS.map((view) => {
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

          <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              Tags
            </h3>
             <ul className="flex flex-col gap-1">
                {['#wichtig', '#neu', '#archiv'].map(tag => (
                    <li key={tag}>
                        <AkListRow
                            title={tag}
                            leading={<TagIcon className="h-4 w-4 text-gray-400" />}
                            onClick={() => {}}
                        />
                    </li>
                ))}
             </ul>
          </div>
      </div>
    </WidgetCard>
  )
}
