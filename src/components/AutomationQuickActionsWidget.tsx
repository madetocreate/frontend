'use client'

import type { FC } from 'react'
import {
  BoltIcon,
  ArrowPathIcon,
  ClockIcon,
  EnvelopeIcon,
  DocumentCheckIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline'
import { QuickActionsWidget, type QuickActionDefinition } from '@/components/QuickActionsWidget'

const AUTOMATION_QUICK_ACTIONS: QuickActionDefinition[] = [
  {
    id: 'workflow_creation',
    title: 'Workflow erstellen',
    description: 'Definiere automatisierte Abläufe für wiederkehrende Aufgaben und Prozesse.',
    icon: <BoltIcon className="h-4 w-4" />,
  },
  {
    id: 'task_automation',
    title: 'Aufgaben automatisieren',
    description: 'Automatisiere Routineaufgaben und spare Zeit für wichtige Entscheidungen.',
    icon: <ArrowPathIcon className="h-4 w-4" />,
  },
  {
    id: 'schedule_automation',
    title: 'Zeitpläne automatisieren',
    description: 'Erstelle automatisierte Zeitpläne für wiederkehrende Aktionen und Berichte.',
    icon: <ClockIcon className="h-4 w-4" />,
  },
  {
    id: 'email_automation',
    title: 'E-Mail-Automatisierung',
    description: 'Richte automatische Antworten, Weiterleitungen und Kategorisierungen ein.',
    icon: <EnvelopeIcon className="h-4 w-4" />,
  },
  {
    id: 'approval_workflows',
    title: 'Genehmigungs-Workflows',
    description: 'Automatisiere Genehmigungsprozesse und Benachrichtigungen für Entscheidungen.',
    icon: <DocumentCheckIcon className="h-4 w-4" />,
  },
  {
    id: 'report_automation',
    title: 'Berichte automatisieren',
    description: 'Erstelle automatische Berichte und Dashboards für regelmäßige Analysen.',
    icon: <ChartBarSquareIcon className="h-4 w-4" />,
  },
]

export type AutomationQuickActionsWidgetProps = {
  onSelectAction?: (id: string) => void
}

export const AutomationQuickActionsWidget: FC<AutomationQuickActionsWidgetProps> = ({
  onSelectAction,
}) => {
  return (
    <QuickActionsWidget
      title=""
      subtitle=""
      source="automation"
      columns={1}
      actions={AUTOMATION_QUICK_ACTIONS}
      onSelectAction={onSelectAction}
    />
  )
}

