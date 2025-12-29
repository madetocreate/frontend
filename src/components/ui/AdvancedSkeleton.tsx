'use client'

import { motion } from 'framer-motion'

// Base Shimmer Component
export function Shimmer({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative overflow-hidden bg-[var(--ak-color-bg-surface-muted)] rounded ${className}`} style={style}>
      <div 
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-gray-500/60 to-transparent"
        style={{
          animation: 'shimmer 2s infinite linear'
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  )
}

// Dashboard Skeleton for Stat Cards
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] p-6"
        >
          <div className="space-y-3">
            <Shimmer className="h-14 w-14 rounded-xl" />
            <Shimmer className="h-10 w-24" />
            <Shimmer className="h-4 w-32" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 pb-3 border-b border-[var(--ak-color-border-subtle)]">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="grid grid-cols-5 gap-4 py-3"
        >
          {[...Array(5)].map((_, j) => (
            <Shimmer key={j} className="h-4 w-full" />
          ))}
        </motion.div>
      ))}
    </div>
  )
}

// List Skeleton (for activity feeds, etc.)
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]"
        >
          <Shimmer className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-3 w-2/3" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Shimmer className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>
      <Shimmer className="h-32 w-full rounded-lg" />
      <div className="flex gap-2">
        <Shimmer className="h-8 w-20 rounded-lg" />
        <Shimmer className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

// Full Page Skeleton
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-8 w-64 rounded-lg" />
        <Shimmer className="h-4 w-96 rounded" />
      </div>
      
      {/* Stats */}
      <DashboardStatsSkeleton />
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

// Text Skeleton
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Shimmer 
          key={i} 
          className="h-4 rounded" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

