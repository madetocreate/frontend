'use client'

import { useState } from 'react'
import { 
  TableCellsIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

interface TableColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'status' | 'date' | 'currency'
  align?: 'left' | 'center' | 'right'
}

interface TableRow {
  id: string
  [key: string]: string | number | boolean | undefined
}

interface DataTableCardProps {
  id: string
  title: string
  subtitle?: string
  columns: TableColumn[]
  rows: TableRow[]
  totalRows?: number
  isExpanded?: boolean
  onClose?: () => void
  onRowClick?: (row: TableRow) => void
  onLoadMore?: () => void
  onAction?: (action: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  aktiv: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ausstehend: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  inaktiv: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  churn: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  risk: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function DataTableCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  title,
  subtitle,
  columns,
  rows,
  totalRows,
  isExpanded: initialExpanded = false,
  onClose,
  onRowClick,
  onLoadMore,
  onAction,
}: DataTableCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  // Show first 5 rows when collapsed
  const visibleRows = isExpanded ? rows : rows.slice(0, 5)
  const hasMore = totalRows ? totalRows > rows.length : false

  const renderCell = (column: TableColumn, value: string | number | boolean | undefined) => {
    if (value === undefined || value === null) return '-'

    switch (column.type) {
      case 'status':
        const statusKey = String(value).toLowerCase()
        const statusColor = STATUS_COLORS[statusKey] || 'bg-gray-100 text-gray-700'
        return (
          <span className={clsx(
            "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider",
            statusColor
          )}>
            {String(value)}
          </span>
        )
      case 'currency':
        return (
          <span className="font-mono font-medium">
            {typeof value === 'number' 
              ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
              : value
            }
          </span>
        )
      case 'number':
        return (
          <span className="font-mono">
            {typeof value === 'number' 
              ? new Intl.NumberFormat('de-DE').format(value)
              : value
            }
          </span>
        )
      case 'date':
        return (
          <span className="text-gray-500 dark:text-gray-400">
            {String(value)}
          </span>
        )
      default:
        return String(value)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shadow-sm">
              <TableCellsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                Daten & Analyse
              </span>
              <p className="text-sm font-bold text-slate-900 leading-tight">{title}</p>
              {subtitle && (
                <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction?.('filter')}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title="Filtern"
            >
              <FunnelIcon className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => onAction?.('export')}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              title="Exportieren"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-slate-400" />
            </button>
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

        {/* Table */}
        <div className="overflow-x-auto bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={clsx(
                      "px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider",
                      column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {visibleRows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      "border-b border-slate-50 transition-colors bg-white",
                      onRowClick && "cursor-pointer hover:bg-blue-50/30"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={clsx(
                          "px-4 py-3 text-sm text-slate-700 font-medium",
                          column.align === 'right' ? 'text-right font-mono' : column.align === 'center' ? 'text-center' : 'text-left'
                        )}
                      >
                        {renderCell(column, row[column.key])}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-50 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {rows.length} von {totalRows || rows.length} Einträgen
            </span>
            {(hasMore || (!isExpanded && rows.length > 5)) && (
              <button
                onClick={() => {
                  if (!isExpanded) {
                    setIsExpanded(true)
                  } else if (onLoadMore) {
                    onLoadMore()
                  }
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 underline underline-offset-4 decoration-purple-100"
              >
                {!isExpanded ? 'Alle anzeigen' : 'Mehr laden'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

