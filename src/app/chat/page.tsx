import { Suspense } from "react";
import { ChatShell } from "../../components/ChatShell";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[var(--ak-color-bg-app)] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <h1 className="ak-heading text-3xl font-bold text-[var(--ak-color-text-primary)]">Chat</h1>
          <p className="text-[var(--ak-color-text-muted)] text-sm">
            Unterhaltungen mit Agenten und Kunden – in einem konsistenten Workspace.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-sm">
          <Suspense fallback={<div className="p-4 text-[var(--ak-color-text-muted)]">Lade Chat…</div>}>
            <ChatShell />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
