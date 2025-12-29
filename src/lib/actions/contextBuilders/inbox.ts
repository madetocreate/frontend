import type { ActionContext, ActionRunOptions } from '../types'
import { redactPII } from '../utils/redaction'

type InboxModuleContext = {
  item?: {
    id?: string
    threadId?: string
    title?: string
    snippet?: string
    sender?: string
    channel?: string
    body?: string
  }
}

export function buildInboxContext(options: ActionRunOptions): ActionContext {
  const moduleContext = (options.moduleContext || {}) as InboxModuleContext
  const item = moduleContext.item || {}
  
  // Extract inboxThreadId from item.id, item.threadId, or target.targetId
  const inboxThreadId = item.threadId || item.id || options.target.targetId
  
  // Return context that will be placed in moduleContext
  // The backend expects moduleContext.inboxThreadId for workflow templating
  const context: ActionContext = {
    target: options.target,
    title: item.title || options.target.title,
    channel: item.channel,
    sender: redactPII(item.sender),
    preview: redactPII(item.snippet || item.body || ''),
  }
  context.context_v1 = {
    module: options.target.module || 'inbox',
    target: {
      id: inboxThreadId || options.target.targetId || 'inbox-item',
      type: options.target.module || 'inbox',
      title: item.title || options.target.title,
    },
    moduleContext: moduleContext as Record<string, unknown>,
    uiContext: { surface: 'chat' },
  }
  
  // Set inboxThreadId directly in the context (will be in moduleContext.inboxThreadId)
  if (inboxThreadId) {
    (context as Record<string, unknown>).inboxThreadId = inboxThreadId
  }
  
  // Also include the full item for backwards compatibility
  if (item && Object.keys(item).length > 0) {
    (context as Record<string, unknown>).item = item
  }
  
  return context
}
