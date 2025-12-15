'use client'

import clsx from 'clsx'

type ShimmerSkeletonProps = {
  width?: string
  height?: string
  className?: string
  rounded?: boolean
}

export function ShimmerSkeleton({
  width = '100%',
  height = '20px',
  className,
  rounded = true,
}: ShimmerSkeletonProps) {
  return (
    <div
      className={clsx(
        'skeleton',
        rounded && 'rounded-lg',
        className
      )}
      style={{ width, height }}
    />
  )
}

