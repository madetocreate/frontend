'use client'

import { useState } from 'react'
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  TableCellsIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export function CRMExplorer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dummy Data
  const customers = [
    { id: 'CUST-001', name: 'Müller GmbH', type: 'Firma', status: 'Active', created: '2023-11-01' },
    { id: 'CUST-002', name: 'Schmidt & Co', type: 'Firma', status: 'Inactive', created: '2023-10-15' },
    { id: 'CUST-003', name: 'Dr. Weber', type: 'Privat', status: 'Active', created: '2023-12-05' },
    { id: 'CUST-004', name: 'TechStart Inc', type: 'Firma', status: 'Lead', created: '2024-01-10' },
  ]

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ak-color-text-secondary)]" />
          <input 
            type="text" 
            placeholder="Datenbank durchsuchen..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] py-2 pl-9 pr-3 text-sm focus:border-[var(--ak-color-accent)] focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm font-medium hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm font-medium hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            <ArrowUpTrayIcon className="h-4 w-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm font-medium text-[var(--ak-semantic-danger)] hover:bg-[var(--ak-color-bg-hover)] hover:border-[color-mix(in oklab,var(--ak-semantic-danger) 40%,var(--ak-color-border-fine) 60%)] transition-colors">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50">
          <div className="flex items-center gap-2 text-[var(--ak-color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-1">
            <TableCellsIcon className="h-4 w-4" /> Records
          </div>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">1,248</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50">
          <div className="flex items-center gap-2 text-[var(--ak-color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-1">
            <ExclamationTriangleIcon className="h-4 w-4 text-[var(--ak-semantic-warning)]" /> Duplicates
          </div>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">12</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50">
          <div className="flex items-center gap-2 text-[var(--ak-color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-1">
            <ArrowDownTrayIcon className="h-4 w-4" /> Last Backup
          </div>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">2h ago</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-[var(--ak-color-border-subtle)] overflow-hidden bg-[var(--ak-color-bg-surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--ak-color-bg-surface-muted)] border-b border-[var(--ak-color-border-subtle)]">
            <tr>
              <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] w-10">
                <input type="checkbox" className="rounded border-[var(--ak-color-border-subtle)]" />
              </th>
              <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">ID</th>
              <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Name</th>
              <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Type</th>
              <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
              <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ak-color-border-subtle)]">
            {filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-[var(--ak-color-bg-hover)] transition-colors group">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(customer.id)}
                    onChange={() => toggleSelect(customer.id)}
                    className="rounded border-[var(--ak-color-border-subtle)]" 
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--ak-color-text-secondary)]">{customer.id}</td>
                <td className="px-4 py-3 font-medium text-[var(--ak-color-text-primary)]">{customer.name}</td>
                <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">{customer.type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${customer.status === 'Active' ? 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]' : 
                      customer.status === 'Inactive' ? 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]' : 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ak-color-text-secondary)] font-mono text-xs">{customer.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
