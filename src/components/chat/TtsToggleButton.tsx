'use client'

import clsx from 'clsx'
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'

type TtsToggleButtonProps = {
  active: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}

export function TtsToggleButton({ active, disabled, onClick, className }: TtsToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[var(--ak-color-text-secondary)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 disabled:opacity-50 disabled:hover:bg-transparent',
        active && 'text-[var(--ak-color-accent)]',
        className
      )}
      aria-label={active ? 'Vorlesen stoppen' : 'Vorlesen'}
    >
      {active ? (
        <SpeakerXMarkIcon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}
