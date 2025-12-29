'use client'

import type { FC } from 'react'
import {
  ChatBubbleLeftRightIcon,
  InboxIcon,
  DocumentTextIcon,
  PhoneIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { QuickActionsWidget, type QuickActionDefinition } from '@/components/QuickActionsWidget'

const CHAT_QUICK_ACTIONS: QuickActionDefinition[] = [
  {
    id: 'inbox_summary',
    title: 'Posteingang zusammenfassen',
    description: 'Erhalte eine Übersicht über E-Mails, Nachrichten und Bewertungen.',
    icon: <InboxIcon className="h-4 w-4" />,
  },
  {
    id: 'reply_suggestion',
    title: 'Antwort auf Kundenfrage',
    description: 'Lass dir eine Antwort auf eine E-Mail oder Nachricht vorschlagen.',
    icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />,
  },
  {
    id: 'deep_research',
    title: 'Deep-Research-Frage stellen',
    description: 'Starte eine tiefe Recherche zu einer komplexen Frage oder einem Thema.',
    icon: <SparklesIcon className="h-4 w-4" />,
  },
  {
    id: 'document_analysis',
    title: 'Dokument analysieren',
    description: 'Lass dir lange Dokumente, PDFs oder Notizen kurz und verständlich zusammenfassen.',
    icon: <DocumentTextIcon className="h-4 w-4" />,
  },
  {
    id: 'call_summary',
    title: 'Gespräch oder Call zusammenfassen',
    description: 'Fasse Telefonate oder Meetings aus deinen Notizen oder Transkripten zusammen.',
    icon: <PhoneIcon className="h-4 w-4" />,
  },
  {
    id: 'crm_preparation',
    title: 'CRM-Eintrag vorbereiten',
    description: 'Strukturiere Informationen aus Chats oder E-Mails zu einem sauberen CRM-Eintrag.',
    icon: <UserCircleIcon className="h-4 w-4" />,
  },
  {
    id: 'task_extraction',
    title: 'To-dos aus Text extrahieren',
    description: 'Erkenne Aufgaben, Deadlines und Verantwortliche aus langen Texten oder Threads.',
    icon: <ClipboardDocumentCheckIcon className="h-4 w-4" />,
  },
  {
    id: 'automation_suggestion',
    title: 'Automatisierung vorschlagen',
    description: 'Lass dir passende Automatisierungen für wiederkehrende Aufgaben vorschlagen.',
    icon: <Cog6ToothIcon className="h-4 w-4" />,
  },
]

export type ChatQuickActionsWidgetProps = {
  onSelectAction?: (id: string) => void
}

export const ChatQuickActionsWidget: FC<ChatQuickActionsWidgetProps> = ({
  onSelectAction,
}) => {
  return (
    <QuickActionsWidget
      title="Schnellaktionen"
      subtitle="Starte typische Aufgaben direkt aus dem Chat."
      source="chat"
      actions={CHAT_QUICK_ACTIONS}
      onSelectAction={onSelectAction}
    />
  )
}
