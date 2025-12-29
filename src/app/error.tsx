'use client';

import { useEffect } from 'react';
import { AkButton } from '@/components/ui/AkButton';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--ak-color-bg-base)] text-[var(--ak-color-text-primary)]">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-24 h-24 rounded-full ak-alert-danger flex items-center justify-center">
          <ExclamationCircleIcon className="w-12 h-12 ak-text-danger" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Etwas ist schiefgelaufen</h1>
          <p className="text-[var(--ak-color-text-secondary)]">
            Ein unerwarteter Fehler ist aufgetreten. Wir wurden benachrichtigt.
          </p>
          {process.env.NODE_ENV === 'development' && (
             <div className="mt-4 p-4 bg-[var(--ak-color-bg-surface-muted)] rounded-lg text-left overflow-auto max-h-40 text-xs font-mono ak-text-danger">
               {error.message}
             </div>
          )}
        </div>

        <div className="pt-4 flex gap-3 justify-center">
          <AkButton 
            size="md" 
            variant="secondary" 
            onClick={() => window.location.href = '/'}
          >
            Zum Dashboard
          </AkButton>
          <AkButton 
            size="md" 
            variant="primary" 
            onClick={reset}
            leftIcon={<ArrowPathIcon className="w-5 h-5" />}
          >
            Erneut versuchen
          </AkButton>
        </div>
      </div>
    </div>
  );
}

