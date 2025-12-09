'use client'

import { useState } from 'react'

// Placeholder type - wird später durch echte Daten ersetzt
export type TelephonyItem = {
  id: string
  title: string
  preview?: string
  time?: string
}

type TelephonySidebarWidgetProps = {
  onItemClick?: (item: TelephonyItem) => void
}

// Placeholder-Daten - wird später durch echte Widgets ersetzt
const MOCK_ITEMS: TelephonyItem[] = [
  {
    id: 'telephony-1',
    title: 'Anruf #1234',
    preview: 'Kundenanruf von Max Mustermann',
    time: 'vor 2 h',
  },
  {
    id: 'telephony-2',
    title: 'Anruf #1235',
    preview: 'Rückruf für Terminvereinbarung',
    time: 'vor 5 h',
  },
]

export function TelephonySidebarWidget({ onItemClick }: TelephonySidebarWidgetProps) {
  const [items] = useState<TelephonyItem[]>(MOCK_ITEMS)

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-[var(--ak-color-bg-surface)]/95 p-3 shadow-[var(--ak-shadow-soft)] backdrop-blur-xl">
      <div className="flex-1 overflow-y-auto">
        <p className="ak-body text-[var(--ak-color-text-muted)]">
          Hier werden später die Telephone Bot Widgets angezeigt.
        </p>
        <p className="ak-caption mt-2 text-[var(--ak-color-text-muted)]">
          Die Widgets werden hier eingefügt, sobald sie bereitgestellt werden.
        </p>
      </div>
    </div>
  )
}

