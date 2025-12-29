'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook to scroll to top when a card/pane/drawer opens or content key changes.
 * 
 * Ensures headers are always visible when opening detail views by resetting
 * scroll position to top. Headers should be sticky within the scroll container
 * to remain visible automatically.
 * 
 * @param isOpen - Whether the pane/drawer is open
 * @param contentKey - Unique key that changes when content changes (e.g., item.id)
 * @param scrollRef - Ref to the scrollable container (required)
 * @param headerRef - Optional ref to the header element (currently unused, reserved for future use)
 * @param topOffset - Optional top offset in pixels (currently unused, reserved for future use)
 */
export function useScrollToTopOnOpen({
  isOpen,
  contentKey,
  scrollRef,
  headerRef,
  topOffset = 0,
}: {
  isOpen: boolean
  contentKey?: string | number | null
  scrollRef: React.RefObject<HTMLElement>
  headerRef?: React.RefObject<HTMLElement>
  topOffset?: number
}) {
  const prevContentKeyRef = useRef<string | number | null>(null)
  const prevIsOpenRef = useRef<boolean>(false)

  useEffect(() => {
    // Only reset scroll when:
    // 1. Opening (transition from closed to open)
    // 2. Content key changes while open
    const isOpening = !prevIsOpenRef.current && isOpen
    const contentChanged = isOpen && prevContentKeyRef.current !== contentKey && contentKey != null

    if ((isOpening || contentChanged) && scrollRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          // Reset scroll position to top
          // No scrollIntoView needed - header is sticky and will be visible automatically
          scrollRef.current.scrollTop = 0
        }
      })
    }

    // Update refs
    prevIsOpenRef.current = isOpen
    prevContentKeyRef.current = contentKey ?? null
  }, [isOpen, contentKey, scrollRef, headerRef])
}

