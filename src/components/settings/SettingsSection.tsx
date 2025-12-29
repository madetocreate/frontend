'use client'

import { ReactNode } from 'react'
import { ChevronRightIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

type SettingsMode = 'simple' | 'expert'

interface SettingsSectionProps {
  title: string
  description?: string
  mode: SettingsMode
  children: ReactNode
  expertOnly?: boolean
  className?: string
}

export function SettingsSection({
  title,
  description,
  mode,
  children,
  expertOnly = false,
  className,
}: SettingsSectionProps) {
  if (expertOnly && mode === 'simple') {
    return null
  }

  return (
    <div className={clsx('mb-8', className)}>
      <div className="mb-3 px-1">
        <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-1 uppercase tracking-wider text-xs opacity-70">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      <div className="ak-surface-1 rounded-[var(--ak-radius-lg)] border ak-border-default ak-elev-1 overflow-hidden relative">
        {/* We handle dividers manually in Rows for that inset look */}
        {children}
      </div>
    </div>
  )
}

interface SettingsRowProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  expertOnly?: boolean
  mode: SettingsMode
  isLast?: boolean // To hide divider
  iconColor?: string // CSS variable or utility class for icon background (e.g. 'bg-[var(--ak-color-accent)]')
}

export function SettingsRow({
  title,
  subtitle,
  leading,
  trailing,
  onClick,
  expertOnly = false,
  mode,
  isLast = false,
  iconColor = 'bg-[var(--ak-color-accent)]', // Default accent color (use CSS vars, not Tailwind)
}: SettingsRowProps) {
  if (expertOnly && mode === 'simple') {
    return null
  }

  const isInteractive = Boolean(onClick)
  const content = (
    <div
      className={clsx(
        'flex items-center justify-between px-4 py-3 min-h-[56px] relative',
        isInteractive &&
          'cursor-pointer hover:bg-[var(--ak-color-bg-hover)] active:bg-[var(--ak-color-bg-selected)] transition-colors'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {leading && (
          <div
            className={clsx(
              'w-7 h-7 rounded-[var(--ak-radius-md)] flex items-center justify-center flex-shrink-0 shadow-sm',
              iconColor
            )}
          >
            {/* Clone element to force smaller size if needed, though usually className on icon is enough */}
            <div className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{leading}</div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium text-[var(--ak-color-text-primary)] leading-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-[13px] text-[var(--ak-color-text-secondary)] mt-0.5 leading-tight">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {trailing && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {trailing}
          {isInteractive && (
            <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] opacity-50" />
          )}
        </div>
      )}

      {/* Inset Divider (Apple style) */}
      {!isLast && (
        <div className="absolute bottom-0 right-0 h-[1px] bg-[var(--ak-color-border-subtle)] left-[56px] opacity-60" />
      )}
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return <div>{content}</div>
}

interface SettingsToggleProps extends Omit<SettingsRowProps, 'trailing' | 'onClick'> {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function SettingsToggle({
  checked,
  onChange,
  disabled = false,
  ...props
}: SettingsToggleProps) {
  return (
    <SettingsRow
      {...props}
      trailing={
        <label
          className={`relative inline-flex items-center ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 bg-[var(--ak-color-bg-surface-muted)] peer-focus:outline-none rounded-full peer 
            peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-surface-1)]
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-surface-1)] after:border-[var(--ak-color-border-subtle)] 
            after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm
            peer-checked:bg-[var(--ak-color-accent)] transition-colors duration-200 ease-in-out`}
          ></div>
          {disabled && (
            <LockClosedIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] ml-2" />
          )}
        </label>
      }
    />
  )
}

interface SettingsSelectProps extends Omit<SettingsRowProps, 'trailing' | 'onClick'> {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function SettingsSelect({
  value,
  options,
  onChange,
  ...props
}: SettingsSelectProps) {
  return (
    <SettingsRow
      {...props}
      trailing={
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-none text-[15px] text-[var(--ak-color-text-secondary)] font-normal focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-6 text-right dir-rtl"
            style={{ direction: 'rtl' }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] opacity-50 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      }
    />
  )
}

interface SettingsSegmentedControlProps
  extends Omit<SettingsRowProps, 'trailing' | 'onClick' | 'subtitle'> {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function SettingsSegmentedControl({
  value,
  options,
  onChange,
  title, // Title is shown above or suppressed if obvious
  leading,
  ...props
}: SettingsSegmentedControlProps) {
  // If title/leading provided, render as row with control at bottom or right
  // For standard settings, often title is on left, control on right (if small)
  // or title on top, control full width (if large)

  // We'll implement the "Row with Control on Right" style for small options (< 3)
  // and "Stacked" for more.

  return (
    <div className="px-4 py-3 relative">
      <div className="flex items-center gap-3 mb-2">
        {leading && (
          <div
            className={clsx(
              'w-7 h-7 rounded-[var(--ak-radius-md)] flex items-center justify-center flex-shrink-0 shadow-sm',
              props.iconColor || 'bg-[var(--ak-color-accent)]'
            )}
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            <div className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{leading}</div>
          </div>
        )}
        <span className="text-[15px] font-medium text-[var(--ak-color-text-primary)]">
          {title}
        </span>
      </div>

      <div className="flex bg-[var(--ak-color-bg-surface-muted)] p-1 rounded-lg w-full">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              'flex-1 px-3 py-1.5 text-[13px] font-medium rounded-[var(--ak-radius-xs)] transition-all duration-200',
              value === opt.value
                ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm ring-1 ring-black/5'
                : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {!props.isLast && (
        <div className="absolute bottom-0 right-0 h-[1px] bg-[var(--ak-color-border-subtle)] left-[16px] opacity-60" />
      )}
    </div>
  )
}

interface SettingsInputProps extends Omit<SettingsRowProps, 'trailing' | 'onClick'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'password' | 'number' | 'email'
}

export function SettingsInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  ...props
}: SettingsInputProps) {
  return (
    <SettingsRow
      {...props}
      trailing={
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none text-[15px] text-[var(--ak-color-text-secondary)] placeholder:text-[var(--ak-color-text-muted)] text-right focus:outline-none focus:ring-0 w-48"
        />
      }
    />
  )
}

interface SettingsTextAreaProps extends Omit<SettingsRowProps, 'trailing' | 'onClick'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function SettingsTextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  ...props
}: SettingsTextAreaProps) {
  return (
    <div className="px-4 py-3 relative">
      <div className="flex items-center gap-3 mb-2">
        {props.leading && (
          <div
            className={clsx(
              'w-7 h-7 rounded-[var(--ak-radius-md)] flex items-center justify-center flex-shrink-0 shadow-sm',
              props.iconColor || 'bg-[var(--ak-color-accent)]'
            )}
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            <div className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{props.leading}</div>
          </div>
        )}
        <span className="text-[15px] font-medium text-[var(--ak-color-text-primary)]">
          {props.title}
        </span>
      </div>
      {props.subtitle && (
        <p className="text-xs text-[var(--ak-color-text-muted)] mb-2 px-1">
          {props.subtitle}
        </p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] rounded-lg p-3 text-[14px] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-[var(--ak-color-accent)] transition-all resize-none"
      />
      {!props.isLast && (
        <div className="absolute bottom-0 right-0 h-[1px] bg-[var(--ak-color-border-subtle)] left-[16px] opacity-60" />
      )}
    </div>
  )
}

interface SettingsButtonProps extends SettingsRowProps {
  disabled?: boolean
}

export function SettingsButton({
  disabled = false,
  onClick,
  ...props
}: SettingsButtonProps) {
  return (
    <SettingsRow
      {...props}
      onClick={disabled ? undefined : onClick}
      trailing={
        props.trailing || (
          <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] opacity-50" />
        )
      }
    />
  )
}
