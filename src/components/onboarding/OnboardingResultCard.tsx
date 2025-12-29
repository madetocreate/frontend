'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  Edit3, 
  Globe, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Building2,
  Users,
  Sparkles,
  AlertCircle,
  Plus
} from 'lucide-react'
import clsx from 'clsx'

// ============================================
// TYPES
// ============================================

export interface WebsiteScanResult {
  fields: {
    company_name?: string
    website?: string
    industry?: string
    value_proposition?: string
    target_audience?: string
    products_services?: string
    keywords?: string
  }
  highlights?: string[]
}

export interface DocumentScanResult {
  documents: Array<{
    id: string
    filename: string
    type?: string // 'Rechnung', 'Angebot', 'AGB', 'Broschüre', etc.
    summary?: string
    status: 'processed' | 'failed'
  }>
  tags?: string[]
  entities?: string[]
}

interface ResultCardBaseProps {
  onConfirm: () => void
  onEdit?: () => void
  confirmed?: boolean
}

// ============================================
// WEBSITE SCAN RESULT CARD
// ============================================

interface WebsiteScanCardProps extends ResultCardBaseProps {
  result: WebsiteScanResult
}

export function WebsiteScanResultCard({ result, onConfirm, onEdit, confirmed }: WebsiteScanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const { fields, highlights } = result
  
  // Felder, die gesetzt wurden
  const filledFields = Object.entries(fields || {})
    .filter(([_, v]) => v && v.trim())
    .map(([k, v]) => ({ key: k, value: v }))
  
  const fieldLabels: Record<string, string> = {
    company_name: 'Firmenname',
    website: 'Website',
    industry: 'Branche',
    value_proposition: 'Kernversprechen',
    target_audience: 'Zielkunden',
    products_services: 'Leistungen',
    keywords: 'Keywords',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "rounded-xl border overflow-hidden transition-all duration-200",
        confirmed 
          ? "border-[var(--ak-semantic-success)]/30 bg-[var(--ak-semantic-success-soft)]" 
          : "border-[var(--ak-color-accent)]/30 bg-[var(--ak-color-accent)]/5"
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-accent)]/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-[var(--ak-color-accent)]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold ak-text-primary">Website-Scan Ergebnis</h3>
              {confirmed && (
                <span className="flex items-center gap-1 text-xs text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)] px-2 py-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                  Bestätigt
                </span>
              )}
            </div>
            <p className="text-xs ak-text-secondary">Wir haben Folgendes erkannt</p>
          </div>
        </div>

        {/* Erkannt - Zusammenfassung */}
        <div className="space-y-2 mb-3">
          {fields.industry && (
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-[var(--ak-color-accent)] mt-0.5 shrink-0" />
              <span className="text-sm ak-text-primary"><strong>Branche:</strong> {fields.industry}</span>
            </div>
          )}
          {fields.products_services && (
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[var(--ak-color-accent)] mt-0.5 shrink-0" />
              <span className="text-sm ak-text-primary line-clamp-2"><strong>Leistungen:</strong> {fields.products_services}</span>
            </div>
          )}
          {fields.target_audience && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-[var(--ak-color-accent)] mt-0.5 shrink-0" />
              <span className="text-sm ak-text-primary line-clamp-1"><strong>Zielgruppe:</strong> {fields.target_audience}</span>
            </div>
          )}
          {fields.value_proposition && (
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-[var(--ak-color-accent)] mt-0.5 shrink-0" />
              <span className="text-sm ak-text-primary line-clamp-2"><strong>Kernversprechen:</strong> {fields.value_proposition}</span>
            </div>
          )}
        </div>

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide ak-text-secondary mb-2">Highlights</p>
            <ul className="space-y-1">
              {highlights.slice(0, 5).map((h, i) => (
                <li key={i} className="text-sm ak-text-primary flex items-start gap-2">
                  <span className="text-[var(--ak-color-accent)] mt-1">•</span>
                  <span className="line-clamp-1">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gefüllte Profilfelder (expandable) */}
        {filledFields.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs font-medium ak-text-secondary hover:ak-text-primary transition-colors"
            >
              <span>{filledFields.length} Profilfelder ergänzt</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 rounded-lg ak-bg-surface-2 space-y-1">
                    {filledFields.map(({ key, value }) => (
                      <div key={key} className="flex items-start gap-2 text-xs">
                        <span className="ak-text-secondary shrink-0">{fieldLabels[key] || key}:</span>
                        <span className="ak-text-primary truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Actions */}
      {!confirmed && (
        <div className="flex items-center gap-2 p-3 pt-0 border-t border-[var(--ak-color-border-subtle)]/50">
          <p className="text-xs ak-text-muted flex-1">Du behältst die Kontrolle – du kannst alles bearbeiten.</p>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ak-text-secondary hover:ak-text-primary ak-bg-surface-2 hover:ak-bg-surface rounded-lg transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            Bearbeiten
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[var(--ak-color-accent)] hover:opacity-90 rounded-lg transition-opacity"
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            <Check className="h-3 w-3" />
            Passt
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// DOCUMENT SCAN RESULT CARD
// ============================================

interface DocumentScanCardProps extends ResultCardBaseProps {
  result: DocumentScanResult
  onAddMore?: () => void
  onDetails?: () => void
}

export function DocumentScanResultCard({ result, onConfirm, onDetails, onAddMore, confirmed }: DocumentScanCardProps) {
  const { documents, tags, entities } = result
  const visibleDocs = documents.slice(0, 3)
  const hiddenCount = documents.length - 3

  const getDocTypeIcon = (type?: string) => {
    // Simple type detection
    return <FileText className="h-4 w-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "rounded-xl border overflow-hidden transition-all duration-200",
        confirmed 
          ? "border-[var(--ak-semantic-success)]/30 bg-[var(--ak-semantic-success-soft)]" 
          : "border-[var(--ak-color-accent)]/30 bg-[var(--ak-color-accent)]/5"
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-accent)]/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-[var(--ak-color-accent)]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold ak-text-primary">Dokument-Scan Ergebnis</h3>
              {confirmed && (
                <span className="flex items-center gap-1 text-xs text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)] px-2 py-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                  Bestätigt
                </span>
              )}
            </div>
            <p className="text-xs ak-text-secondary">{documents.length} Dokument{documents.length !== 1 ? 'e' : ''} verarbeitet</p>
          </div>
        </div>

        {/* Dokumente Liste */}
        <div className="space-y-2 mb-3">
          {visibleDocs.map((doc, i) => (
            <div key={doc.id || i} className="flex items-start gap-3 p-2 rounded-lg ak-bg-surface-2">
              <div className="w-8 h-8 rounded-md bg-[var(--ak-color-accent)]/10 flex items-center justify-center shrink-0">
                {getDocTypeIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium ak-text-primary truncate">{doc.filename}</span>
                  {doc.type && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)] shrink-0">
                      {doc.type}
                    </span>
                  )}
                  {doc.status === 'processed' && (
                    <Check className="h-3 w-3 ak-text-success shrink-0" />
                  )}
                  {doc.status === 'failed' && (
                    <AlertCircle className="h-3 w-3 text-[var(--ak-semantic-danger)] shrink-0" />
                  )}
                </div>
                {doc.summary && (
                  <p className="text-xs ak-text-secondary line-clamp-2 mt-0.5">{doc.summary}</p>
                )}
              </div>
            </div>
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={onDetails}
              className="w-full text-center text-xs font-medium text-[var(--ak-color-accent)] hover:underline py-1"
            >
              +{hiddenCount} weitere Dokumente anzeigen
            </button>
          )}
        </div>

        {/* Extrahierte Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide ak-text-secondary mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Erkannte Begriffe
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 8).map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full ak-bg-surface-2 ak-text-secondary">
                  {tag}
                </span>
              ))}
              {tags.length > 8 && (
                <span className="text-xs px-2 py-1 text-[var(--ak-color-accent)]">+{tags.length - 8}</span>
              )}
            </div>
          </div>
        )}

        {/* Wichtige Entitäten */}
        {entities && entities.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide ak-text-secondary mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Wichtige Begriffe
            </p>
            <div className="flex flex-wrap gap-1.5">
              {entities.slice(0, 8).map((entity, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)]">
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!confirmed && (
        <div className="flex items-center gap-2 p-3 pt-0 border-t border-[var(--ak-color-border-subtle)]/50">
          {onAddMore && (
            <button
              onClick={onAddMore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ak-text-secondary hover:ak-text-primary ak-bg-surface-2 hover:ak-bg-surface rounded-lg transition-colors"
            >
              <Plus className="h-3 w-3" />
              Mehr hinzufügen
            </button>
          )}
          <div className="flex-1" />
          {onDetails && (
            <button
              onClick={onDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ak-text-secondary hover:ak-text-primary ak-bg-surface-2 hover:ak-bg-surface rounded-lg transition-colors"
            >
              Details
            </button>
          )}
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[var(--ak-color-accent)] hover:opacity-90 rounded-lg transition-opacity"
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            <Check className="h-3 w-3" />
            Passt
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// BACKGROUND SCAN CARD (während Scan läuft / nach Timeout)
// ============================================

interface BackgroundScanCardProps {
  type: 'website' | 'document'
  status: 'running' | 'pending_background'
  onContinue?: () => void
}

export function BackgroundScanCard({ type, status, onContinue }: BackgroundScanCardProps) {
  const isBackground = status === 'pending_background'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl ak-bg-surface-2 border ak-border-default"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-accent)]/10 flex items-center justify-center">
          {type === 'website' ? (
            <Globe className="h-5 w-5 text-[var(--ak-color-accent)]" />
          ) : (
            <FileText className="h-5 w-5 text-[var(--ak-color-accent)]" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium ak-text-primary">
            {isBackground ? 'Scan läuft im Hintergrund' : `${type === 'website' ? 'Website' : 'Dokumente'} werden analysiert...`}
          </h4>
          <p className="text-xs ak-text-secondary">
            {isBackground 
              ? 'Du kannst weiterarbeiten. Wir benachrichtigen dich, wenn fertig.'
              : 'Das dauert nur wenige Sekunden...'
            }
          </p>
        </div>
        {isBackground && onContinue && (
          <button
            onClick={onContinue}
            className="px-4 py-2 text-sm font-medium bg-[var(--ak-color-accent)] hover:opacity-90 rounded-lg transition-opacity"
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            Weiter
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// SCAN COMPLETE NOTIFICATION CARD (für Inbox/Actions)
// ============================================

interface ScanCompleteCardProps {
  type: 'website' | 'document'
  summary: string
  onView: () => void
  onDismiss: () => void
}

export function ScanCompleteCard({ type, summary, onView, onDismiss }: ScanCompleteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 rounded-xl bg-[var(--ak-semantic-success-soft)] border border-[var(--ak-semantic-success)]/20"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--ak-semantic-success-soft)] flex items-center justify-center shrink-0">
          <Check className="h-5 w-5 text-[var(--ak-semantic-success)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[var(--ak-semantic-success)]">
            {type === 'website' ? 'Website-Scan' : 'Dokument-Scan'} abgeschlossen
          </h4>
          <p className="text-sm ak-text-secondary mt-0.5 line-clamp-2">{summary}</p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onView}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{ color: 'var(--ak-text-primary-dark)', backgroundColor: 'var(--ak-semantic-success)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--ak-semantic-success)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--ak-semantic-success)'}
            >
              Ergebnisse ansehen
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium ak-text-secondary hover:ak-text-primary transition-colors"
            >
              Ignorieren
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

