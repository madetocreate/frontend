import type { ActionContext, ActionRunOptions } from '../types'
import { redactPII } from '../utils/redaction'

type DocumentContextInput = {
  document?: {
    id?: string
    title?: string
    type?: string
    tags?: string[]
    author?: string
    contentPreview?: string
    size?: string
  }
}

export function buildDocumentsContext(options: ActionRunOptions): ActionContext {
  const moduleContext = (options.moduleContext || {}) as DocumentContextInput
  const document = moduleContext.document || {}
  return {
    target: options.target,
    title: document.title || options.target.title,
    type: document.type,
    tags: document.tags,
    author: redactPII(document.author),
    preview: redactPII(document.contentPreview),
    size: document.size,
    context_v1: {
      module: options.target.module || 'documents',
      target: {
        id: document.id || options.target.targetId || 'document',
        type: options.target.module || 'documents',
        title: document.title || options.target.title,
      },
      moduleContext: moduleContext as Record<string, unknown>,
      uiContext: { surface: 'chat' },
    },
  }
}
