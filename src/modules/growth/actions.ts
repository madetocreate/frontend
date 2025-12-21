import { GrowthAction, GrowthActionId, GrowthMode, CampaignType } from './types'

export const GROWTH_ACTIONS: Record<GrowthActionId, GrowthAction> = {
  'growth.variants3': { id: 'growth.variants3', label: '3 Varianten', description: 'Kurz, neutral, locker.' },
  'growth.hookImprove': { id: 'growth.hookImprove', label: 'Hook verbessern', description: 'Macht den Einstieg spannender.' },
  'growth.ctaSuggestions': { id: 'growth.ctaSuggestions', label: 'CTA Vorschläge', description: 'Optimiert den Abschluss.' },
  'growth.translate': { id: 'growth.translate', label: 'Übersetzen (Stub)', description: 'Übersetzungsvorschlag (Simulation).' },
  'growth.campaignPlan': { id: 'growth.campaignPlan', label: 'Kampagnenplan', description: 'Strategie auf einer Seite.' },
  'growth.newsletterStart': { id: 'growth.newsletterStart', label: 'Newsletter starten', description: 'Kickoff-Plan Woche 1.' },
  'growth.keywordCluster': { id: 'growth.keywordCluster', label: 'Keyword Cluster', description: 'Thematische Gruppierung.' },
}

export const getActionsForMode = (mode: GrowthMode, campaignType?: CampaignType): GrowthActionId[] => {
  switch (mode) {
    case 'content':
      return ['growth.variants3', 'growth.hookImprove', 'growth.ctaSuggestions', 'growth.translate']
    case 'campaigns':
      return campaignType === 'newsletter'
        ? ['growth.newsletterStart', 'growth.variants3', 'growth.ctaSuggestions']
        : ['growth.campaignPlan', 'growth.keywordCluster', 'growth.ctaSuggestions']
    case 'seo':
      return ['growth.keywordCluster']
    case 'reviews':
      return ['growth.hookImprove', 'growth.ctaSuggestions']
    case 'reports':
      return ['growth.campaignPlan', 'growth.keywordCluster']
    default:
      return []
  }
}
