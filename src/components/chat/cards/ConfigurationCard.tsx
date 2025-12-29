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
      className="w-full"
    >
      <div className="ak-card-glass rounded-2xl border ak-border-default shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 ak-bg-surface-0 border-b ak-border-hairline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full ak-bg-graphite-surface flex items-center justify-center shadow-sm">
              <Cog6ToothIcon className="w-5 h-5" style={{ color: 'var(--ak-color-graphite-text)' }} />
            </div>
            <div>
              <span className="text-[10px] font-bold ak-text-secondary uppercase tracking-widest">
                Konfiguration & Setup
              </span>
              <p className="text-sm font-bold ak-text-primary leading-tight">{title}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg ak-bg-surface-hover shadow-sm transition-colors focus-visible:outline-none focus-visible:ring ak-focus-ring"
              title="Schließen"
            >
              <XMarkIcon className="w-4 h-4 ak-text-secondary" />
            </button>
          )}
        </div>

        {/* Options List */}
        <div className="bg-[var(--ak-color-bg-surface)] divide-y divide-[var(--ak-color-border-hairline)]">
          {options.map((option, index) => (
            <div key={index} className="px-5 py-4 flex items-center justify-between hover:ak-bg-surface-hover transition-colors">
              <div className="flex-1">
                <p className="text-sm font-bold ak-text-primary">{option.label}</p>
                <p className="text-xs ak-text-secondary">{option.desc}</p>
              </div>
                <div className={clsx(
                "flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer p-1",
                option.active ? "ak-bg-success-soft" : "ak-bg-surface-muted"
                )}>
                <div className={clsx(
                  "h-4 w-4 rounded-full ak-bg-surface-1 shadow-sm transition-transform",
                  option.active ? "translate-x-5" : "translate-x-0"
                )} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t ak-border-hairline ak-bg-surface-muted flex justify-end">
          <button
            onClick={() => onAction?.('save')}
            className="ak-btn-primary ak-btn-gradient ak-text-sm"
          >
            Änderungen speichern
          </button>
        </div>
      </div>
    </motion.div>
  )
}

