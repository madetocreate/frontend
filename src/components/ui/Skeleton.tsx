'use client'

import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = 'text', 
  width, 
  height,
  lines = 1 
}: SkeletonProps) {
  // Use standardized shimmer animation
  const baseClasses = "animate-shimmer bg-[var(--ak-color-bg-surface-muted)]"
  
  const variantClasses = {
    text: 'h-4 rounded-full',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-[var(--ak-radius-lg)]',
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  if (lines > 1) {
    return (
      <div className={clsx("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={clsx(baseClasses, variantClasses[variant])}
            style={{ 
              ...style, 
              width: i === lines - 1 ? '60%' : width || '100%' 
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div 
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

export function SkeletonMessage({ align = 'left' }: { align?: 'left' | 'right' }) {
  return (
    <div className={clsx(
      "flex gap-3 animate-pulse",
      align === 'right' ? 'flex-row-reverse' : 'flex-row'
    )}>
      <div className="flex flex-col gap-2 flex-1" style={{ maxWidth: align === 'right' ? '60%' : '80%' }}>
        <Skeleton variant="rounded" height={16} width="90%" />
        <Skeleton variant="rounded" height={16} width="75%" />
        <Skeleton variant="rounded" height={16} width="40%" />
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="p-[var(--ak-card-padding)] bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] rounded-[var(--ak-card-radius)] shadow-sm animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
    </div>
  )
}

export function SkeletonRow({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-[var(--ak-row-padding-y)] px-[var(--ak-row-padding-x)]">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="text" width="70%" height={14} />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

