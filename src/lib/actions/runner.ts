import { getActionDefinition } from './registry'
import { validateOutput } from './schemas'
import type { ActionId, ActionRunOptions, ActionRunResult, ActionModule } from './types'
import { runLLM } from './adapters/stubLLM'
import { formatOutputText } from './utils/format'
import { buildInboxContext } from './contextBuilders/inbox'
import { buildCustomersContext } from './contextBuilders/customers'
import { buildGrowthContext } from './contextBuilders/growth'
import { buildStorageContext } from './contextBuilders/storage'
import { buildDocumentsContext } from './contextBuilders/documents'

const contextBuilderByModule: Record<ActionModule, (options: ActionRunOptions) => Record<string, unknown>> = {
  inbox: buildInboxContext,
  customers: buildCustomersContext,
  growth: buildGrowthContext,
  storage: buildStorageContext,
  documents: buildDocumentsContext,
}

export async function runAction(actionId: ActionId, options: ActionRunOptions): Promise<ActionRunResult> {
  const action = getActionDefinition(actionId)
  if (!action) {
    throw new Error(`Aktion ${actionId} nicht registriert`)
  }

  if (!action.supportedModules.includes(options.target.module)) {
    throw new Error(`Aktion ${actionId} unterstützt Modul ${options.target.module} nicht`)
  }

  const builder = contextBuilderByModule[options.target.module]
  const context = builder ? builder(options) : { target: options.target }

  const rawOutput = await runLLM(actionId, context)
  const validated = validateOutput(action.outputType, rawOutput)
  const previewText = formatOutputText(validated)

  return {
    action: { ...action, ...options.actionOverrides },
    output: validated,
    context,
    previewText,
  }
}
