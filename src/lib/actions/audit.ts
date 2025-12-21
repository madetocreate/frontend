import type { ActionId, AuditEntry, ActionModule, ActionOutputType } from './types'

const auditLog: AuditEntry[] = []

const makeId = () => Math.random().toString(36).slice(2, 10)

export function recordAudit(params: { actionId: ActionId; module: ActionModule; targetId?: string; preview: string; outputType: ActionOutputType }): AuditEntry {
  const entry: AuditEntry = {
    id: makeId(),
    actionId: params.actionId,
    module: params.module,
    targetId: params.targetId,
    preview: params.preview,
    outputType: params.outputType,
    createdAt: new Date().toISOString(),
  }
  auditLog.unshift(entry)
  return entry
}

export function getAuditLog(): AuditEntry[] {
  return [...auditLog]
}
