'use client'

import React from 'react'
import { WizardCardPayload } from './types'
import clsx from 'clsx'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'
import { AkButton } from '@/components/ui/AkButton'

interface WizardCardProps {
  card: WizardCardPayload
  onAction?: (actionId: string, params?: any) => void
  onPin?: () => void
}

export function WizardCard({ card, onAction, onPin }: WizardCardProps) {
  const currentStepIndex = card.steps.findIndex(s => s.id === card.currentStepId)
  const currentStep = card.steps[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === card.steps.length - 1

  return (
    <CardShell>
      <CardHeader
        title={card.title}
        subtitle={`Schritt ${currentStepIndex + 1} von ${card.steps.length}`}
        actions={
          onPin && (
            <button 
              onClick={onPin}
              className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
              title="Anpinnen"
            >
              {card.pinned ? <StarIconSolid className="w-4 h-4 text-[var(--ak-semantic-warning)]" /> : <StarIcon className="w-4 h-4" />}
            </button>
          )
        }
      />
      
      <CardBody>
        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6">
          {card.steps.map((step, i) => {
            const isCompleted = i < currentStepIndex
            const isCurrent = i === currentStepIndex
            return (
              <div key={step.id} className="flex-1 flex flex-col gap-1">
                <div className={clsx("h-1 rounded-full transition-all duration-300", 
                  isCompleted ? "bg-[var(--ak-semantic-success)]" : isCurrent ? "bg-[var(--ak-accent-inbox)]" : "bg-[var(--ak-color-border-subtle)]"
                )} />
              </div>
            )
          })}
        </div>

        <h4 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-2">
          {currentStep?.title}
        </h4>
        {currentStep?.description && (
          <p className="text-sm text-[var(--ak-color-text-secondary)] mb-6">
            {currentStep.description}
          </p>
        )}

        {/* Content Placeholder - In real app, render step component here */}
        <div className="min-h-[100px] bg-[var(--ak-color-bg-surface-muted)] border border-dashed border-[var(--ak-color-border-subtle)] rounded-lg flex items-center justify-center text-sm text-[var(--ak-color-text-tertiary)] mb-6">
          {currentStep?.component || "Form Content Here"}
        </div>
      </CardBody>
      
      <CardFooter>
        <AkButton
          variant="secondary"
          onClick={() => onAction?.(card.onCancelAction || 'cancel')}
          size="sm"
        >
          Abbrechen
        </AkButton>
        {!isFirst && (
          <AkButton
            variant="secondary"
            onClick={() => onAction?.('back')}
            size="sm"
          >
            Zurück
          </AkButton>
        )}
        <AkButton
          variant="primary"
          accent="graphite"
          onClick={() => onAction?.(isLast ? (card.onFinishAction || 'finish') : 'next')}
          size="sm"
        >
          {isLast ? 'Abschließen' : 'Weiter'}
        </AkButton>
      </CardFooter>
    </CardShell>
  )
}
