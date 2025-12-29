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
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'

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
  active: 'ak-badge-success',
  aktiv: 'ak-badge-success',
  pending: 'ak-badge-warning',
  ausstehend: 'ak-badge-warning',
  inactive: 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]',
  inaktiv: 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]',
  churn: 'ak-badge-danger',
  risk: 'ak-badge-danger',
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
        const statusColor = STATUS_COLORS[statusKey] || 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]'
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
          <span className="ak-text-muted">
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
      className="w-full"
    >
      <CardShell>
        <CardHeader
          icon={<TableCellsIcon className="w-5 h-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
          title={title}
          subtitle={subtitle || "Daten & Analyse"}
          actions={
            <>
              <button
                onClick={() => onAction?.('filter')}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title="Filtern"
              >
                <FunnelIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAction?.('export')}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title="Exportieren"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title={isExpanded ? 'Einklappen' : 'Erweitern'}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                  title="Schließen"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </>
          }
        />

        {/* Table */}
        <CardBody padding="none" className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={clsx(
                      "px-4 py-2.5 text-[10px] font-bold text-[var(--ak-color-text-tertiary)] uppercase tracking-wider",
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
                      "border-b border-[var(--ak-color-border-subtle)] transition-colors ak-bg-surface-1",
                      onRowClick && "cursor-pointer hover:bg-[var(--ak-color-bg-hover)]"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={clsx(
                          "px-4 py-3 text-sm text-[var(--ak-color-text-primary)] font-medium",
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
        </CardBody>

        {/* Footer */}
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-[var(--ak-color-text-tertiary)]">
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
                className="text-xs font-bold text-[var(--ak-accent-documents)] hover:brightness-110 underline underline-offset-4 decoration-[var(--ak-accent-documents-soft)]"
              >
                {!isExpanded ? 'Alle anzeigen' : 'Mehr laden'}
              </button>
            )}
          </div>
        </CardFooter>
      </CardShell>
    </motion.div>
  )
}

