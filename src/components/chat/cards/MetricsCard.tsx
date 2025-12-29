'use client'

import { motion } from 'framer-motion'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'
import { AkButton } from '@/components/ui/AkButton'

interface Metric {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

interface MetricsCardProps {
  id: string
  title: string
  metrics: Metric[]
  onClose?: () => void
  onAction?: (action: string) => void
}

export function MetricsCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  title,
  metrics,
  onClose,
  onAction,
}: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      <CardShell>
        <CardHeader
          icon={<SparklesIcon className="w-5 h-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
          title={title}
          subtitle="KI-Analyse & Metriken"
          actions={
            onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title="Schließen"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )
          }
        />

        {/* Metrics Grid */}
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] hover:border-[var(--ak-accent-inbox)]/25 transition-colors">
                <p className="text-[11px] font-bold text-[var(--ak-color-text-tertiary)] uppercase tracking-wider mb-1">
                  {metric.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{metric.value}</span>
                  {metric.change && (
                    <span className={clsx(
                      "text-xs font-bold flex items-center gap-0.5",
                      metric.trend === 'up' ? "text-[var(--ak-semantic-success)]" : metric.trend === 'down' ? "text-[var(--ak-semantic-danger)]" : "text-[var(--ak-color-text-tertiary)]"
                    )}>
                      {metric.trend === 'up' && <ArrowUpIcon className="w-2.5 h-2.5" />}
                      {metric.trend === 'down' && <ArrowDownIcon className="w-2.5 h-2.5" />}
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>

        {/* Footer Actions */}
        {onAction && (
          <CardFooter>
            <AkButton
              variant="primary"
              accent="graphite"
              onClick={() => onAction('optimize')}
              size="sm"
              className="flex-1"
            >
              KI-Optimierung starten
            </AkButton>
            <AkButton
              variant="secondary"
              onClick={() => onAction('report')}
              size="sm"
              className="flex-1"
            >
              Bericht exportieren
            </AkButton>
          </CardFooter>
        )}
      </CardShell>
    </motion.div>
  )
}

