import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  TagIcon,
  Cog6ToothIcon,
  LinkIcon,
  CheckCircleIcon,
  CalendarIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { ActionCategory, ActionTemplate, ActionCategoryId, ActionTemplateId } from './types';

export const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'communication',
    label: 'Kommunikation',
  },
  {
    id: 'marketing',
    label: 'Marketing',
  },
  {
    id: 'ops',
    label: 'Organisation & Aufgaben',
  },
  {
    id: 'assistants',
    label: 'Assistenten',
  },
  {
    id: 'packs',
    label: 'Packs',
  },
];

export const ACTION_TEMPLATES: ActionTemplate[] = [
  // Kommunikation
  {
    id: 'email-broadcast',
    categoryId: 'communication',
    title: 'E-Mail Broadcast',
    description: 'Sende eine E-Mail an mehrere Empfänger gleichzeitig',
    isNew: true,
  },
  {
    id: 'telegram-message',
    categoryId: 'communication',
    title: 'Telegram Nachricht',
    description: 'Sende eine Nachricht über Telegram',
  },
  {
    id: 'email-reply',
    categoryId: 'communication',
    title: 'E-Mail Antwort',
    description: 'Antworte auf eine E-Mail mit Vorlage',
  },
  // Marketing
  {
    id: 'social-media-post',
    categoryId: 'marketing',
    title: 'Social Media Post',
    description: 'Erstelle und veröffentliche einen Social Media Beitrag',
    isFavorite: true,
  },
  {
    id: 'discount-campaign',
    categoryId: 'marketing',
    title: 'Rabattaktion',
    description: 'Erstelle eine Rabattaktion für Kunden',
    isNew: true,
  },
  {
    id: 'newsletter',
    categoryId: 'marketing',
    title: 'Newsletter',
    description: 'Erstelle und versende einen Newsletter',
  },
  // Organisation & Aufgaben
  {
    id: 'todo-list',
    categoryId: 'ops',
    title: 'To-Do Liste',
    description: 'Erstelle eine To-Do Liste für Aufgaben',
  },
  {
    id: 'schedule-meeting',
    categoryId: 'ops',
    title: 'Termin planen',
    description: 'Plane einen Termin oder ein Meeting',
  },
  {
    id: 'task-assignment',
    categoryId: 'ops',
    title: 'Aufgabe zuordnen',
    description: 'Weise eine Aufgabe einem Team-Mitglied zu',
  },
];

export const CATEGORY_ICONS: Record<ActionCategoryId, typeof EnvelopeIcon> = {
  communication: EnvelopeIcon,
  marketing: MegaphoneIcon,
  setup: Cog6ToothIcon,
  ops: CheckCircleIcon,
  assistants: ChatBubbleLeftRightIcon,
  packs: FolderIcon,
};

export function getCategoryById(id: ActionCategoryId): ActionCategory | undefined {
  return ACTION_CATEGORIES.find((cat) => cat.id === id);
}

export function getTemplatesByCategory(categoryId: ActionCategoryId): ActionTemplate[] {
  return ACTION_TEMPLATES.filter((template) => template.categoryId === categoryId);
}

export function getTemplateById(id: ActionTemplateId): ActionTemplate | undefined {
  return ACTION_TEMPLATES.find((template) => template.id === id);
}

