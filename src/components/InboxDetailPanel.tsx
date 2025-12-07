'use client'

import clsx from 'clsx'
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { ChatKitPanel } from '@/components/ChatKitPanel'

type InboxDetailPanelProps = {
  item: InboxItem | null
}

type TimelineItem = {
  id: string
  author: string
  kind: 'incoming' | 'outgoing'
  time: string
  preview: string
}

const CHANNEL_META = {
  email: {
    label: 'E-Mail',
    icon: EnvelopeIcon,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    dotClass: 'bg-sky-500',
  },
  messenger: {
    label: 'Messenger',
    icon: ChatBubbleLeftRightIcon,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  support: {
    label: 'Support',
    icon: LifebuoyIcon,
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    dotClass: 'bg-violet-500',
  },
} as const

export function InboxDetailPanel({ item }: InboxDetailPanelProps) {
  if (!item) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4">
          <div className="max-w-xs text-center text-xs text-slate-500">
            <p className="font-medium text-slate-600">Kein Thread ausgewählt</p>
            <p className="mt-1">
              Wähle links im Posteingang eine Nachricht aus, um Details, Verlauf
              und Vorschläge anzuzeigen.
            </p>
          </div>
        </div>
        <div className="min-h-[220px] rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 text-xs text-slate-500">
          <p>Hier erscheint dein KI-Assistent, sobald du einen Thread ausgewählt hast.</p>
        </div>
      </div>
    )
  }

  const channel = CHANNEL_META[item.channel]
  const sentimentLabel = 'Neutral'
  const sentimentColor = 'bg-slate-100 text-slate-700'
  const urgencyLabel = 'Normal'
  const urgencyColor = 'bg-amber-50 text-amber-800'

  const summary =
    item.preview ||
    'Für diesen Thread liegt noch keine automatisch erzeugte Zusammenfassung vor.'
  const keyFacts: string[] = [
    `Kontakt: ${item.contactName}`,
    `Kanal: ${channel?.label ?? 'Unbekannt'}`,
    `Quelle: ${item.source}`,
  ]

  const timeline: TimelineItem[] = [
    {
      id: `${item.id}-incoming`,
      author: item.contactName || 'Kontakt',
      kind: 'incoming',
      time: item.time,
      preview: item.preview,
    },
  ]

  const nextSteps: string[] = [
    'Antwort vorschlagen lassen und ggf. anpassen.',
    'Kunde im CRM prüfen und Status aktualisieren.',
    'Follow-up-Termin einplanen, falls notwendig.',
  ]

  return (
    <div className="flex h-full flex-col gap-3">
      <section className="flex flex-col rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 text-xs text-slate-700 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/5">
              {channel ? (
                <channel.icon className="h-5 w-5 text-slate-700" />
              ) : (
                <EnvelopeIcon className="h-5 w-5 text-slate-700" />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                {channel ? (
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      channel.badgeClass,
                    )}
                  >
                    {channel.label}
                  </span>
                ) : null}
                {item.source ? (
                  <span className="text-[11px] text-slate-400">
                    {item.source}
                  </span>
                ) : null}
              </div>
              <p className="truncate text-sm font-semibold text-slate-900">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-500">
                {item.contactName || 'Unbekannter Kontakt'} · {item.time}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap justify-end gap-1.5">
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px]',
                  sentimentColor,
                )}
              >
                Stimmung: {sentimentLabel}
              </span>
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px]',
                  urgencyColor,
                )}
              >
                Dringlichkeit: {urgencyLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 h-px w-full bg-slate-100" />

        <div className="mt-3 flex flex-col gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px]">
                Ⓢ
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Zusammenfassung
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">
              {summary}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white px-3 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px]">
                ✦
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Kernaussagen
              </p>
            </div>
            <ul className="mt-1 space-y-1.5">
              {keyFacts.map((fact) => (
                <li key={fact} className="flex gap-2 text-[11px] leading-snug">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="text-slate-700">{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white px-3 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px]">
                ☰
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Verlauf
              </p>
            </div>
            <div className="mt-1 space-y-3">
              {timeline.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full',
                        entry.kind === 'incoming'
                          ? channel?.dotClass ?? 'bg-slate-400'
                          : 'bg-slate-400',
                      )}
                    />
                    <span className="mt-0.5 h-6 w-px bg-slate-200" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[11px] font-medium text-slate-700">
                        {entry.author}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {entry.time}
                      </p>
                    </div>
                    <p className="text-[11px] leading-snug text-slate-600">
                      {entry.preview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px]">
                ✓
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Nächste Schritte
              </p>
            </div>
            <ul className="mt-1 space-y-1.5">
              {nextSteps.map((step) => (
                <li key={step} className="flex gap-2 text-[11px] leading-snug">
                  <span className="mt-0.5 text-slate-400">›</span>
                  <span className="text-slate-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-50"
          >
            Antwort vorschlagen
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700"
          >
            Als erledigt markieren
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700"
          >
            Im CRM öffnen
          </button>
        </div>
      </section>

      <section className="flex-1 min-h-[220px] rounded-2xl border border-slate-200 bg-white/90 px-2 py-2">
        <ChatKitPanel />
      </section>
    </div>
  )
}
