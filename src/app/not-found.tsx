'use client';

import Link from 'next/link';
import { AkButton } from '@/components/ui/AkButton';
import { HomeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--ak-color-bg-base)] text-[var(--ak-color-text-primary)]">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-24 h-24 rounded-full bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-[var(--ak-color-text-muted)]" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Seite nicht gefunden</h1>
          <p className="text-[var(--ak-color-text-secondary)] text-lg">
            Die gesuchte Seite existiert leider nicht oder wurde verschoben.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <AkButton size="md" variant="primary" leftIcon={<HomeIcon className="w-5 h-5" />}>
              Zurück zum Dashboard
            </AkButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

