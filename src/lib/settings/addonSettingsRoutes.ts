/**
 * Zentrale Route-Map für Add-on Settings
 * Verwendet in ServiceHub Cards, Dashboards und Sections
 */
export const ADDON_SETTINGS_ROUTES: Record<string, string> = {
  website_assistant: '/settings?view=website',
  website: '/settings?view=website',
  reviews: '/settings?view=reviews',
  telephony: '/settings?view=telephony',
  telegram: '/settings?view=telegram',
  security: '/settings?view=security',
  marketing: '/settings?view=marketing',
}

/**
 * Legacy Add-on Key zu View Mapping
 * Für Backward-Compat mit view=addons&addon=...
 */
export const LEGACY_ADDON_TO_VIEW: Record<string, string> = {
  website: 'website',
  reviews: 'reviews',
  telephony: 'telephony',
  telegram: 'telegram',
  security: 'security',
  marketing: 'marketing',
}
