/**
 * Icon-Map für Action Registry
 * Mappt Icon-Strings (aus ActionDefinition.icon) zu tatsächlichen Icon-Komponenten
 */

import {
  SparklesIcon,
  ArrowPathIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  BellIcon,
  DocumentIcon,
  DocumentTextIcon,
  TagIcon,
  BookmarkIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType } from 'react'

export type IconName = 
  | 'SparklesIcon'
  | 'ArrowPathIcon'
  | 'ListBulletIcon'
  | 'QuestionMarkCircleIcon'
  | 'UserGroupIcon'
  | 'BellIcon'
  | 'DocumentIcon'
  | 'DocumentTextIcon'
  | 'TagIcon'
  | 'BookmarkIcon'
  | 'ArrowRightIcon'
  | 'ChatBubbleLeftRightIcon'
  | 'ExclamationTriangleIcon'
  | 'GlobeAltIcon'
  | 'PaperAirplaneIcon'
  | 'PencilIcon'

export const ACTION_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  SparklesIcon,
  ArrowPathIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  BellIcon,
  DocumentIcon,
  DocumentTextIcon,
  TagIcon,
  BookmarkIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  PencilIcon,
}

/**
 * Holt das Icon für eine Action
 * @param iconName Icon-Name aus ActionDefinition.icon
 * @returns Icon-Komponente oder Default-Icon (SparklesIcon)
 */
export function getActionIcon(iconName?: string): ComponentType<{ className?: string }> {
  if (!iconName) {
    return SparklesIcon // Default
  }
  
  const Icon = ACTION_ICON_MAP[iconName]
  if (!Icon) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[getActionIcon] Unbekanntes Icon: "${iconName}". Verwende Default.`)
    }
    return SparklesIcon // Fallback
  }
  
  return Icon
}

