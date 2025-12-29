'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="system"
      toastOptions={{
        className: 'ak-bg-surface-1 ak-border-default ak-text-primary shadow-lg',
      }}
    />
  );
}

