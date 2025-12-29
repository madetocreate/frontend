'use client'

import React from 'react'
import { ListCardPayload, EntityCardPayload } from './types'
import { MagnifyingGlassIcon, FunnelIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { EntityCard } from './EntityCard'
import { AkButton } from '@/components/ui/AkButton'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { CardShell, CardHeader, CardBody, CardFooter, CardBadge } from '@/components/ui/CardShell'

interface ListCardProps {
  card: ListCardPayload
  onAction?: (actionId: string, params?: any) => void
  onRowClick?: (rowId: string, rowData: any) => void
  onPostEntity?: (entity: EntityCardPayload) => void // "Post as card" action
  onPin?: () => void
  onInfo?: () => void
}

export function ListCard({ card, onAction, onRowClick, onPostEntity, onPin, onInfo }: ListCardProps) {
  
  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row.id, row)
    }
  }

  return (
    <CardShell>
      <CardHeader
        title={card.title}
        subtitle={card.subtitle || `${card.rows.length} Einträge`}
        actions={
          <>
            {onPin && (
              <button 
                onClick={onPin}
                className="p-1.5 ak-text-tertiary hover:ak-text-primary hover:ak-bg-surface-hover rounded-md transition-colors focus-visible:outline-none focus-visible:ring ak-focus-ring"
                title="Anpinnen"
              >
                {(card as any).pinned ? <StarIconSolid className="w-4 h-4 text-[var(--ak-semantic-warning)]" /> : <StarIcon className="w-4 h-4 ak-text-secondary" />}
              </button>
            )}
            {onInfo && (
              <button 
                onClick={onInfo}
                className="p-1.5 ak-text-tertiary hover:ak-text-primary hover:ak-bg-surface-hover rounded-md transition-colors focus-visible:outline-none focus-visible:ring ak-focus-ring"
                title="Details"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
            )}
            {card.actions?.map(action => (
              <button 
                key={action.id}
                onClick={() => onAction?.(action.id, action.params)}
                className="p-1.5 ak-text-tertiary hover:ak-text-primary hover:ak-bg-surface-hover rounded-md transition-colors focus-visible:outline-none focus-visible:ring ak-focus-ring"
                title={action.label}
              >
                {action.icon}
              </button>
            ))}
          </>
        }
      />
      
      <CardBody>
        {/* Search / Filter Stub */}
        <div className="flex items-center gap-2 ak-bg-surface-muted px-3 py-2 rounded-lg mb-4">
           <MagnifyingGlassIcon className="w-4 h-4 ak-text-tertiary" />
           <input 
             type="text" 
             placeholder="Suchen..." 
            className="bg-transparent border-none outline-none text-xs w-full ak-text-primary placeholder:ak-text-tertiary"
           />
           <button className="ak-text-tertiary hover:ak-text-secondary transition-colors">
             <FunnelIcon className="w-4 h-4" />
           </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto ak-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="ak-bg-surface-muted text-xs ak-text-tertiary font-medium sticky top-0 z-10">
              <tr>
                {card.columns.map(col => (
                  <th key={col.key} className={clsx("px-4 py-2", {
                    "text-right": col.align === 'right',
                    "text-center": col.align === 'center',
                  })}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ak-color-border-subtle)]">
              {card.rows.map(row => {
                 const isSelected = card.selectedItemId === row.id
                 return (
                   <React.Fragment key={row.id}>
                      <tr 
                        onClick={() => handleRowClick(row)}
                        className={clsx(
                          "cursor-pointer transition-colors",
                          isSelected
                            ? "ak-bg-inbox-soft border ak-border-inbox"
                            : "hover:ak-bg-surface-hover"
                        )}
                      >
                        {card.columns.map(col => (
                          <td key={col.key} className={clsx("px-4 py-3 whitespace-nowrap", {
                            "text-right": col.align === 'right',
                            "text-center": col.align === 'center',
                          })}>
                            {col.type === 'status' ? (
                              <CardBadge variant={row[col.key] === 'active' ? 'success' : 'neutral'}>
                                {row[col.key]}
                              </CardBadge>
                            ) : (
                              <span className="ak-text-primary">
                                {row[col.key]}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                      
                      {/* Inline Expansion (Threading) */}
                      <AnimatePresence>
                        {isSelected && card.expandedItemData && (
                          <tr className="ak-bg-inbox-soft">
                            <td colSpan={card.columns.length} className="p-0 border-b border ak-border-inbox border-opacity-25">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                 <div className="p-3">
                                    <div className="ak-card-glass rounded-xl border ak-border-default shadow-sm p-3 relative">
                                       <EntityCard 
                                         card={card.expandedItemData} 
                                         onAction={onAction}
                                         embedded
                                       />
                                       <div className="flex justify-end pt-3 mt-3 border-t border-[var(--ak-color-border-subtle)]">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              onPostEntity?.(card.expandedItemData!)
                                            }}
                                            className="text-xs font-medium ak-text-accent-inbox hover:brightness-110 ak-bg-inbox-soft px-3 py-1.5 rounded-lg transition-colors"
                                          >
                                            Als Karte in Chat posten
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                   </React.Fragment>
                 )
              })}
            </tbody>
          </table>
        </div>
        {card.totalRows && card.totalRows > card.rows.length && (
          <div className="mt-4 px-4 py-2 text-xs text-center ak-text-tertiary border-t border ak-border-default ak-bg-surface-muted rounded-lg">
             +{card.totalRows - card.rows.length} weitere Einträge
           </div>
        )}
      </CardBody>

      {/* AI Suggestions Grid - immer unten an der Card */}
      <CardFooter divider={false}>
        <AISuggestionGrid
          context={card.source?.moduleToken === 'documents' ? 'document' : 
                  card.source?.moduleToken === 'customers' ? 'customer' : 
                  card.source?.moduleToken === 'growth' ? 'growth' : 'inbox'}
          summary={card.title}
          text={card.subtitle}
          onActionSelect={(action) => {
            onAction?.(action.id, action.payload)
          }}
          className="!bg-transparent !border-0 !p-0 w-full"
        />
      </CardFooter>
    </CardShell>
  )
}
