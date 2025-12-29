'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Tag, Sparkles, Check, AlertCircle } from 'lucide-react'
import type { DocumentScanResult } from './OnboardingResultCard'

interface DocumentDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  result: DocumentScanResult
}

export function DocumentDetailsDrawer({ isOpen, onClose, result }: DocumentDetailsDrawerProps) {
  const { documents, tags, entities } = result

  const getDocTypeColor = (type?: string): string => {
    switch (type?.toLowerCase()) {
      case 'rechnung':
      case 'invoice':
        return 'bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]'
      case 'angebot':
      case 'quote':
        return 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]'
      case 'agb':
      case 'terms':
        return 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]'
      case 'broschüre':
      case 'brochure':
        return 'bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)]'
      default:
        return 'bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)]'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg ak-bg-surface border-l ak-border-default z-50 overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b ak-border-default shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-accent)]/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[var(--ak-color-accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold ak-text-primary">Dokument-Details</h2>
                  <p className="text-xs ak-text-secondary">{documents.length} Dokument{documents.length !== 1 ? 'e' : ''} analysiert</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:ak-bg-surface-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Dokumente Liste */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide ak-text-secondary mb-3 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Verarbeitete Dokumente
                </h3>
                <div className="space-y-3">
                  {documents.map((doc, i) => (
                    <motion.div
                      key={doc.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl ak-bg-surface-2 border ak-border-default"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-accent)]/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-[var(--ak-color-accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium ak-text-primary truncate">{doc.filename}</span>
                            {doc.type && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getDocTypeColor(doc.type)}`}>
                                {doc.type}
                              </span>
                            )}
                            {doc.status === 'processed' && (
                              <span className="flex items-center gap-1 text-[10px] text-[var(--ak-semantic-success)]">
                                <Check className="h-3 w-3" />
                                Verarbeitet
                              </span>
                            )}
                            {doc.status === 'failed' && (
                              <span className="flex items-center gap-1 text-[10px] text-[var(--ak-semantic-danger)]">
                                <AlertCircle className="h-3 w-3" />
                                Fehlgeschlagen
                              </span>
                            )}
                          </div>
                          {doc.summary && (
                            <p className="text-sm ak-text-secondary mt-2 leading-relaxed">{doc.summary}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Extrahierte Tags */}
              {tags && tags.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide ak-text-secondary mb-3 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    Erkannte Begriffe ({tags.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="text-xs px-3 py-1.5 rounded-full ak-bg-surface-2 ak-text-primary border ak-border-default hover:border-[var(--ak-color-accent)]/50 transition-colors cursor-default"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </section>
              )}

              {/* Wichtige Entitäten */}
              {entities && entities.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide ak-text-secondary mb-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Wichtige Entitäten ({entities.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {entities.map((entity, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="text-xs px-3 py-1.5 rounded-full bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)] border border-[var(--ak-color-accent)]/20 font-medium"
                      >
                        {entity}
                      </motion.span>
                    ))}
                  </div>
                </section>
              )}

              {/* Info-Box */}
              <section className="p-4 rounded-xl ak-bg-surface-2 border ak-border-default">
                <p className="text-xs ak-text-secondary leading-relaxed">
                  <strong className="ak-text-primary">💡 Tipp:</strong> Diese Begriffe und Entitäten werden genutzt, 
                  um deine Anfragen besser zu verstehen und passendere Antworten zu generieren. 
                  Du kannst sie jederzeit in den Einstellungen anpassen.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t ak-border-default shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[var(--ak-color-accent)] style={{ color: 'var(--ak-text-primary-dark)' }} font-medium hover:opacity-90 transition-opacity"
              >
                Schließen
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

