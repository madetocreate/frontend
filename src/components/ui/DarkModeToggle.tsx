'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import clsx from 'clsx'

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative inline-flex items-center gap-1 p-1 bg-[var(--ak-color-bg-surface-muted)] rounded-xl opacity-50">
        <div className="h-8 w-24" />
      </div>
    )
  }

  const modes = [
    { id: 'light', icon: SunIcon, label: 'Light' },
    { id: 'system', icon: ComputerDesktopIcon, label: 'System' },
    { id: 'dark', icon: MoonIcon, label: 'Dark' }
  ] as const

  return (
    <div className="relative inline-flex items-center gap-1 p-1 bg-[var(--ak-color-bg-surface-muted)] rounded-xl border border-[var(--ak-color-border-subtle)]">
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          onClick={() => setTheme(mode.id)}
          className={clsx(
            'relative px-3 py-2 rounded-lg transition-colors flex items-center gap-2',
            theme === mode.id
              ? 'text-[var(--ak-color-text-inverted)]'
              : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {theme === mode.id && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-[var(--ak-color-accent)] rounded-lg shadow-sm"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <mode.icon className="h-4 w-4" />
            <span className="text-xs font-semibold hidden sm:inline">{mode.label}</span>
          </span>
        </motion.button>
      ))}
    </div>
  )
}

export function DarkModeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-10 w-10" />

  const isDark = resolvedTheme === 'dark'

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <motion.button
      onClick={toggle}
      className="relative h-10 w-10 rounded-full bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] flex items-center justify-center hover:scale-110 transition-transform"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 360 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {isDark ? (
          <MoonIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
        ) : (
          <SunIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
        )}
      </motion.div>
    </motion.button>
  )
}
