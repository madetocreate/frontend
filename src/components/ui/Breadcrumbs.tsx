'use client'

import { Fragment, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon, HomeIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export interface Breadcrumb {
  label: string
  href: string
  icon?: React.ReactNode
  children?: Breadcrumb[] // For dropdown
}

interface BreadcrumbsProps {
  items: Breadcrumb[]
  maxItems?: number // Show "..." if exceeds
}

export function Breadcrumbs({ items, maxItems = 5 }: BreadcrumbsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const shouldCollapse = items.length > maxItems
  const visibleItems = shouldCollapse 
    ? [items[0], ...items.slice(-(maxItems - 2))]
    : items

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {/* Home Icon */}
      <Link 
        href="/"
        className="flex items-center text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors"
      >
        <HomeIcon className="h-4 w-4" />
      </Link>

      {shouldCollapse && (
        <>
          <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
          <button className="px-2 py-1 rounded hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            <EllipsisHorizontalIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
          </button>
        </>
      )}

      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1

        return (
          <Fragment key={item.href}>
            <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
            
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => item.children && setExpandedIndex(index)}
                onHoverEnd={() => setExpandedIndex(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isLast
                      ? 'bg-gradient-to-r from-[var(--ak-semantic-info)] to-[var(--ak-accent-documents)] text-[var(--ak-color-text-inverted)] font-semibold shadow-md'
                      : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.children && !isLast && (
                    <ChevronRightIcon className="h-3 w-3 opacity-50" />
                  )}
                </Link>
              </motion.div>

              {/* Dropdown for children */}
              <AnimatePresence>
                {item.children && expandedIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 min-w-[200px] bg-[var(--ak-color-bg-surface)] rounded-xl border border-[var(--ak-color-border-subtle)] shadow-2xl overflow-hidden z-50"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                      >
                        {child.icon}
                        <span className="font-medium">{child.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Fragment>
        )
      })}
    </nav>
  )
}

// Compact Version (for mobile)
export function CompactBreadcrumbs({ items }: { items: Breadcrumb[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const current = items[items.length - 1]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
      >
        <EllipsisHorizontalIcon className="h-4 w-4" />
        <span className="font-medium">{current.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-full min-w-[250px] bg-[var(--ak-color-bg-surface)] dark:bg-[var(--ak-color-bg-surface)] rounded-xl border border-[var(--ak-color-border-subtle)] dark:border-[var(--ak-color-border-strong)] shadow-2xl overflow-hidden z-50"
          >
            {items.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--ak-color-bg-hover)] transition-colors ${
                  index === items.length - 1 ? 'bg-[var(--ak-semantic-info-soft)] font-semibold' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

