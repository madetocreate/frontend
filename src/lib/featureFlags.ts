/**
 * Feature Flags - Central configuration for beta/experimental features
 * 
 * BETA FEATURES:
 * Marketing is currently in BETA and disabled by default.
 * To enable: Set NEXT_PUBLIC_MARKETING_BETA=true + require marketing entitlement or DEV mode.
 */

/**
 * Checks if Marketing Beta is enabled via environment variable
 * Default: false (Marketing is disabled)
 */
export function isMarketingBetaEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MARKETING_BETA === 'true'
}

/**
 * Checks if Marketing should be visible in UI
 * Requires: Beta flag enabled + (entitlement OR dev mode)
 */
export function isMarketingVisible(features: { marketing: boolean }, isDev: boolean): boolean {
  if (!isMarketingBetaEnabled()) {
    return false
  }
  return isDev || features.marketing
}
