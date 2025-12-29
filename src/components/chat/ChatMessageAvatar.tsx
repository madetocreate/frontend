'use client'

import clsx from 'clsx'

type ChatMessageAvatarProps = {
  role: 'user' | 'assistant'
  size?: 'sm' | 'md'
  className?: string
}

export function ChatMessageAvatar({ role, size = 'md', className }: ChatMessageAvatarProps) {
  const label = role === 'assistant' ? 'AK' : 'DU'
  const aria = role === 'assistant' ? 'Assistant' : 'Du'
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-8 w-8 text-xs'

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] shadow-sm',
        sizeClass,
        className
      )}
      aria-label={aria}
    >
      <span className="font-semibold" aria-hidden="true">
        {label}
      </span>
    </div>
  )
}
