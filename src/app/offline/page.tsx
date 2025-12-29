'use client'

import { AkButton } from '@/components/ui/AkButton'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--ak-color-bg-app)]">
      <div className="text-center max-w-md w-full">
        <div className="ak-card-glass p-8 rounded-2xl border ak-border-default">
          <h1 className="text-2xl font-bold mb-4 ak-text-primary">
            Offline
          </h1>
          <p className="text-base mb-6 ak-text-secondary leading-relaxed">
            Sie sind offline. Bitte überprüfen Sie Ihre Internetverbindung.
          </p>
          <AkButton
            onClick={handleRetry}
            variant="primary"
            size="md"
          >
            Neu laden
          </AkButton>
        </div>
      </div>
    </div>
  )
}

