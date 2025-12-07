import { ChatWorkspaceShell } from '@/components/ChatWorkspaceShell'
import { ChatKitPanel } from '@/components/ChatKitPanel'
import { MemoryOverviewWidget } from '@/components/MemoryOverviewWidget'

export default function MemoryPage() {
  return (
    <ChatWorkspaceShell>
      <div className="flex h-full min-h-0 flex-col gap-4 px-4 py-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Speicher &amp; Memory
            </h1>
            <p className="text-xs text-slate-500">
              Übersicht über deine gespeicherten Kunden, Notizen und Kontexte.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-[11px] text-slate-400 md:flex">
            <span className="inline-flex h-6 items-center rounded-full bg-slate-900 px-2 text-[10px] font-medium uppercase tracking-wide text-slate-50">
              Memory &amp; CRM
            </span>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.1fr),minmax(0,2.9fr)]">
          <section className="ak-glass-surface flex h-full flex-col overflow-hidden">
            <MemoryOverviewWidget />
          </section>
          <section className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-xs text-slate-600 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Memory-Assistent
                  </p>
                  <p className="text-xs text-slate-600">
                    Chatte über deine gespeicherten Informationen, Kunden und Projekte.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ChatKitPanel />
            </div>
          </section>
        </div>
      </div>
    </ChatWorkspaceShell>
  )
}
