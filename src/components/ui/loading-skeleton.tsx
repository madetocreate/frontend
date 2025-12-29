import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function FeatureLoadingSkeleton({ count = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-6 rounded-xl bg-[var(--ak-color-bg-surface-muted)] animate-pulse"
          style={{
            animationDelay: `${i * 150}ms`
          }}
        >
          {/* Left side */}
          <div className="space-y-3 flex-1">
            {/* Icon placeholder */}
            <div className="w-10 h-10 bg-[var(--ak-color-bg-surface)] rounded-lg" />
            
            {/* Title */}
            <div className="h-4 bg-[var(--ak-color-bg-surface)] rounded w-1/3" />
            
            {/* Description */}
            <div className="h-3 bg-[var(--ak-color-bg-surface)] rounded w-2/3" />
            
            {/* Badges */}
            <div className="flex gap-2 mt-2">
              <div className="h-6 w-20 bg-[var(--ak-color-bg-surface)] rounded-full" />
              <div className="h-6 w-16 bg-[var(--ak-color-bg-surface)] rounded-full" />
            </div>
          </div>
          
          {/* Right side - Toggle */}
          <div className="w-11 h-6 bg-[var(--ak-color-bg-surface)] rounded-full ml-6" />
        </div>
      ))}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--ak-color-bg-surface-muted)]", className)}
      {...props}
    />
  )
}

