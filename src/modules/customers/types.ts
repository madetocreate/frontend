export type CustomerStatus = 'all' | 'open' | 'new' | 'important'

export interface Customer {
  id: string
  name: string
  company?: string
  phone?: string
  email?: string
  contextLine: string
  status: 'neutral' | 'active'
  tags: string[]
  important: boolean
  openCases: number
  lastContactDays: number
}

export type CustomerActionId =
  | 'customers.profileShort'
  | 'customers.top3Open'
  | 'customers.nextSteps'
  | 'customers.followupDraft'
  | 'customers.timelineSummary'
  | 'customers.risksBlockers'
  | 'customers.suggestTags'

export interface CustomerAction {
  id: CustomerActionId
  label: string
  description: string
  isPrimary?: boolean
}

export type CustomerTabId = 'context' | 'actions' | 'activity'
