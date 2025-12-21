'use client'

import { motion } from 'framer-motion'
import { 
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface ConfigOption {
  label: string
  desc: string
  active: boolean
}

interface ConfigurationCardProps {
  id: string
  title: string
  options: ConfigOption[]
  onClose?: () => void
  onAction?: (action: string) => void
}

export function ConfigurationCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  title,
  options,
  onClose,
  onAction,
}: ConfigurationCardProps) {
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
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shadow-sm">
              <Cog6ToothIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Konfiguration & Setup
              </span>
              <p className="text-sm font-bold text-slate-900 leading-tight">{title}</p>
            </div>
          </div>
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

        {/* Options List */}
        <div className="bg-white divide-y divide-slate-50">
          {options.map((option, index) => (
            <div key={index} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{option.label}</p>
                <p className="text-xs text-slate-500">{option.desc}</p>
              </div>
              <div className={clsx(
                "flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer p-1",
                option.active ? "bg-emerald-500" : "bg-slate-200"
              )}>
                <div className={clsx(
                  "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                  option.active ? "translate-x-5" : "translate-x-0"
                )} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/20 flex justify-end">
          <button
            onClick={() => onAction?.('save')}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            Änderungen speichern
          </button>
        </div>
      </div>
    </motion.div>
  )
}

