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
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                KI-Analyse & Metriken
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

        {/* Metrics Grid */}
        <div className="p-4 grid grid-cols-2 gap-4 bg-white">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:border-indigo-100 transition-colors">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {metric.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                {metric.change && (
                  <span className={clsx(
                    "text-xs font-bold flex items-center gap-0.5",
                    metric.trend === 'up' ? "text-emerald-600" : metric.trend === 'down' ? "text-rose-600" : "text-slate-400"
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

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-slate-50 flex gap-2">
          <button
            onClick={() => onAction?.('optimize')}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            KI-Optimierung starten
          </button>
          <button
            onClick={() => onAction?.('report')}
            className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Bericht exportieren
          </button>
        </div>
      </div>
    </motion.div>
  )
}

