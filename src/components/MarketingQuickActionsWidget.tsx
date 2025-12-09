'use client'

import type { FC } from 'react'
import {
  EnvelopeOpenIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  CursorArrowRaysIcon,
  MegaphoneIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { QuickActionsWidget, type QuickActionDefinition } from '@/components/QuickActionsWidget'

const MARKETING_QUICK_ACTIONS: QuickActionDefinition[] = [
  {
    id: 'plan_email_campaign',
    title: 'E-Mail-Kampagne planen',
    description: 'Definiere Ziel, Zielgruppe und Inhalte für deine nächste Kampagne.',
    icon: <EnvelopeOpenIcon className="h-4 w-4" />,
  },
  {
    id: 'newsletter_ideas',
    title: 'Newsletter-Ideen generieren',
    description: 'Erhalte Themen und Betreffzeilen, die zu deiner Zielgruppe passen.',
    icon: <LightBulbIcon className="h-4 w-4" />,
  },
  {
    id: 'social_calendar',
    title: 'Social-Media-Plan erstellen',
    description: 'Plane Posts für deine wichtigsten Kanäle in einem klaren Raster.',
    icon: <CalendarDaysIcon className="h-4 w-4" />,
  },
  {
    id: 'landing_copy',
    title: 'Landingpage-Text optimieren',
    description: 'Verbessere Überschriften, Nutzenargumentation und Call-to-Actions deiner Seiten.',
    icon: <CursorArrowRaysIcon className="h-4 w-4" />,
  },
  {
    id: 'ad_copy_creation',
    title: 'Werbetexte erstellen',
    description: 'Generiere überzeugende Werbetexte für verschiedene Kanäle und Zielgruppen.',
    icon: <MegaphoneIcon className="h-4 w-4" />,
  },
  {
    id: 'campaign_analysis',
    title: 'Kampagnen-Analyse',
    description: 'Analysiere Performance-Metriken und erhalte Optimierungsvorschläge.',
    icon: <ChartBarIcon className="h-4 w-4" />,
  },
]

export type MarketingQuickActionsWidgetProps = {
  onSelectAction?: (id: string) => void
}

export const MarketingQuickActionsWidget: FC<MarketingQuickActionsWidgetProps> = ({
  onSelectAction,
}) => {
  return (
    <QuickActionsWidget
      title="Marketing-Schnellaktionen"
      subtitle="Plane Kampagnen und Inhalte schneller mit vordefinierten Workflows."
      source="marketing"
      columns={1}
      actions={MARKETING_QUICK_ACTIONS}
      onSelectAction={onSelectAction}
    />
  )
}
