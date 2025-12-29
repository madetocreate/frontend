'use client'

import React, { useState } from 'react'
import { InsightCardPayload } from './types'
import clsx from 'clsx'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon, LightBulbIcon, StarIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'

interface InsightCardProps {
  card: InsightCardPayload
  onAction?: (actionId: string, params?: any) => void
  onPin?: () => void
  onInfo?: () => void
}

export function InsightCard({ card, onAction, onPin, onInfo }: InsightCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <CardShell>
      <CardHeader
        icon={<LightBulbIcon className="w-5 h-5 text-[var(--ak-semantic-warning)]" />}
        title={card.title}
        actions={
          <>
            {onPin && (
              <button 
                onClick={onPin}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title="Anpinnen"
              >
                {card.pinned ? <StarIconSolid className="w-4 h-4 text-[var(--ak-semantic-warning)]" /> : <StarIcon className="w-4 h-4" />}
              </button>
            )}
            {onInfo && (
              <button 
                onClick={() => setShowExplanation(!showExplanation)}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title="Details / Warum?"
              >
                <InformationCircleIcon className="w-4 h-4" />
              </button>
            )}
          </>
        }
      />
      
      <CardBody>
        <div className="text-sm text-[var(--ak-color-text-primary)] leading-relaxed">
          {card.content}
        </div>

        {card.metrics && card.metrics.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--ak-color-border-subtle)]">
             {card.metrics.map((metric, i) => (
               <div key={i} className="flex flex-col">
                 <span className="text-[10px] text-[var(--ak-color-text-tertiary)] uppercase tracking-wide">{metric.label}</span>
                 <div className="flex items-end gap-1.5">
                   <span className="text-lg font-semibold text-[var(--ak-color-text-primary)]">{metric.value}</span>
                   {metric.trend && (
                     <span className={clsx("text-xs font-medium mb-1 flex items-center", 
                        metric.trend === 'up' ? "text-[var(--ak-semantic-success)]" : 
                        metric.trend === 'down' ? "text-[var(--ak-semantic-danger)]" : "text-[var(--ak-color-text-tertiary)]"
                     )}>
                       {metric.trend === 'up' && <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />}
                       {metric.trend === 'down' && <ArrowTrendingDownIcon className="w-3 h-3 mr-0.5" />}
                       {metric.trend === 'neutral' && <MinusIcon className="w-3 h-3 mr-0.5" />}
                       {metric.change}
                     </span>
                   )}
                 </div>
               </div>
             ))}
          </div>
        )}
        
        {showExplanation && card.explanation && (
          <div className="mt-3 p-3 ak-badge-warning rounded-lg text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <strong>Warum?</strong> {card.explanation}
          </div>
        )}
      </CardBody>

      {/* AI Suggestions Grid - immer unten an der Card */}
      <CardFooter divider={false}>
        <AISuggestionGrid
          context={card.source?.moduleToken === 'shield' ? 'shield' :
                  card.source?.moduleToken === 'phone' ? 'telephony' :
                  card.source?.moduleToken === 'website' ? 'website' :
                  card.source?.moduleToken === 'growth' ? 'growth' : 'inbox'}
          summary={card.title}
          text={card.content}
          onActionSelect={(action) => {
            onAction?.(action.id, action.payload)
          }}
          className="!bg-transparent !border-0 !p-0 w-full"
        />
      </CardFooter>
    </CardShell>
  )
}
