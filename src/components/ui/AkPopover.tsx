'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useAklowEscape } from '@/hooks/useAklowEscape'

interface AkPopoverProps {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
  side?: 'top' | 'bottom'
  offset?: number
}

export function AkPopover({
  open,
  anchorRef,
  onClose,
  children,
  className,
  align = 'right',
  side = 'bottom',
  offset = 8,
}: AkPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const calculatePosition = useCallback(() => {
    if (!anchorRef.current || !popoverRef.current) return

    const anchorRect = anchorRef.current.getBoundingClientRect()
    const popoverRect = popoverRef.current.getBoundingClientRect()
    
    let top = 0
    let left = 0

    // Side placement
    if (side === 'bottom') {
      top = anchorRect.bottom + offset
    } else {
      top = anchorRect.top - popoverRect.height - offset
    }

    // Alignment
    if (align === 'right') {
      left = anchorRect.right - popoverRect.width
    } else if (align === 'left') {
      left = anchorRect.left
    } else {
      left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2
    }

    // Collision Detection
    // Right boundary
    if (left + popoverRect.width > window.innerWidth - 16) {
      left = window.innerWidth - popoverRect.width - 16
    }
    // Left boundary
    if (left < 16) {
      left = 16
    }
    // Bottom boundary
    if (top + popoverRect.height > window.innerHeight - 16) {
      top = anchorRect.top - popoverRect.height - offset
    }
    // Top boundary
    if (top < 16) {
      top = anchorRect.bottom + offset
    }

    setPosition({ top, left })
  }, [anchorRef, align, side, offset])

  useEffect(() => {
    if (open) {
      // Small delay to ensure children are rendered for measurement
      const timer = setTimeout(() => {
        calculatePosition()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, calculatePosition, children])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition, true)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition, true)
      // Restore focus
      anchorRef.current?.focus?.()
    }
  }, [open, onClose, anchorRef, calculatePosition])

  // ESC: zentralisiert
  useAklowEscape({ enabled: open, onEscape: onClose })

  if (!open) return null

  const content = (
    <div
      ref={popoverRef}
      className={clsx(
        'fixed z-[250] ak-glass-popover overflow-hidden',
        'animate-in fade-in zoom-in-95 duration-150',
        !position && 'invisible',
        className
      )}
      style={{
        top: position ? `${position.top}px` : '0px',
        left: position ? `${position.left}px` : '0px',
      }}
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
}

