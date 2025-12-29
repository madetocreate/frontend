'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import clsx from 'clsx'

/**
 * SCROLL SHADOWS
 * 
 * Premium utility that adds soft gradient masks at top/bottom 
 * when content is scrollable.
 */
export function ScrollShadows({ 
  children, 
  className,
  orientation = 'vertical'
}: { 
  children: ReactNode; 
  className?: string;
  orientation?: 'vertical' | 'horizontal'
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)
  const [showBottom, setShowBottom] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return

    if (orientation === 'vertical') {
      const { scrollTop, scrollHeight, clientHeight } = el
      setShowTop(scrollTop > 0)
      setShowBottom(Math.ceil(scrollTop + clientHeight) < scrollHeight)
    } else {
      // Horizontal scrolling not currently used, but kept for future use
      // const { scrollLeft, scrollWidth, clientWidth } = el
      // setShowLeft(scrollLeft > 0)
      // setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkScroll()
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, orientation])

  return (
    <div className={clsx("relative flex-1 min-h-0", className)}>
      {/* Top Shadow */}
      <div 
        className={clsx(
          "absolute top-0 left-0 right-0 h-4 z-10 pointer-events-none transition-opacity duration-300",
          "bg-gradient-to-b from-[var(--ak-color-bg-surface)] to-transparent",
          showTop ? "opacity-100" : "opacity-0"
        )} 
      />
      
      {/* Bottom Shadow */}
      <div 
        className={clsx(
          "absolute bottom-0 left-0 right-0 h-4 z-10 pointer-events-none transition-opacity duration-300",
          "bg-gradient-to-t from-[var(--ak-color-bg-surface)] to-transparent",
          showBottom ? "opacity-100" : "opacity-0"
        )} 
      />

      <div 
        ref={scrollRef} 
        className={clsx(
          "h-full w-full overflow-auto ak-scrollbar",
          // Remove default padding if you want shadows to sit flush
        )}
      >
        {children}
      </div>
    </div>
  )
}

