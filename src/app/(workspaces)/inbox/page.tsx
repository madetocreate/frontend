'use client';

import { Suspense } from 'react';
import { InboxWorkspace } from '@/features/inbox/InboxWorkspace';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="p-4 text-[var(--ak-color-text-muted)]">Lade Inbox…</div>}>
      <InboxWorkspace />
    </Suspense>
  );
}
