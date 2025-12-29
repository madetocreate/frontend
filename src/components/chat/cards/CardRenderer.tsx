'use client'

import React from 'react'
import { ChatCard, EntityCardPayload } from './types'
import { EntityCard } from './EntityCard'
import { ListCard } from './ListCard'
import { InsightCard } from './InsightCard'
import { WizardCard } from './WizardCard'
import { ApprovalCard } from './ApprovalCard'
import { UserInputCard } from './UserInputCard'
import { DraftReplyCard } from './DraftReplyCard'
import type { DraftReplyCardPayload, NeedsInputCardPayload } from './types'
import { ChatCardErrorBoundary } from '../ErrorBoundary'
import { LaunchGateErrorCard } from '@/components/actions/LaunchGateErrorCard'
import { NeedsInputCard } from './NeedsInputCard'

interface CardRendererProps {
  card: ChatCard
  onAction?: (actionId: string, params?: any) => void
  onRowClick?: (rowId: string, rowData: any) => void
  onPostEntity?: (entity: EntityCardPayload) => void
  onPin?: (card: ChatCard) => void
  onInfo?: (card: ChatCard) => void
  className?: string
}

export function CardRenderer({ card, onAction, onRowClick, onPostEntity, onPin, onInfo, className }: CardRendererProps) {
  
  const handlePin = () => {
    onPin?.(card)
  }

  const handleInfo = () => {
    onInfo?.(card)
  }

  const commonProps = {
    onAction,
    onPin: handlePin,
    onInfo: handleInfo,
  }

  return (
    <ChatCardErrorBoundary>
      <div className={className}>
        {card.type === 'entity' && <EntityCard card={card} {...commonProps} />}
        {card.type === 'list' && <ListCard card={card} {...commonProps} onRowClick={onRowClick} onPostEntity={onPostEntity} />}
        {card.type === 'insight' && <InsightCard card={card} {...commonProps} />}
        {card.type === 'wizard' && <WizardCard card={card} {...commonProps} />}
        {card.type === 'draft_reply' && (() => {
          const draftCard = card as DraftReplyCardPayload;
          return (
            <DraftReplyCard
              draftText={draftCard.payload.draftText}
              tone={draftCard.payload.tone}
              keyPointsAddressed={draftCard.payload.keyPointsAddressed}
              suggestedSubject={draftCard.payload.suggestedSubject}
              onApply={onAction ? () => onAction('apply', { card: draftCard }) : undefined}
              onEdit={onAction ? () => onAction('edit', { card: draftCard }) : undefined}
            />
          );
        })()}
        {card.type === 'approval' && <ApprovalCard card={card} onAction={onAction} />}
        {card.type === 'user_input' && <UserInputCard card={card} onAction={onAction} />}
        {card.type === 'launch_gate_error' && (() => {
          const errorCode = (card.metadata?.errorCode as string) || 'unknown'
          const details = card.metadata?.details as Record<string, unknown> | undefined
          return (
            <LaunchGateErrorCard
              errorCode={errorCode as any}
              message={card.content}
              details={details}
            />
          )
        })()}
        {card.type === 'needs_input' && (() => {
          // Phase 2: NeedsInputCard
          const needsInputCard = card as NeedsInputCardPayload
          return (
            <NeedsInputCard
              actionId={needsInputCard.payload.actionId}
              missingFields={needsInputCard.payload.missingFields}
              errors={needsInputCard.payload.errors}
              reasonCode={needsInputCard.payload.reasonCode}  // Phase 5
              onFix={async (params) => {
                // Re-execute action with fixed params
                if (onAction) {
                  await onAction('fix_params', { actionId: needsInputCard.payload.actionId, params })
                }
              }}
            />
          )
        })()}
      </div>
    </ChatCardErrorBoundary>
  )
}
