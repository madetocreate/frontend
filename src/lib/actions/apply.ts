import { recordAudit } from './audit'
import type { ActionId, ActionOutput, ApplyResult, ActionRunResult } from './types'
import { formatOutputText } from './utils/format'
import type { InboxTabId } from '../inbox/actions'
import type { ActivityEntry as InboxActivity } from '@/components/inbox/ActivityPanel'
import type { ActivityEntry as CustomerActivity } from '@/modules/customers/panels/CustomerActivityPanel'
import type { HistoryEntry as StorageHistory } from '@/modules/settings/storage/types'

type InboxTarget = {
  module: 'inbox'
  updateTab: (tab: InboxTabId, content: string, append?: boolean) => void
  setActiveTab: (tab: InboxTabId) => void
  addActivity: (entry: InboxActivity) => void
  labelLookup: (id: ActionId) => string
  targetId?: string
}

type SimpleTarget = {
  module: 'customers' | 'growth' | 'storage'
  setResult: (text: string) => void
  addActivity: (entry: CustomerActivity | StorageHistory | { id: string; label: string; time: string }) => void
  labelLookup: (id: ActionId) => string
  targetId?: string
}

type DocumentsTarget = {
  module: 'documents'
  updateTabs: (data: Partial<Record<'summary' | 'extraction' | 'tasks' | 'history', string>>) => void
  addHistory: (entry: { id: string; label: string; time: string }) => void
  targetId?: string
}

export type ApplyTarget = InboxTarget | SimpleTarget | DocumentsTarget

const toTabForInbox: Partial<Record<ActionId, InboxTabId>> = {
  'inbox.summarize': 'summary',
  'inbox.top3': 'summary',
  'inbox.draftReply': 'draft',
  'inbox.nextSteps': 'tasks',
  'inbox.assignCase': 'history',
  'inbox.setNotifications': 'history',
  // fallback mappings for other modules (unused in inbox target)
  'customers.profileShort': 'summary',
  'customers.top3Open': 'summary',
  'customers.nextSteps': 'summary',
  'customers.followupDraft': 'draft',
  'customers.timelineSummary': 'summary',
  'customers.risksBlockers': 'history',
  'customers.suggestTags': 'history',
  'growth.variants3': 'draft',
  'growth.hookImprove': 'draft',
  'growth.ctaSuggestions': 'draft',
  'growth.translate': 'draft',
  'growth.campaignPlan': 'tasks',
  'growth.newsletterStart': 'tasks',
  'growth.keywordCluster': 'tasks',
  'storage.summarize': 'summary',
  'storage.extractFacts': 'summary',
  'storage.saveAsMemory': 'history',
  'storage.suggestTags': 'summary',
  'storage.editMemory': 'summary',
  'documents.summarize': 'summary',
  'documents.extractKeyFields': 'summary',
  'documents.classify': 'history',
  'documents.suggestNextSteps': 'tasks',
  'documents.saveAsMemory': 'history',
  'documents.routeToCase': 'history',
}

const makeActivityId = () => Math.random().toString(36).slice(2, 10)

function handleInbox(target: InboxTarget, actionId: ActionId, output: ActionOutput): string {
  const text = formatOutputText(output)
  const tab = (toTabForInbox[actionId] as InboxTabId) || 'history'
  const append = actionId === 'inbox.top3' || actionId === 'inbox.nextSteps'
  target.updateTab(tab, text, append)
  target.setActiveTab(tab)
  target.addActivity({
    id: makeActivityId(),
    label: target.labelLookup(actionId),
    type: actionId,
    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
  })
  return text
}

function handleSimple(target: SimpleTarget, actionId: ActionId, output: ActionOutput): string {
  const text = formatOutputText(output)
  target.setResult(text)
  target.addActivity({
    id: makeActivityId(),
    label: target.labelLookup(actionId),
    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    type: actionId,
  } as unknown as CustomerActivity)
  return text
}

function handleDocuments(target: DocumentsTarget, actionId: ActionId, output: ActionOutput): string {
  const text = formatOutputText(output)
  const historyEntry = {
    id: makeActivityId(),
    label: actionId,
    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
  }
  switch (actionId) {
    case 'documents.summarize':
      target.updateTabs({ summary: text })
      break
    case 'documents.extractKeyFields':
      target.updateTabs({ extraction: text })
      break
    case 'documents.suggestNextSteps':
      target.updateTabs({ tasks: text })
      break
    default:
      target.updateTabs({ history: text })
      break
  }
  target.addHistory(historyEntry)
  return text
}

export function applyAction(result: ActionRunResult, target: ApplyTarget): ApplyResult {
  let appliedText = ''
  if (target.module === 'inbox') {
    appliedText = handleInbox(target, result.action.id, result.output)
  } else if (target.module === 'documents') {
    appliedText = handleDocuments(target, result.action.id, result.output)
  } else {
    appliedText = handleSimple(target, result.action.id, result.output)
  }

  const audit = recordAudit({
    actionId: result.action.id,
    module: target.module,
    targetId: target.targetId,
    preview: result.previewText,
    outputType: result.action.outputType,
  })

  return { appliedText, auditId: audit.id }
}
