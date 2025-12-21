export type GrowthMode = 'content' | 'campaigns' | 'seo' | 'reviews' | 'reports'

export type CampaignType = 'social' | 'newsletter' | 'launch'

export type GrowthActionId =
  | 'growth.variants3'
  | 'growth.hookImprove'
  | 'growth.ctaSuggestions'
  | 'growth.translate'
  | 'growth.campaignPlan'
  | 'growth.newsletterStart'
  | 'growth.keywordCluster'

export interface GrowthAction {
  id: GrowthActionId
  label: string
  description: string
}

export type GrowthTabId = 'context' | 'actions' | 'activity'
