'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { AppShellV2 } from '@/components/shell-v2/AppShellV2';

// Force dynamic rendering for all workspace pages (they use localStorage and client-only state)
export const dynamic = 'force-dynamic';

export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShellV2>{children}</AppShellV2>
    </AuthGuard>
  );
}

