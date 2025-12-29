import type { ActionContext, ActionRunOptions } from '../types'

export function buildCrmContext(options: ActionRunOptions): ActionContext {
  const moduleContext = options.moduleContext || {}
  return {
    target: options.target,
    context_v1: {
      module: options.target.module || 'crm',
      target: {
        id: options.target.targetId || 'crm',
        type: options.target.module || 'crm',
        title: options.target.title,
      },
      moduleContext: moduleContext as Record<string, unknown>,
      uiContext: { surface: 'chat' },
    },
  }
}

