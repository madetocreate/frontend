'use client'

import React from 'react'
import clsx from 'clsx'
import { NavItem, NavItemId } from '@/lib/nav/navItems'

interface NavListProps {
  items: NavItem[]
  activeId: NavItemId
  onSelect: (id: NavItemId) => void
  unreadInboxCount?: number
}

export function NavList({ items, activeId, onSelect, unreadInboxCount = 0 }: NavListProps) {
  const mainItems = items.filter(i => i.section === 'main')
  const bottomItems = items.filter(i => i.section === 'bottom')

  const renderRow = (item: NavItem) => {
    const Icon = item.icon
    const isActive = item.id === activeId

    return (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={clsx(
          'group flex items-center w-full px-3 py-2.5 gap-3 rounded-[var(--ak-radius-lg)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] outline-none text-[13.5px]',
          isActive
            ? 'bg-[var(--ak-color-selected-bg)] border-l-2 border-[var(--ak-color-selected-border)] text-[var(--ak-text-primary)] font-medium shadow-sm'
            : 'text-[var(--ak-icon-default)] hover:bg-[var(--ak-surface-2-hover)] hover:text-[var(--ak-icon-hover)] font-medium'
        )}
      >
        <div className={clsx(
          'flex items-center justify-center w-5 h-5 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] group-active:scale-95',
          isActive 
            ? 'text-[var(--ak-icon-active)]' 
            : 'text-[var(--ak-icon-default)] group-hover:text-[var(--ak-icon-hover)]'
        )}>
          <Icon className={clsx(
            "w-5 h-5 stroke-[1.5] transition-all duration-[var(--ak-motion-duration)]",
            isActive && "ak-shadow-colored"
          )} />
        </div>
        <span className="flex-1 text-left truncate tracking-tight">{item.label}</span>
        {item.id === 'inbox' && unreadInboxCount > 0 && (
          <span className={clsx(
            "min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors",
            isActive 
              ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-sm" 
              : "bg-[var(--ak-surface-2-hover)] text-[var(--ak-text-secondary)] group-hover:bg-[var(--ak-surface-2-selected)]"
          )}>
            {unreadInboxCount > 99 ? '99+' : unreadInboxCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <nav className="flex flex-col w-full h-full p-2 gap-6">
      <div className="flex flex-col gap-0.5">
        {mainItems.map(renderRow)}
      </div>
      <div className="mt-auto flex flex-col gap-0.5">
        {bottomItems.map(renderRow)}
      </div>
    </nav>
  )
}

