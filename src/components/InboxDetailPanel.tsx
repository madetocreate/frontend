'use client'

import type { InboxItem } from '@/components/InboxDrawerWidget'

type InboxDetailPanelProps = {
  item: InboxItem | null
}

export function InboxDetailPanel({ item }: InboxDetailPanelProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="max-w-xs text-center text-xs text-slate-500">
          <p className="font-medium text-slate-600">Kein Thread ausgewählt</p>
          <p className="mt-1">
            Wähle links im Posteingang eine Nachricht aus, um Details und Vorschläge anzuzeigen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {item.channel} · {item.source}
        </p>
        <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
        <p className="text-xs text-slate-600">{item.preview}</p>
      </div>

      <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
        <p className="font-medium text-slate-700">Kontext</p>
        <p className="mt-1">
          Dies ist die Detailansicht für den ausgewählten Thread. Der integrierte Assistent auf Basis
          von ChatKit wurde entfernt. Hier kann später der neue Workspace-Chat oder ein anderes Widget
          eingebunden werden.
        </p>
      </div>
    </div>
  )
}
