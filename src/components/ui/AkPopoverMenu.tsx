'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useAklowEscape } from '@/hooks/useAklowEscape'

export interface PopoverMenuItem {
  label: string
  value?: string
  onClick?: () => void
  disabled?: boolean
}

interface AkPopoverMenuProps {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null> | React.RefObject<HTMLElement>
  items: PopoverMenuItem[]
  onClose: () => void
  onSelect?: (item: PopoverMenuItem) => void
  className?: string
}

export function AkPopoverMenu({
  open,
  anchorRef,
  items,
  onClose,
  onSelect,
  className,
}: AkPopoverMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const calculatePosition = useCallback(() => {
    if (!anchorRef.current || !menuRef.current) return

    const anchorRect = anchorRef.current.getBoundingClientRect()
    const menuRect = menuRef.current.getBoundingClientRect()
    const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ak-popover-gap') || '8px')

    let left = anchorRect.right + gap
    let top = anchorRect.bottom + gap

    // Collision: Rechts kein Platz -> öffne links
    if (left + menuRect.width > window.innerWidth) {
      left = anchorRect.left - menuRect.width - gap
    }

    // Collision: Unten kein Platz -> öffne nach oben
    if (top + menuRect.height > window.innerHeight) {
      top = anchorRect.top - menuRect.height - gap
    }

    // Sicherstellen, dass Menü nicht außerhalb des Viewports ist
    left = Math.max(gap, Math.min(left, window.innerWidth - menuRect.width - gap))
    top = Math.max(gap, Math.min(top, window.innerHeight - menuRect.height - gap))

    setPosition({ top, left })
  }, [anchorRef])

  useEffect(() => {
    if (open) {
      // Position berechnen nach dem ersten Render
      requestAnimationFrame(() => {
        calculatePosition()
      })
    }
  }, [open, calculatePosition])

  // ESC: zentralisiert
  useAklowEscape({ enabled: open, onEscape: onClose })

  // Fokus-Management: beim Öffnen erstes enabled Item fokussieren, beim Schließen Fokus zum Anchor zurück
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition, true)

    const raf = requestAnimationFrame(() => {
      const firstEnabledIndex = items.findIndex((i) => !i.disabled)
      if (firstEnabledIndex >= 0) {
        itemRefs.current[firstEnabledIndex]?.focus()
      } else {
        menuRef.current?.focus()
      }
    })

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition, true)
      cancelAnimationFrame(raf)
      // Restore focus
      anchorRef.current?.focus?.()
    }
  }, [open, onClose, anchorRef, calculatePosition, items])

  if (!open) return null

  const handleItemClick = (item: PopoverMenuItem) => {
    if (item.disabled) return
    item.onClick?.()
    onSelect?.(item)
    onClose()
  }

  const focusByDelta = (delta: number) => {
    const enabledIndexes = items
      .map((it, idx) => ({ it, idx }))
      .filter(({ it }) => !it.disabled)
      .map(({ idx }) => idx)
    if (enabledIndexes.length === 0) return

    const active = document.activeElement as HTMLElement | null
    const currentIndex = enabledIndexes.findIndex((idx) => itemRefs.current[idx] === active)
    const nextPos =
      currentIndex === -1
        ? 0
        : (currentIndex + delta + enabledIndexes.length) % enabledIndexes.length
    const nextIndex = enabledIndexes[nextPos]
    itemRefs.current[nextIndex]?.focus()
  }

  const focusFirst = () => {
    const idx = items.findIndex((i) => !i.disabled)
    if (idx >= 0) itemRefs.current[idx]?.focus()
  }

  const focusLast = () => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i]?.disabled) {
        itemRefs.current[i]?.focus()
        break
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusByDelta(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusByDelta(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusFirst()
    } else if (e.key === 'End') {
      e.preventDefault()
      focusLast()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const active = document.activeElement as HTMLElement | null
      const idx = itemRefs.current.findIndex((el) => el === active)
      const item = idx >= 0 ? items[idx] : undefined
      if (item && !item.disabled) {
        handleItemClick(item)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const menuContent = (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={clsx(
        'fixed z-[200] ak-glass-popover',
        'p-1 animate-in fade-in zoom-in-95 duration-100',
        !position && 'invisible',
        className
      )}
      style={{
        top: position ? `${position.top}px` : '0px',
        left: position ? `${position.left}px` : '0px',
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          type="button"
          role="menuitem"
          aria-disabled={item.disabled ? 'true' : undefined}
          tabIndex={-1}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={clsx(
            'flex w-full items-center px-3 py-2 text-xs rounded',
            'text-[var(--ak-color-text-primary)]',
            'hover:bg-[var(--ak-color-bg-hover)]',
            'transition-colors',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )

  return createPortal(menuContent, document.body)
}

