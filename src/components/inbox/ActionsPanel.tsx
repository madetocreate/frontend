'use client'

import React, { useMemo, useState } from 'react'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { DrawerCard, ActionGroup, ActionButton } from '@/components/ui/drawer-kit'
import type { ActionRunResult } from '@/lib/actions/types'
import { runAction } from '@/lib/actions/runner'
import { listActionsForModule } from '@/lib/actions/registry'
import type { ActionId } from '@/lib/actions/types'

interface ActionsPanelProps {
  item: InboxItem
  onApplyAction: (result: ActionRunResult) => void
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({ item, onApplyAction }) => {
  const [activeActionId, setActiveActionId] = useState<ActionId | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewOutput, setPreviewOutput] = useState<ActionRunResult | null>(null)

  const actions = useMemo(
    () => listActionsForModule('inbox').sort((a, b) => (a.uiOrder ?? 0) - (b.uiOrder ?? 0)),
    [],
  )

  const handleActionClick = async (id: ActionId) => {
    setActiveActionId(id)
    setIsGenerating(true)
    setPreviewOutput(null)

    try {
      const result = await runAction(id, {
        target: { module: 'inbox', targetId: item.id },
        moduleContext: { item },
      })
      setPreviewOutput(result)
    } catch (error) {
      console.error('Action run failed', error)
      setPreviewOutput(null)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <DrawerCard title="Quick Actions">
        <div className="space-y-4">
          <ActionGroup label="Empfohlen">
            {actions.map((action) => {
              const actionId = action.id
              const isActive = activeActionId === actionId
              
              return (
                <ActionButton
                  key={actionId}
                  icon={<SparklesIcon className="h-3.5 w-3.5" />}
                  label={action.label}
                  onClick={() => handleActionClick(actionId)}
                  variant={isActive ? 'primary' : 'secondary'}
                  loading={isActive && isGenerating}
                />
              )
            })}
            {actions.length === 0 && (
              <p className="text-xs text-[var(--ak-color-text-muted)]">Keine ausführbaren Aktionen verfügbar.</p>
            )}
          </ActionGroup>
        </div>
      </DrawerCard>

      {activeActionId && previewOutput && (
        <DrawerCard>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-[var(--ak-color-text-primary)] mb-1">
                {actions.find((a) => a.id === activeActionId)?.label || activeActionId}
              </p>
              <p className="text-[11px] text-[var(--ak-color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {previewOutput.previewText || 'Keine Vorschau verfügbar'}
              </p>
            </div>
            <div className="flex gap-2">
              <ActionButton
                icon={<SparklesIcon className="h-3.5 w-3.5" />}
                label="Anwenden"
                onClick={() => {
                  onApplyAction(previewOutput)
                  setActiveActionId(null)
                  setPreviewOutput(null)
                }}
                variant="primary"
              />
              <ActionButton
                icon={<SparklesIcon className="h-3.5 w-3.5" />}
                label="Verwerfen"
                onClick={() => {
                  setActiveActionId(null)
                  setPreviewOutput(null)
                }}
                variant="ghost"
              />
            </div>
          </div>
        </DrawerCard>
      )}
    </div>
  )
}

