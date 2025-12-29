'use client'

import React from 'react'
import clsx from 'clsx'
import { 
  ClipboardDocumentIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  SparklesIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline'
import { AkTooltip } from '@/components/ui/AkTooltip'
import { AkIconButton } from '@/components/ui/AkIconButton'

export type ChatActionType = 
  | 'copy'
  | 'edit'
  | 'retry'
  | 'regenerate'
  | 'thumbs_up'
  | 'thumbs_down'
  | 'fast_actions'
  | 'share'
  | 'more'
  | 'branch'
  | 'read'
  | 'save'
  | 'export'

export interface ChatAction {
  type: ChatActionType
  onClick: () => void
  label: string
  active?: boolean
  disabled?: boolean
}

export interface ChatActionBarProps {
  actions: ChatAction[]
  alignment?: 'left' | 'right'
  className?: string
}

const ACTION_ICONS: Record<ChatActionType, React.ComponentType<{ className?: string }>> = {
  copy: ClipboardDocumentIcon,
  edit: PencilSquareIcon,
  retry: ArrowPathIcon,
  regenerate: ArrowPathIcon,
  thumbs_up: HandThumbUpIcon,
  thumbs_down: HandThumbDownIcon,
  fast_actions: SparklesIcon,
  share: ShareIcon,
  more: EllipsisHorizontalIcon,
  branch: ArrowPathIcon,
  read: SpeakerWaveIcon,
  save: ClipboardDocumentIcon,
  export: ArrowDownTrayIcon,
}

const ACTION_STYLES: Record<ChatActionType, {
  base: string
  active: string
  hover: string
}> = {
  copy: {
    base: 'ak-text-muted hover:ak-text-primary',
    active: '',
    hover: 'hover:ak-surface-2',
  },
  edit: {
    base: 'ak-text-primary',
    active: '',
    hover: 'hover:bg-[var(--ak-color-bg-hover)]',
  },
  retry: {
    base: 'ak-text-primary',
    active: '',
    hover: 'hover:bg-[var(--ak-color-bg-hover)]',
  },
  regenerate: {
    base: 'ak-text-primary',
    active: '',
    hover: 'hover:bg-[var(--ak-color-bg-hover)]',
  },
  thumbs_up: {
    base: 'ak-text-muted',
    active: 'text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)]',
    hover: 'hover:text-[var(--ak-semantic-success)] hover:bg-[var(--ak-semantic-success-soft)]',
  },
  thumbs_down: {
    base: 'ak-text-muted',
    active: 'text-[var(--ak-semantic-danger)] bg-[var(--ak-semantic-danger-soft)]',
    hover: 'hover:text-[var(--ak-semantic-danger)] hover:bg-[var(--ak-semantic-danger-soft)]',
  },
  fast_actions: {
    base: '',
    active: '',
    hover: '',
  },
  share: {
    base: 'ak-text-muted',
    active: '',
    hover: 'hover:text-[var(--ak-accent-documents)] hover:bg-[var(--ak-accent-documents-soft)]',
  },
  more: {
    base: 'ak-text-muted',
    active: '',
    hover: 'hover:ak-surface-2',
  },
  branch: {
    base: 'ak-text-primary',
    active: '',
    hover: 'hover:bg-[var(--ak-color-bg-hover)]',
  },
  read: {
    base: 'ak-text-primary',
    active: 'bg-[var(--ak-color-bg-hover)]',
    hover: 'hover:bg-[var(--ak-color-bg-hover)]',
  },
  save: {
    base: 'ak-text-primary',
    active: 'text-[var(--ak-semantic-success)]',
    hover: 'hover:bg-[var(--ak-color-bg-hover)]',
  },
  export: {
    base: 'ak-text-muted',
    active: '',
    hover: 'hover:text-[var(--ak-accent-inbox)] hover:bg-[var(--ak-accent-inbox-soft)]',
  },
}

/**
 * ChatActionBar: Konsistente Action Buttons für Chat Messages
 * 
 * Nutzt AkTooltip für einheitliche Tooltips
 * Unterstützt User (right) und Assistant (left) alignment
 */
export function ChatActionBar({
  actions,
  alignment = 'left',
  className,
}: ChatActionBarProps) {
  if (actions.length === 0) return null

  return (
    <div className={clsx(
      'flex items-center gap-0',
      alignment === 'right' && 'justify-end',
      className
    )}>
      {actions.map((action) => {
        const Icon = ACTION_ICONS[action.type]
        const styles = ACTION_STYLES[action.type]
        const isActive = action.active

        if (action.type === 'fast_actions') {
          return (
            <AkTooltip key={action.type} content={action.label} placement={alignment === 'right' ? 'left' : 'right'}>
              <div>
                <AkIconButton
                  aria-label={action.label}
                  variant="glass"
                  selected={isActive}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <Icon className="h-4 w-4" />
                </AkIconButton>
              </div>
            </AkTooltip>
          )
        }

        return (
          <AkTooltip key={action.type} content={action.label} placement={alignment === 'right' ? 'left' : 'right'}>
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={clsx(
                'p-1.5 transition-all duration-150 rounded-lg hover:scale-110 active:scale-95',
                styles.base,
                isActive && styles.active,
                !isActive && styles.hover,
                action.disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={action.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          </AkTooltip>
        )
      })}
    </div>
  )
}

