'use client'

import React, { useEffect, useRef, ReactNode, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAklowEscape } from '@/hooks/useAklowEscape'

export type AkOverlayVariant = 'modal' | 'panel' | 'popover'

export interface AkOverlayProps {
  isOpen: boolean
  onClose: () => void
  variant?: AkOverlayVariant
  position?: 'center' | 'bottom'
  title?: string
  children: ReactNode
  className?: string
  showCloseButton?: boolean
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  maxWidth?: string
}

const VARIANT_STYLES: Record<AkOverlayVariant, {
  container: string
  content: string
  backdrop: string
}> = {
  modal: {
    container: 'items-center justify-center p-4',
    content: 'max-w-lg w-full rounded-[var(--ak-modal-radius)]', /* Größerer Radius - Apple Style */
    backdrop: 'bg-black/30', /* Subtiler - Apple Style (0.3 statt 0.4) - Standard für Overlays */
  },
  panel: {
    container: 'items-start justify-end p-0',
    content: 'h-full max-w-md w-full rounded-l-[var(--ak-radius-xl)]',
    backdrop: 'bg-black/20', /* Standard für Overlays */
  },
  popover: {
    container: 'items-center justify-center',
    content: 'max-w-sm w-full rounded-[var(--ak-radius-lg)]',
    backdrop: 'bg-transparent',
  },
}

export function AkOverlay({
  isOpen,
  onClose,
  variant = 'modal',
  position = 'center',
  title,
  children,
  className,
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  maxWidth,
}: AkOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const previousBodyOverflowRef = useRef<string>('')
  const titleId = useId()

  // Zentralisiertes ESC (vermeidet doppelte keydown Listener)
  useAklowEscape({ enabled: isOpen && closeOnEscape, onEscape: onClose })

  // Restore focus + (optional) body scroll lock für modale Varianten
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    if (variant !== 'popover') {
      previousBodyOverflowRef.current = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }

    return () => {
      if (variant !== 'popover') {
        document.body.style.overflow = previousBodyOverflowRef.current
      }
      previousFocusRef.current?.focus?.()
    }
  }, [isOpen, variant])

  // Focus trap (basic implementation)
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return

    const getFocusable = () =>
      Array.from(
        overlayRef.current!.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        if (el.hasAttribute('disabled')) return false
        if (el.getAttribute('aria-disabled') === 'true') return false
        return true
      })

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const overlay = overlayRef.current
      if (!overlay) return

      const focusableElements = getFocusable()
      if (focusableElements.length === 0) {
        e.preventDefault()
        overlay.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const active = document.activeElement as HTMLElement | null
      const activeInside = !!active && overlay.contains(active)

      // Wenn Fokus außerhalb des Overlays liegt, fokussiere das erste Element
      if (!activeInside) {
        e.preventDefault()
        firstElement.focus()
        return
      }

      if (e.shiftKey) {
        if (active === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (active === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleTab)
    const focusableElements = getFocusable()
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus()
    } else {
      overlayRef.current?.focus()
    }

    return () => window.removeEventListener('keydown', handleTab)
  }, [isOpen])

  const styles = VARIANT_STYLES[variant]

  const isBottom = position === 'bottom'
  const containerCls = isBottom 
    ? 'items-end justify-center p-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]'
    : styles.container

  const contentCls = isBottom
    ? 'w-full max-w-3xl rounded-t-[var(--ak-radius-2xl)] rounded-b-none'
    : styles.content

  const initialY = isBottom ? 100 : variant === 'panel' ? 20 : 0
  const exitY = isBottom ? 100 : variant === 'panel' ? 20 : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={clsx(
            'fixed inset-0 z-[100] flex',
            containerCls,
            className
          )}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx(
              'absolute inset-0',
              styles.backdrop
            )}
            style={{ 
              backdropFilter: `blur(var(--ak-backdrop-blur))`,
              WebkitBackdropFilter: `blur(var(--ak-backdrop-blur))`
            }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Content */}
          <motion.div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: isBottom ? 1 : 0.95, y: initialY }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isBottom ? 1 : 0.95, y: exitY }}
            transition={{
              duration: 0.25,
              ease: [0.28, 0.11, 0.32, 1], // --ak-motion-ease
            }}
            className={clsx(
              'relative z-10',
              'ak-bg-glass',
              'border border-[var(--ak-color-border-subtle)]',
              'ak-shadow-elev-3',
              contentCls,
              // maxWidth per style (Tailwind kann dynamische Klassen sonst nicht generieren)
            )}
            style={maxWidth && !isBottom ? { maxWidth } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={clsx(
                'flex items-center justify-between border-b border-[var(--ak-color-border-hairline)]',
                `px-[var(--ak-modal-padding)] py-4` /* Konsistentes Padding - Apple Style */
              )}>
                {title && (
                  <h2 id={titleId} className="text-xl font-medium text-[var(--ak-color-text-primary)]"> {/* Medium statt Semibold - Apple Style */}
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      'hover:bg-[var(--ak-color-bg-hover)]',
                      'focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/25',
                      'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]'
                    )}
                    aria-label="Schließen"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={clsx(
              'overflow-y-auto',
              `p-[var(--ak-modal-padding)]`, /* Mehr Whitespace - Apple Style */
              isBottom && 'pb-[calc(var(--ak-modal-padding)+env(safe-area-inset-bottom,0px))]'
            )}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

