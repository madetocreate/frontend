/**
 * Apple Design System - Shared Components
 * Reusable components following Apple's design language
 */

'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

// Apple Card Component
interface AppleCardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
  gradient?: boolean
}

export function AppleCard({ 
  children, 
  className, 
  glass = true,
  hover = false,
  padding = 'md',
  onClick,
  gradient = false
}: AppleCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-250',
        glass 
          ? 'apple-glass' 
          : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50',
        gradient && 'bg-gradient-to-br from-white/80 to-white/40',
        hover && 'hover:shadow-lg hover:scale-[1.01] cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

// Apple Button Component
interface AppleButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export function AppleButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  icon,
  fullWidth = false
}: AppleButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
    secondary: 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-gray-800/80',
    tertiary: 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white hover:bg-gray-200/80 dark:hover:bg-gray-700/80',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-250',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

// Apple Section Component
interface AppleSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function AppleSection({
  title,
  subtitle,
  children,
  className,
  headerAction
}: AppleSectionProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

// Apple Badge Component
interface AppleBadgeProps {
  children: ReactNode
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

export function AppleBadge({
  children,
  variant = 'blue',
  size = 'sm',
  className
}: AppleBadgeProps) {
  const variantClasses = {
    blue: 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    orange: 'bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    red: 'bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    purple: 'bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    gray: 'bg-gray-100/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-semibold',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// Apple Input Component
interface AppleInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  type?: string
  className?: string
  icon?: ReactNode
  error?: string
}

export function AppleInput({
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  className,
  icon,
  error
}: AppleInputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            'w-full px-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl',
            'border border-gray-200/50 dark:border-gray-700/50',
            'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
            'transition-all duration-250',
            icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500/50',
            className
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

// Apple Modal Component
interface AppleModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}

export function AppleModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}: AppleModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={clsx(
          'relative w-full rounded-3xl apple-glass shadow-2xl',
          sizeClasses[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="p-6">{children}</div>
        
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50 dark:border-gray-700/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Apple Divider Component
export function AppleDivider({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'h-px bg-gradient-to-r from-transparent via-gray-200/50 to-transparent dark:via-gray-700/50',
        className
      )}
    />
  )
}

// Apple Skeleton Component
export function AppleSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-gray-200/50 dark:bg-gray-700/50',
        className
      )}
    />
  )
}
