'use client'

import type { TelephonyItem } from './TelephonySidebarWidget'

type TelephonyDetailPanelProps = {
  item: TelephonyItem | null
}

export function TelephonyDetailPanel({ item }: TelephonyDetailPanelProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">Wähle ein Element aus</p>
          <p className="mt-1">Klicke auf ein Element in der linken Sidebar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="ak-heading">{item.title}</h2>
      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8">
        <div className="max-w-xs text-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">
            Hier werden später die Detail-Widgets für Telephone Bot angezeigt.
          </p>
          <p className="mt-1">
            Die Detail-Widgets werden hier eingefügt, sobald sie bereitgestellt werden.
          </p>
        </div>
      </div>
    </div>
  )
}

