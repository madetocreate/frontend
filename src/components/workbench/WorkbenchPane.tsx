'use client'

import { useState } from 'react'
import { ViewKey, WorkbenchActionDescriptor } from '@/types/workbench'
import { WORKBENCH_VIEWS } from '@/workbench/views'
import { WorkbenchWidget } from './widgets/WorkbenchWidget'
import { AkEmptyState } from '@/components/ui/AkEmptyState'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface WorkbenchPaneProps {
  viewKey: ViewKey
  tenantId: string
  onRunAction: (action: WorkbenchActionDescriptor, context: any) => void
}

export function WorkbenchPane({ viewKey, tenantId, onRunAction }: WorkbenchPaneProps) {
  const descriptor = WORKBENCH_VIEWS[viewKey]
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>()

  if (!descriptor) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <AkEmptyState
          icon={<ExclamationTriangleIcon />}
          title="View nicht konfiguriert"
          description={`Der ViewKey ${viewKey} wurde noch nicht in WORKBENCH_VIEWS definiert.`}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* View Header */}
      <div className="px-6 py-6 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[var(--ak-color-text-primary)] leading-tight">
          {descriptor.title}
        </h1>
        {descriptor.description && (
          <p className="mt-1 text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
            {descriptor.description}
          </p>
        )}
      </div>

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto ak-scrollbar p-4 space-y-1 pb-24">
        {descriptor.widgets.map((widget) => (
          <WorkbenchWidget
            key={widget.id}
            descriptor={widget}
            onRunAction={onRunAction}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
          />
        ))}
      </div>
    </div>
  )
}

