'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { AkButton } from './AkButton'

export interface AkDisclosureProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  variant?: 'button' | 'link'
  className?: string
  contentClassName?: string
}

export function AkDisclosure({
  title,
  children,
  defaultOpen = false,
  variant = 'link',
  className,
  contentClassName,
}: AkDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState<string>(defaultOpen ? 'none' : '0px')

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        const height = contentRef.current.scrollHeight
        setMaxHeight(`${height}px`)
        // After transition, set to 'none' for dynamic content
        setTimeout(() => {
          if (isOpen) {
            setMaxHeight('none')
          }
        }, 220)
      } else {
        const height = contentRef.current.scrollHeight
        setMaxHeight(`${height}px`)
        // Force reflow
        requestAnimationFrame(() => {
          setMaxHeight('0px')
        })
      }
    }
  }, [isOpen])

  const toggle = () => setIsOpen(!isOpen)

  const trigger = variant === 'button' ? (
    <AkButton
      variant="ghost"
      size="sm"
      onClick={toggle}
      rightIcon={
        <ChevronDownIcon
          className={clsx(
            'h-4 w-4 transition-transform duration-[var(--ak-motion-base)]',
            isOpen && 'rotate-180'
          )}
        />
      }
    >
      {title}
    </AkButton>
  ) : (
    <button
      type="button"
      onClick={toggle}
      className={clsx(
        'flex items-center gap-1 text-xs font-medium text-[var(--ak-color-text-secondary)]',
        'hover:text-[var(--ak-color-text-primary)] transition-colors duration-[var(--ak-motion-fast)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent-soft)] rounded'
      )}
    >
      <span>{title}</span>
      <ChevronDownIcon
        className={clsx(
          'h-3.5 w-3.5 transition-transform duration-[var(--ak-motion-base)]',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )

  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-2">
        {trigger}
      </div>
      <div
        ref={contentRef}
        className={clsx(
          'overflow-hidden transition-all duration-[var(--ak-motion-base)] ease-[var(--ak-motion-ease)]',
          contentClassName
        )}
        style={{ maxHeight }}
      >
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  )
}

