'use client'

import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'

type ComposerMenuItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}

import type { ComposerMode } from '@/types/chat'

type ComposerMenuProps = {
  onClose: () => void
  mode: ComposerMode
  onChangeMode: (mode: ComposerMode) => void
}

const MENU_ITEMS: ComposerMenuItem[] = [
  {
    id: 'file',
    label: 'Datei oder Foto',
    icon: PhotoIcon,
    onClick: () => {
      // File upload logic
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*,application/pdf,.doc,.docx'
      input.multiple = true
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files
        if (files) {
          console.log('Files selected:', files)
          // Handle file upload
        }
      }
      input.click()
    },
  },
  {
    id: 'search',
    label: 'Internet-Suche',
    icon: MagnifyingGlassIcon,
    onClick: () => {
      // Will be handled by onChangeMode
    },
  },
  {
    id: 'create-image',
    label: 'Bild erstellen',
    icon: SparklesIcon,
    onClick: () => {
      console.log('Create image')
      // Handle image creation
    },
  },
  {
    id: 'learning-mode',
    label: 'Lernmodus',
    icon: AcademicCapIcon,
    onClick: () => {
      // Will be handled by onChangeMode
    },
  },
]

export function ComposerMenu({ onClose, mode, onChangeMode }: ComposerMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Add click outside listener
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full right-0 mb-2 z-50 min-w-[200px] rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/95 backdrop-blur-xl ak-shadow-strong overflow-hidden"
    >
      {MENU_ITEMS.map((item, index) => {
        const Icon = item.icon
        const showDivider = index < 2 // Show divider after first 2 items

        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => {
                // Map menu item IDs to modes
                if (item.id === 'search') {
                  onChangeMode('research')
                } else if (item.id === 'learning-mode') {
                  onChangeMode('learning')
                } else if (item.id === 'create-image') {
                  onChangeMode('magic')
                } else {
                  item.onClick()
                }
                onClose()
              }}
              className={clsx(
                'flex w-full items-center gap-3 px-4 py-3 text-left',
                'transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                'hover:bg-[var(--ak-color-bg-surface-muted)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25'
              )}
            >
              <Icon className="h-5 w-5 text-[var(--ak-color-text-primary)]" />
              <span className="ak-body text-sm text-[var(--ak-color-text-primary)]">
                {item.label}
              </span>
            </button>
            {showDivider && (
              <div className="h-px bg-[var(--ak-color-border-subtle)]" />
            )}
          </div>
        )
      })}
    </div>
  )
}

