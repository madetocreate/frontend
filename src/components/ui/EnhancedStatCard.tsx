'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { AnimatedNumber, Sparkline } from './AnimatedNumber'

interface EnhancedStatCardProps {
  icon: ReactNode
  value: number | string
  label: string
  trend?: {
    value: string
    direction: 'up' | 'down' | 'stable'
  }
  badge?: {
    text: string
    tone: 'success' | 'warning' | 'info' | 'neutral'
  }
  sparklineData?: number[]
  gradient?: {
    from: string
    to: string
  }
  loading?: boolean
}

export function EnhancedStatCard({
  icon,
  value,
  label,
  trend,
  badge,
  sparklineData,
  gradient = { from: 'blue', to: 'purple' },
  loading = false
}: EnhancedStatCardProps) {
  const fromClass = {
    blue: 'from-blue-500',
    purple: 'from-purple-500',
    green: 'from-green-500',
    orange: 'from-orange-500',
    pink: 'from-pink-500',
    indigo: 'from-indigo-500',
    emerald: 'from-emerald-500',
    amber: 'from-amber-500',
    fuchsia: 'from-fuchsia-500'
  }[gradient.from] || 'from-blue-500';

  const toClass = {
    blue: 'to-blue-600',
    purple: 'to-purple-600',
    green: 'to-green-600',
    orange: 'to-orange-600',
    pink: 'to-pink-600',
    indigo: 'to-indigo-600',
    emerald: 'to-emerald-600',
    amber: 'to-amber-600',
    fuchsia: 'to-fuchsia-600'
  }[gradient.to] || 'to-purple-600';

  const toneClasses = {
    success: 'text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)]',
    warning: 'text-[var(--ak-semantic-warning)] bg-[var(--ak-semantic-warning-soft)]',
    info: 'text-[var(--ak-semantic-info)] bg-[var(--ak-semantic-info-soft)]',
    neutral: 'text-[var(--ak-color-text-secondary)] bg-[var(--ak-color-bg-surface-muted)]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative"
    >
      {/* Animated Glow Background */}
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
        fromClass,
        toClass
      )} />
      
      {/* Glass Card */}
      <div className="relative bg-[var(--ak-color-bg-surface)]/80 backdrop-blur-xl rounded-2xl border border-[var(--ak-color-border-subtle)]/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          {/* Icon with 3D Effect */}
          <div className="relative">
            <div className={clsx("absolute inset-0 bg-gradient-to-br rounded-2xl blur-md opacity-50", fromClass, toClass)} />
            <div className={clsx("relative h-14 w-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-3 transition-transform duration-300", fromClass, toClass)}>
              <div className="text-[var(--ak-color-text-inverted)]">
                {icon}
              </div>
            </div>
          </div>
          
          {/* Badge */}
          {badge && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${toneClasses[badge.tone]}`}>
              {badge.text}
            </span>
          )}
        </div>
        
        {/* Value with Animation */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-10 w-24 bg-[var(--ak-color-bg-surface-muted)] rounded animate-pulse" />
            ) : typeof value === 'number' ? (
              <AnimatedNumber 
                value={value} 
                className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              />
            ) : (
              <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {value}
              </span>
            )}
            
            {trend && (
              <span className={`text-xs font-semibold ${
                trend.direction === 'up' ? 'text-[var(--ak-semantic-success)]' : 
                trend.direction === 'down' ? 'text-[var(--ak-semantic-danger)]' : 
                'text-[var(--ak-color-text-secondary)]'
              }`}>
                {trend.direction === 'up' && '↗'}
                {trend.direction === 'down' && '↘'}
                {trend.direction === 'stable' && '→'}
                {trend.value}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--ak-color-text-secondary)] font-medium">
            {label}
          </p>
        </div>
        
        {/* Mini Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-12 -mx-2">
            <Sparkline 
              data={sparklineData} 
              color={`var(--ak-color-${gradient.from})`}
              height={48}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

