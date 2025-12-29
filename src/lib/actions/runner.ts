'use client'

import { getActionDefinition, normalizeExecutableActionId, type ExecutableActionId } from './registry'
import { validateOutput } from './schemas'
import type { ActionId, ActionRunOptions, ActionRunResult, ActionModule } from './types'
import { formatOutputText } from './utils/format'
import { buildInboxContext } from './contextBuilders/inbox'
import { buildCustomersContext } from './contextBuilders/customers'
import { buildGrowthContext } from './contextBuilders/growth'
import { buildStorageContext } from './contextBuilders/storage'
import { buildDocumentsContext } from './contextBuilders/documents'
import { buildCrmContext } from './contextBuilders/crm'
import { buildReviewsContext } from './contextBuilders/reviews'
import { startRun, getRunStatus } from '../actionRuns/client'

const contextBuilderByModule: Record<ActionModule, (options: ActionRunOptions) => Record<string, unknown>> = {
  inbox: buildInboxContext,
  customers: buildCustomersContext,
  growth: buildGrowthContext,
  storage: buildStorageContext,
  documents: buildDocumentsContext,
  crm: buildCrmContext,
  reviews: buildReviewsContext,
  calendar: (options) => ({ target: options.target }),
  automation: (options) => ({ target: options.target }),
  telephony: (options) => ({ target: options.target }),
  telegram: (options) => ({ target: options.target }),
  website: (options) => ({ target: options.target }),
}

export async function runAction(actionId: ActionId, options: ActionRunOptions): Promise<ActionRunResult> {
  const normalizedActionId = normalizeExecutableActionId(actionId)
  if (!normalizedActionId) {
    throw new Error(`Aktion ${actionId} ist nicht ausführbar (nicht in EXECUTABLE_ACTION_IDS).`)
  }

  const action = getActionDefinition(normalizedActionId)
  if (!action) {
    throw new Error(`Aktion ${actionId} nicht registriert`)
  }

  if (!action.supportedModules.includes(options.target.module)) {
    throw new Error(`Aktion ${actionId} unterstützt Modul ${options.target.module} nicht`)
  }

  const builder = contextBuilderByModule[options.target.module]
  const context = builder ? builder(options) : { target: options.target }

  // Start action run via backend
  const runResult = await startRun(
    {
      actionId: normalizedActionId as ExecutableActionId,
      context: {
        module: options.target.module,
        target: {
          id: options.target.targetId,
          type: options.target.subtype || options.target.module,
          title: options.target.title,
        },
        moduleContext: context,
      },
      config: options.config,
      stream: false, // Non-streaming for panel-based actions
    }
  )

  // Phase 2: Handle needs_input status (missing fields)
  if (runResult.status === 'needs_input') {
    // Return needs_input result (caller should handle UI)
    return {
      action: { ...action, ...options.actionOverrides },
      output: null,
      context,
      previewText: '',
      needsInput: {
        missingFields: runResult.missingFields || [],
        errors: runResult.errors || [],
        reasonCode: runResult.reasonCode,  // Phase 5
      },
    } as any  // Type assertion for needs_input case
  }

  // Wait for completion
  let finalResult = runResult
  let attempts = 0
  const maxAttempts = 60 // 30 seconds max wait

  while (finalResult.status === 'running' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 500))
    finalResult = await getRunStatus(runResult.runId)
    attempts++
  }

  if (finalResult.status === 'failed') {
    // Create notification for failed action
    const { notifyActionFailed } = await import('@/lib/notifications/system')
    const targetTitle = options.target.title || options.target.targetId
    notifyActionFailed(
      normalizedActionId,
      finalResult.error || 'Action execution failed',
      targetTitle,
      options.target.targetId ? `/inbox?id=${options.target.targetId}` : undefined
    )
    throw new Error(finalResult.error || 'Action execution failed')
  }

  // Extract output from result
  const outputData = finalResult.result as Record<string, unknown> | undefined
  if (!outputData) {
    throw new Error('No output data from action run')
  }

  // Validate output against schema
  const validated = validateOutput(action.outputType, outputData)
  const previewText = formatOutputText(validated)

  // Create notification for completed action
  const { notifyActionCompleted } = await import('@/lib/notifications/system')
  const targetTitle = options.target.title || options.target.targetId
  notifyActionCompleted(
    normalizedActionId,
    targetTitle,
    options.target.targetId ? `/inbox?id=${options.target.targetId}` : undefined
  )

  return {
    action: { ...action, ...options.actionOverrides },
    output: validated,
    context,
    previewText,
  }
}
