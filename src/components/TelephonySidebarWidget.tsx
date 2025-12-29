'use client'

import { MicrophoneIcon, PhoneIcon, SparklesIcon } from '@heroicons/react/24/outline'

import { AkButton } from '@/components/ui/AkButton'
import { WidgetCard } from '@/components/ui/WidgetCard'

export function TelephonySidebarWidget() {
  return (
    <WidgetCard
      title="Telephony"
      subtitle="Voice, Calls, Routing"
      className="h-full"
      padding="sm"
    >
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-[var(--ak-color-border)] bg-[var(--ak-color-bg-elevated)] p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--ak-color-bg-surface)] ak-shadow-soft">
              <PhoneIcon className="h-6 w-6 text-[var(--ak-color-text-secondary)]" />
            </div>
            <div className="min-w-0">
              <div className="ak-label">Realtime Voice</div>
              <div className="ak-body mt-1 text-[var(--ak-color-text-muted)]">
                Niedrige Latenz, Streaming, Tools. Sauberer Aufbau – gleiche Primitives wie überall.
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ak-color-border)] bg-[var(--ak-color-bg-surface)] px-2 py-1 text-[11px] text-[var(--ak-color-text-secondary)]">
              <MicrophoneIcon className="h-4 w-4" />
              Input
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ak-color-border)] bg-[var(--ak-color-bg-surface)] px-2 py-1 text-[11px] text-[var(--ak-color-text-secondary)]">
              <SparklesIcon className="h-4 w-4" />
              Agents
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <AkButton variant="primary" accent="telephony" onClick={() => {}}>
            Realtime Voice
          </AkButton>
          <AkButton variant="secondary" accent="telephony" onClick={() => {}}>
            Konfigurieren
          </AkButton>
          <AkButton variant="ghost" accent="telephony" onClick={() => {}}>
            Protokolle ansehen
          </AkButton>
        </div>
      </div>
    </WidgetCard>
  )
}
