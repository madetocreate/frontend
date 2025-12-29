'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingPendingRuns } from '@/hooks/useOnboardingPendingRuns'
import { ScanCompleteCard } from './OnboardingResultCard'
import { useRouter } from 'next/navigation'

interface OnboardingNotificationsProps {
  /**
   * Where to navigate when user clicks "View Results"
   * Defaults to /settings (profile section)
   */
  viewResultsPath?: string
}

/**
 * Component that shows scan-complete notifications when background scans finish.
 * 
 * Place this in your main layout or ChatShell to receive notifications.
 */
export function OnboardingNotifications({ viewResultsPath = '/settings' }: OnboardingNotificationsProps) {
  const { pendingResults, dismissResult, isLoading } = useOnboardingPendingRuns()
  const router = useRouter()

  if (isLoading || pendingResults.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {pendingResults.map((result) => (
          <motion.div
            key={result.runId}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <ScanCompleteCard
              type={result.type}
              summary={result.summary || 'Scan abgeschlossen'}
              onView={() => {
                dismissResult(result.runId)
                router.push(viewResultsPath)
              }}
              onDismiss={() => dismissResult(result.runId)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

