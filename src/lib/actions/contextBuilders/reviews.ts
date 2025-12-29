import type { ActionContext, ActionRunOptions } from '../types'

export function buildReviewsContext(options: ActionRunOptions): ActionContext {
  const moduleContext = options.moduleContext || {}
  return {
    target: options.target,
    context_v1: {
      module: options.target.module || 'reviews',
      target: {
        id: options.target.targetId || 'review',
        type: options.target.module || 'reviews',
        title: options.target.title,
      },
      moduleContext: moduleContext as Record<string, unknown>,
      uiContext: { surface: 'chat' },
    },
  }
}

