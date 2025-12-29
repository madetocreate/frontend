'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { AkButton } from '@/components/ui/AkButton';

export function ConnectInboxBanner() {
  const router = useRouter();

  return (
    <div className="mb-6 p-4 rounded-xl border border-[var(--ak-color-accent-border)] ak-accent-bg-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2" style={{ '--ak-color-accent': 'var(--ak-accent-inbox)', '--ak-color-accent-soft': 'var(--ak-accent-inbox-soft)' } as React.CSSProperties}>
      <div className="flex gap-3">
        <div className="p-2 rounded-lg ak-accent-bg-soft ak-accent-icon shrink-0" style={{ '--ak-color-accent': 'var(--ak-accent-inbox)', '--ak-color-accent-soft': 'var(--ak-accent-inbox-soft)' } as React.CSSProperties}>
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold ak-text-primary">
            Das ist eine Demo-Ansicht
          </h3>
          <p className="text-sm ak-text-secondary">
            Verbinde deinen Posteingang, um echte Nachrichten zu empfangen und zu beantworten.
          </p>
        </div>
      </div>
      <div className="shrink-0 w-full sm:w-auto">
        <AkButton
          variant="primary"
          size="sm"
          accent="inbox"
          className="w-full sm:w-auto border-none shadow-none"
          onClick={() => router.push('/actions?cat=setup&integration=email')}
        >
          Posteingang verbinden
          <ArrowRight className="ml-2 h-3 w-3" />
        </AkButton>
      </div>
    </div>
  );
}

