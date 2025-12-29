import { useAuth } from '@/contexts/AuthContext'
import { useEntitlements } from './useEntitlements'
import { useMemo } from 'react'
import { isMarketingVisible } from '@/lib/featureFlags'

export interface FeatureAccess {
  isDeveloper: boolean
  features: {
    inbox: boolean
    documents: boolean
    customers: boolean
    serviceHub: boolean
    marketing: boolean
    website: boolean
    reviews: boolean
    telephony: boolean
    telegram: boolean
    workflows: boolean
    actionCards: boolean
  }
}

/**
 * Central hook for feature access and entitlements.
 * Implements a Developer Mode override that unlocks everything.
 * Uses useEntitlements internally which already handles the developer bypass.
 */
export function useFeatureAccess(): FeatureAccess {
  const { user } = useAuth()
  const { isEntitled } = useEntitlements()

  const isDeveloper = useMemo(() => {
    return user?.isDeveloper === true || process.env.NEXT_PUBLIC_AKLOW_DEV_MODE === 'true'
  }, [user?.isDeveloper])

  const features = useMemo(() => {
    // BETA: Marketing is gated by feature flag + entitlement
    const marketingEntitled = isEntitled('marketing')
    const marketingVisible = isMarketingVisible({ marketing: marketingEntitled }, isDeveloper)

    return {
      inbox: isEntitled('inbox'),
      documents: isEntitled('documents'),
      customers: isEntitled('crm'),
      serviceHub: isEntitled('teams'), 
      marketing: marketingVisible, // BETA: Gated by feature flag + entitlement
      website: isEntitled('website_assistant'),
      reviews: isEntitled('reviews'),
      telephony: isEntitled('telephony'),
      telegram: isEntitled('telegram') || isDeveloper, // Telegram add-on
      workflows: true, // Always visible/clickable in Dev mode (handled by isEntitled internally)
      actionCards: true,
    }
  }, [isEntitled, isDeveloper])

  return {
    isDeveloper,
    features,
  }
}
