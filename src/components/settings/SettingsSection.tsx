'use client'

import { ReactNode } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
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
  className 
}: SettingsSectionProps) {
  if (expertOnly && mode === 'simple') {
    return null
  }

  return (
    <div className={clsx('mb-8', className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
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
}

export function SettingsRow({ 
  title, 
  subtitle, 
  leading, 
  trailing, 
  onClick,
  expertOnly = false,
  mode 
}: SettingsRowProps) {
  if (expertOnly && mode === 'simple') {
    return null
  }

  const isInteractive = Boolean(onClick)
  const content = (
    <div className={clsx(
      'flex items-center justify-between px-4 py-3',
      isInteractive && 'cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors'
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {leading && (
          <div className="flex-shrink-0 text-gray-400">
            {leading}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      {trailing && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {trailing}
          {isInteractive && (
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      )}
    </div>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
      >
        {content}
      </button>
    )
  }

  return <div>{content}</div>
}

interface SettingsToggleProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  expertOnly?: boolean
  mode: SettingsMode
}

export function SettingsToggle({ 
  title, 
  subtitle, 
  leading, 
  checked, 
  onChange,
  expertOnly = false,
  mode 
}: SettingsToggleProps) {
  if (expertOnly && mode === 'simple') {
    return null
  }

  return (
    <SettingsRow
      title={title}
      subtitle={subtitle}
      leading={leading}
      mode={mode}
      trailing={
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      }
    />
  )
}

interface SettingsSelectProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  expertOnly?: boolean
  mode: SettingsMode
}

export function SettingsSelect({ 
  title, 
  subtitle, 
  leading, 
  value, 
  options, 
  onChange,
  expertOnly = false,
  mode 
}: SettingsSelectProps) {
  if (expertOnly && mode === 'simple') {
    return null
  }

  return (
    <SettingsRow
      title={title}
      subtitle={subtitle}
      leading={leading}
      mode={mode}
      trailing={
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none text-sm text-gray-900 font-medium focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-6"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    />
  )
}

interface SettingsInputProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'password' | 'number' | 'email'
  expertOnly?: boolean
  mode: SettingsMode
}

export function SettingsInput({ 
  title, 
  subtitle, 
  leading, 
  value, 
  onChange,
  placeholder,
  type = 'text',
  expertOnly = false,
  mode 
}: SettingsInputProps) {
  if (expertOnly && mode === 'simple') {
    return null
  }

  return (
    <SettingsRow
      title={title}
      subtitle={subtitle}
      leading={leading}
      mode={mode}
      trailing={
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none text-sm text-gray-900 text-right focus:outline-none focus:ring-0 w-48 text-right"
        />
      }
    />
  )
}

