'use client'

import React, { useState } from 'react'
import { ApprovalCardPayload } from './types'
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { sendInput } from '@/lib/actionRuns/client'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'
import { AkButton } from '@/components/ui/AkButton'

interface ApprovalCardProps {
  card: ApprovalCardPayload
  onAction?: (actionId: string, params?: any) => void
}

export function ApprovalCard({ card, onAction }: ApprovalCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { stepKey, reason, scopes, toolName, runId } = card.payload

  const handleApprove = async () => {
    // ... same logic
    if (!runId || !stepKey) return
    setIsSubmitting(true)
    try {
      await sendInput(runId, { step_key: stepKey, input: { approved: true } })
      onAction?.('approval_approved', { stepKey, runId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    // ... same logic
    if (!runId || !stepKey) return
    setIsSubmitting(true)
    try {
      await sendInput(runId, { step_key: stepKey, input: { approved: false } })
      onAction?.('approval_rejected', { stepKey, runId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CardShell>
      <CardHeader
        icon={<ShieldCheckIcon className="h-6 w-6 text-[var(--ak-semantic-warning)]" />}
        title="Freigabe erforderlich"
        subtitle={toolName ? `Tool: ${toolName}` : undefined}
      />
      <CardBody>
        <p className="text-sm text-[var(--ak-color-text-primary)] mb-3">
          {reason}
        </p>
        {scopes && scopes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
              Benötigte Berechtigungen:
            </p>
            <div className="flex flex-wrap gap-1">
              {scopes.map((scope) => (
                <span
                  key={scope}
                  className="inline-flex items-center rounded px-2 py-0.5 text-xs bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] border border-[var(--ak-color-border-subtle)]"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardBody>
      <CardFooter>
        <AkButton
          onClick={handleReject}
          disabled={isSubmitting}
          variant="secondary"
          size="sm"
          leftIcon={<XCircleIcon className="h-4 w-4" />}
        >
          Abbrechen
        </AkButton>
        <AkButton
          onClick={handleApprove}
          disabled={isSubmitting}
          variant="primary"
          accent="default"
          size="sm"
          leftIcon={<CheckCircleIcon className="h-4 w-4" />}
        >
          Freigeben
        </AkButton>
      </CardFooter>
    </CardShell>
  )
}

