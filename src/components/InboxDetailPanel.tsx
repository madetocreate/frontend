'use client'

import type { InboxItem } from '@/components/InboxDrawerWidget'

type InboxDetailPanelProps = {
  item: InboxItem | null
}

export function InboxDetailPanel({ item }: InboxDetailPanelProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-xs text-center">
          <p className="ak-heading text-sm">Kein Element ausgewählt</p>
          <p className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">
            Wähle links eine Nachricht aus, um Details zu sehen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="ak-section">
        <p className="ak-caption uppercase tracking-wide text-[var(--ak-color-text-muted)]">{item.channel}</p>
        <h2 className="ak-heading mt-1 text-base">{item.title}</h2>
        <p className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">{item.snippet}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="ak-caption text-[var(--ak-color-text-muted)]">Zeit</p>
            <p className="ak-body">{item.time}</p>
          </div>
          <div>
            <p className="ak-caption text-[var(--ak-color-text-muted)]">Status</p>
            <p className="ak-body">{item.status}</p>
          </div>
        </div>
      </div>

      <div className="ak-section">
        <p className="ak-section-title">Kontext</p>
        <div className="flex flex-col gap-2">
          <div className="ak-row">
            <span className="ak-row-label">Thread</span>
            <span className="ak-row-value">{item.threadId}</span>
          </div>
          <div className="ak-row">
            <span className="ak-row-label">Wichtig</span>
            <span className="ak-row-value">{item.important ? 'Ja' : 'Nein'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
