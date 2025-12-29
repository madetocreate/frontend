'use client'

import { useState } from 'react'
import { XMarkIcon, DocumentTextIcon, CodeBracketIcon, DocumentDuplicateIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { downloadChat, copyChat, type ExportMessage, type ExportOptions } from '@/lib/chatExport'

interface ChatExportDialogProps {
  isOpen: boolean
  onClose: () => void
  messages: ExportMessage[]
  chatTitle?: string
}

type ExportFormat = 'markdown' | 'json' | 'text'

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: typeof DocumentTextIcon; description: string }[] = [
  {
    id: 'markdown',
    label: 'Markdown',
    icon: DocumentTextIcon,
    description: 'Formatiert für Notizen & Dokumentation'
  },
  {
    id: 'json',
    label: 'JSON',
    icon: CodeBracketIcon,
    description: 'Strukturierte Daten für Entwickler'
  },
  {
    id: 'text',
    label: 'Plain Text',
    icon: DocumentDuplicateIcon,
    description: 'Einfacher Text ohne Formatierung'
  },
]

export function ChatExportDialog({ isOpen, onClose, messages, chatTitle }: ChatExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown')
  const [includeTimestamps, setIncludeTimestamps] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const options: ExportOptions = {
    format: selectedFormat,
    includeTimestamps,
    includeMetadata,
    title: chatTitle,
  }

  const handleDownload = () => {
    const safeName = (chatTitle || 'Chat')
      .toLowerCase()
      .replace(/[^a-z0-9äöüß]+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)
    downloadChat(messages, options, `${safeName}.${selectedFormat === 'json' ? 'json' : selectedFormat === 'markdown' ? 'md' : 'txt'}`)
    onClose()
  }

  const handleCopy = async () => {
    await copyChat(messages, options)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md mx-4 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ak-color-border-subtle)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">Chat exportieren</h2>
            <p className="text-sm text-[var(--ak-color-text-muted)]">{messages.length} Nachrichten</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-3">
              Format wählen
            </label>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={clsx(
                      "p-3 rounded-xl border-2 transition-all text-center",
                      isSelected 
                        ? "border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)]" 
                        : "border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-default)]"
                    )}
                  >
                    <Icon className={clsx(
                      "h-6 w-6 mx-auto mb-2",
                      isSelected ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-muted)]"
                    )} />
                    <span className={clsx(
                      "text-sm font-medium",
                      isSelected ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-secondary)]"
                    )}>
                      {format.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--ak-color-text-primary)]">
              Optionen
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTimestamps}
                onChange={(e) => setIncludeTimestamps(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--ak-color-border-default)] text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
              />
              <span className="text-sm text-[var(--ak-color-text-secondary)]">Zeitstempel einschließen</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--ak-color-border-default)] text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
              />
              <span className="text-sm text-[var(--ak-color-text-secondary)]">Titel & Export-Datum einschließen</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]">
          <button
            onClick={handleCopy}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              copied 
                ? "ak-badge-success" 
                : "bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]"
            )}
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Kopiert!
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="h-4 w-4" />
                Kopieren
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--ak-color-accent)] hover:brightness-110 transition-all"
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Herunterladen
          </button>
        </div>
      </div>
    </div>
  )
}

