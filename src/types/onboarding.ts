/**
 * Onboarding Types
 * 
 * These types define the data structures used in the onboarding flow
 * and the settings persisted after onboarding completes.
 */

// ============================================
// STATUS TYPES
// ============================================

export type StepStatus = 'idle' | 'running' | 'completed' | 'pending_background' | 'failed'

export type ConfirmationStatus = 'suggested' | 'confirmed'

// ============================================
// WEBSITE SCAN
// ============================================

export interface WebsiteProfileFields {
  company_name?: string
  website?: string
  industry?: string
  value_proposition?: string
  target_audience?: string
  products_services?: string
  keywords?: string
}

export interface WebsiteScanOutput {
  fields: WebsiteProfileFields
  highlights?: string[]
}

export interface WebsiteScanSettings {
  status: ConfirmationStatus
  updatedAt: string
  source: 'website_fetch' | 'background_scan' | 'manual'
}

// ============================================
// DOCUMENT SCAN
// ============================================

export interface ScannedDocument {
  id: string
  filename: string
  type?: string // 'Rechnung', 'Angebot', 'AGB', 'Broschüre', etc.
  summary?: string
  status: 'processed' | 'failed'
}

export interface DocumentScanOutput {
  documents: ScannedDocument[]
  tags?: string[]
  entities?: string[]
}

export interface DocumentScanSettings {
  status: ConfirmationStatus
  updatedAt: string
  docCount: number
  topTags: string[]
  topEntities: string[]
}

// ============================================
// PENDING RUNS (for background completion)
// ============================================

export interface PendingRuns {
  website?: string // run_id
  document?: string // run_id
}

// ============================================
// COMPLETE ONBOARDING SETTINGS
// ============================================

export interface OnboardingSettings {
  websiteScan?: WebsiteScanSettings
  documentScan?: DocumentScanSettings
  pendingRuns?: PendingRuns
  completedAt?: string
  completionTimeSeconds?: number
}

// ============================================
// RESULT CARD PROPS
// ============================================

export interface OnboardingResultCardBaseProps {
  onConfirm: () => void
  onEdit?: () => void
  confirmed?: boolean
}

export interface WebsiteScanResultCardProps extends OnboardingResultCardBaseProps {
  result: WebsiteScanOutput
}

export interface DocumentScanResultCardProps extends OnboardingResultCardBaseProps {
  result: DocumentScanOutput
  onAddMore?: () => void
  onDetails?: () => void
}

// ============================================
// BACKGROUND COMPLETION
// ============================================

export interface PendingRunResult {
  type: 'website' | 'document'
  runId: string
  status: 'completed' | 'failed'
  result?: WebsiteScanOutput | DocumentScanOutput
  summary?: string
}

