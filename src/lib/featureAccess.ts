import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { isMarketingBetaEnabled } from '@/lib/featureFlags'

/**
 * Checks if marketing features should be visible to the user.
 * 
 * Marketing is currently in BETA and hidden if:
 * 1. Beta flag is disabled (NEXT_PUBLIC_MARKETING_BETA=false)
 * 2. User does not have marketing entitlement AND is not a developer
 */
export function isMarketingVisible(features: Record<string, boolean>, isDeveloper: boolean): boolean {
  const betaEnabled = isMarketingBetaEnabled()
  if (!betaEnabled) return false
  
  return !!features.marketing || isDeveloper
}

/**
 * Hook version for use in components
 */
export function useIsMarketingVisible(): boolean {
  const { features, isDeveloper } = useFeatureAccess()
  return isMarketingVisible(features, isDeveloper)
}

