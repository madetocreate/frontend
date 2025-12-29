/**
 * Accent Color System - Centralized Accent API
 * 
 * Stellt semantische Accent-Varianten bereit, die über CSS-Variablen laufen.
 * Keine Tailwind-Farbstrings mehr als Props.
 */

export type AkAccent =
  | 'inbox'
  | 'customers'
  | 'documents'
  | 'growth'
  | 'shield'
  | 'phone'
  | 'website'
  | 'reviews'
  | 'actions'
  | 'default'

/**
 * Gibt CSS-Variablen für einen Accent zurück
 */
export function accentVars(accent: AkAccent): React.CSSProperties {
  const accentMap: Record<AkAccent, { accent: string; soft: string }> = {
    inbox: {
      accent: 'var(--ak-accent-inbox)',
      soft: 'var(--ak-accent-inbox-soft)',
    },
    customers: {
      accent: 'var(--ak-accent-customers)',
      soft: 'var(--ak-accent-customers-soft)',
    },
    documents: {
      accent: 'var(--ak-accent-documents)',
      soft: 'var(--ak-accent-documents-soft)',
    },
    growth: {
      accent: 'var(--ak-accent-growth)',
      soft: 'var(--ak-accent-growth-soft)',
    },
    shield: {
      accent: 'var(--ak-accent-shield)',
      soft: 'var(--ak-accent-shield-soft)',
    },
    phone: {
      accent: 'var(--ak-accent-phone)',
      soft: 'var(--ak-accent-phone-soft)',
    },
    website: {
      accent: 'var(--ak-accent-website)',
      soft: 'var(--ak-accent-website-soft)',
    },
    reviews: {
      accent: 'var(--ak-accent-phone)', // Reuse phone accent for reviews (orange)
      soft: 'var(--ak-accent-phone-soft)',
    },
    actions: {
      accent: 'var(--ak-color-graphite-base)',
      soft: 'var(--ak-color-graphite-soft)',
    },
    default: {
      accent: 'var(--ak-color-accent)',
      soft: 'var(--ak-color-accent-soft)',
    },
  }

  const vars = accentMap[accent] || accentMap.default

  return {
    '--ak-color-accent': vars.accent,
    '--ak-color-accent-soft': vars.soft,
  } as React.CSSProperties
}

/**
 * Gibt Utility-Klassen für einen Accent zurück
 */
export function accentClasses(accent: AkAccent): string {
  return `ak-accent-${accent}`
}

