export type DashboardIndustry = 'hotel' | 'gastronomie' | 'practice' | 'realestate'

export interface DashboardProConfig {
  version: number
  industry: DashboardIndustry
  enabledApps: string[] // legacy modules concept
  enabledViews: string[] // views within the industry dashboard
  layout?: Record<string, unknown> // future proofing for drag and drop layout
  updatedAt: number
}

export type IndustryTemplate = {
  id: DashboardIndustry
  name: string
  defaultViews: string[]
  availableViews: { id: string; label: string }[]
}

