'use client'

import { useEffect, useState } from 'react'
import { 
  EnvelopeIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  PaperClipIcon,
  ClockIcon,
  UserCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface EmailCardProps {
  id: string
  from: string
  fromEmail?: string
  to?: string
  subject: string
  date: string
  preview: string
  body?: string
  attachments?: { name: string; size: string }[]
  isExpanded?: boolean
  onClose?: () => void
  onAction?: (action: string) => void
}

export function EmailCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  from,
  fromEmail,
  to,
  subject,
  date,
  preview,
  body,
  attachments = [],
  isExpanded: initialExpanded = false,
  onClose,
  onAction,
}: EmailCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  useEffect(() => {
    setIsExpanded(initialExpanded)
  }, [initialExpanded])

  const fullBody = body || preview

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
              <EnvelopeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                E-Mail Nachricht
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title={isExpanded ? 'Einklappen' : 'Erweitern'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white transition-colors"
                title="Schließen"
              >
                <XMarkIcon className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Email Meta */}
        <div className="px-4 py-3 border-b border-slate-50 space-y-2 bg-white">
          {/* From */}
          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span className="text-[11px] text-slate-400 w-12 uppercase font-medium">Von:</span>
            <span className="text-sm font-semibold text-slate-900">{from}</span>
            {fromEmail && (
              <span className="text-xs text-slate-400 font-normal">&lt;{fromEmail}&gt;</span>
            )}
          </div>
          
          {/* To */}
          {to && (
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <span className="text-[11px] text-slate-400 w-12 uppercase font-medium">An:</span>
              <span className="text-sm text-slate-600">{to}</span>
            </div>
          )}
          
          {/* Subject */}
          <div className="flex items-start gap-2">
            <EnvelopeIcon className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-400 w-12 uppercase font-medium">Betreff:</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">{subject}</span>
          </div>
          
          {/* Date */}
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span className="text-[11px] text-slate-400 w-12 uppercase font-medium">Datum:</span>
            <span className="text-xs text-slate-500 font-medium">{date}</span>
          </div>
        </div>

        {/* Email Body */}
        <div className="px-5 py-5 bg-white">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="prose prose-sm max-w-none"
              >
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                  {fullBody}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {preview}
                </p>
                {fullBody.length > preview.length && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-blue-200"
                  >
                    Vollständige E-Mail lesen...
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-2">
              <PaperClipIcon className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {attachments.length} Anhang{attachments.length > 1 ? 'e' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.name}-${attachment.size}-${index}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 text-xs shadow-sm hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <PaperClipIcon className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-700 font-medium">{attachment.name}</span>
                  <span className="text-slate-400 text-[10px]">({attachment.size})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {onAction && (
          <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/30">
            <div className="flex gap-2">
              <button
                onClick={() => onAction(`Antworte auf diese E-Mail von ${from}`)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors active:scale-[0.98]"
              >
                Antwort schreiben
              </button>
              <button
                onClick={() => onAction(`Fasse diese E-Mail zusammen: ${subject}`)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors active:scale-[0.98]"
              >
                Zusammenfassen
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
