'use client'

import React, { useState, useMemo } from 'react'
import {
  DocumentIcon,
  CloudArrowUpIcon,
  ReceiptPercentIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerSectionTitle, 
  DrawerListRow
} from '@/components/ui/drawer-kit'

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
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => v.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Dokumente" 
        onSearch={setSearch} 
      />

      <div className="flex-1 overflow-y-auto ak-scrollbar px-2 pb-4 mt-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5">
            <ul className="flex flex-col gap-0.5">
              {filteredViews.map((view) => {
                const isActive = view.id === activeView
                const Icon = view.icon
                return (
                  <li key={view.id}>
                    <DrawerListRow
                      accent="documents"
                      selected={isActive}
                      title={<span className="text-[15px] font-medium">{view.label}</span>}
                      leading={<Icon className="h-5 w-5" />}
                      className="py-3"
                      onClick={() => onViewSelect(view.id)}
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-0.5">
            <DrawerSectionTitle className="px-3">Tags</DrawerSectionTitle>
            <ul className="flex flex-col gap-0.5">
              {['#wichtig', '#neu', '#archiv'].map(tag => (
                <li key={tag}>
                  <DrawerListRow
                    title={<span className="text-[14px]">{tag}</span>}
                    leading={<TagIcon className="h-4 w-4" />}
                    onClick={() => {}}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <SidebarFooter 
        primaryAction={{
          label: 'Upload',
          icon: CloudArrowUpIcon,
          onClick: () => {}
        }}
      />
    </div>
  )
}
