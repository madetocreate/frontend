'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { WorkbenchWidgetDescriptor, WorkbenchActionDescriptor } from '@/types/workbench'
import { AkButton } from '@/components/ui/AkButton'

interface WorkbenchWidgetProps {
  descriptor: WorkbenchWidgetDescriptor
  onRunAction: (action: WorkbenchActionDescriptor, context: any) => void
  selectedItemId?: string
  onSelectItem: (id: string) => void
}

export function WorkbenchWidget({ descriptor, onRunAction, selectedItemId, onSelectItem }: WorkbenchWidgetProps) {
  const [isOpen, setIsOpen] = useState(descriptor.defaultOpen ?? false)

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-sm transition-all duration-200 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left focus:outline-none"
      >
        <span className="text-sm font-semibold tracking-wide text-[var(--ak-color-text-primary)]">
          {descriptor.title}
        </span>
        <ChevronDownIcon
          className={clsx(
            "h-4 w-4 text-[var(--ak-color-text-muted)] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="border-t border-[var(--ak-color-border-subtle)] px-5 py-4">
              {renderWidgetContent(descriptor, onRunAction, selectedItemId, onSelectItem)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function renderWidgetContent(
  descriptor: WorkbenchWidgetDescriptor, 
  onRunAction: (action: WorkbenchActionDescriptor, context: any) => void,
  selectedItemId?: string,
  onSelectItem?: (id: string) => void
) {
  switch (descriptor.kind) {
    case 'status':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--ak-color-bg-surface-muted)]/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ak-color-text-muted)]">Aktiv</p>
            <p className="mt-1 text-xl font-semibold">Ja</p>
          </div>
          <div className="rounded-xl bg-[var(--ak-color-bg-surface-muted)]/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ak-color-text-muted)]">Events (24h)</p>
            <p className="mt-1 text-xl font-semibold">1.2k</p>
          </div>
        </div>
      )
    case 'collection':
      return (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => onSelectItem?.(`item-${i}`)}
              className={clsx(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                selectedItemId === `item-${i}` 
                  ? "bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] font-medium" 
                  : "text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]"
              )}
            >
              Beispiel Eintrag {i}
            </button>
          ))}
        </div>
      )
    case 'detail':
      if (!selectedItemId) return <p className="text-xs italic text-[var(--ak-color-text-muted)]">Bitte wählen Sie ein Element aus.</p>
      return (
        <div className="space-y-2">
          <p className="text-sm text-[var(--ak-color-text-secondary)]">Details für {selectedItemId}</p>
          <div className="h-20 w-full rounded-lg bg-[var(--ak-color-bg-surface-muted)]/30 animate-pulse" />
        </div>
      )
    case 'editor':
      return (
        <textarea
          placeholder="Code oder Text hier eingeben..."
          className="w-full min-h-[120px] rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)] p-3 text-sm font-mono focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none"
        />
      )
    case 'actions':
      return (
        <div className="flex flex-col gap-2">
          {descriptor.actions?.map((action) => (
            <AkButton
              key={action.id}
              variant="secondary"
              size="sm"
              className="justify-start text-xs font-medium"
              onClick={() => onRunAction(action, { selectedItemId })}
            >
              {action.label}
            </AkButton>
          ))}
        </div>
      )
    default:
      return <p className="text-xs text-[var(--ak-semantic-danger)] text-center">Unbekannter Widget-Typ: {descriptor.kind}</p>
  }
}

