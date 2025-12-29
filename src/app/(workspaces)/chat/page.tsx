'use client';

// Force dynamic rendering (Chat uses localStorage and client-only state)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Suspense } from 'react';
import { ChatWorkspaceRouter } from '@/features/chat/ChatWorkspaceRouter';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-[var(--ak-color-text-muted)]">Lade Chat…</div>}>
      <div className="h-full min-h-0 w-full overflow-hidden">
        <ChatWorkspaceRouter />
      </div>
    </Suspense>
  );
}

