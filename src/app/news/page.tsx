"use client";

import { ChatWorkspaceShell } from "@/components/ChatWorkspaceShell";
import { NewsGreetingWidget } from "@/components/NewsGreetingWidget";

export default function NewsPage() {
  return (
    <ChatWorkspaceShell>
      <div className="flex h-full flex-col">
        {/* News-Feed oben */}
        <NewsGreetingWidget />

        {/* Hauptbereich: News-Widgets automatisch präsentiert */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Hier werden später weitere News-Widgets automatisch eingefügt */}
              <div className="ak-body text-[var(--ak-color-text-muted)]">
                News-Widgets werden hier automatisch präsentiert.
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatWorkspaceShell>
  );
}

