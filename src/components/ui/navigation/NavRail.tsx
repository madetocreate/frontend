'use client'

import React from 'react'
import clsx from 'clsx'
import { NavItem, NavItemId } from '@/lib/nav/navItems'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { AkTooltip } from '@/components/ui/AkTooltip'

interface NavRailProps {
  items: NavItem[]
  activeId: NavItemId
  onSelect: (id: NavItemId) => void
  onToggleExpand?: () => void
  isExpanded?: boolean
  unreadInboxCount?: number
}

export function NavRail({ 
  items, 
  activeId, 
  onSelect, 
  onToggleExpand, 
  isExpanded = false,
  unreadInboxCount = 0 
}: NavRailProps) {
  const mainItems = items.filter(i => i.section === 'main')
  const bottomItems = items.filter(i => i.section === 'bottom')

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive = item.id === activeId

    // Special case for Bots: Ensure they are clickable even without direct entitlement check here (handled in parent)
    const isBot = ['review_bot', 'telephony_bot', 'website_bot'].includes(item.id)

    return (
      <div key={item.id} className="relative group flex justify-center w-full px-2">
        <AkTooltip content={item.label} placement="right">
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            className={clsx(
              'ak-item ak-motion-fast h-10 w-10',
              isActive
                ? 'ak-item-active shadow-sm'
                : 'hover:ak-item-hover active:ak-item-pressed'
            )}
          >
            <Icon className={clsx(
              "h-5 w-5 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]",
              isActive 
                ? "stroke-[1.75] text-[var(--ak-icon-active)] scale-110 ak-shadow-colored" 
                : "stroke-[1.25] text-[var(--ak-icon-default)] group-hover:text-[var(--ak-icon-hover)]"
            ) as string} aria-hidden={true} />
            {item.id === 'inbox' && unreadInboxCount > 0 && (
              <span className={clsx(
                "absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center border border-[var(--ak-color-bg-surface)] shadow-sm transition-transform duration-200",
                isActive ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] scale-110" : "bg-[var(--ak-color-text-muted)] text-[var(--ak-color-text-inverted)]"
              )}>
                {unreadInboxCount > 99 ? '99+' : unreadInboxCount}
              </span>
            )}
          </button>
        </AkTooltip>
      </div>
    )
  }

  return (
    <aside className={clsx(
      "ak-rail ak-divider-right flex flex-col items-center pt-5 pb-3 h-full w-[68px] z-[60] bg-[var(--ak-color-bg-sidebar)]"
    )}>
      {/* Expand Toggle Button */}
      {onToggleExpand && (
        <div className="mb-4 w-full flex justify-center px-2">
          <button
            onClick={onToggleExpand}
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-[var(--ak-motion-duration)] outline-none",
              isExpanded
                ? "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]"
                : "text-[var(--ak-text-secondary)] hover:bg-[var(--ak-color-rail-hover-bg)] hover:text-[var(--ak-text-primary)]"
            )}
            title={isExpanded ? "Sidebar einklappen" : "Sidebar ausklappen"}
          >
            <Bars3Icon className={clsx("h-5 w-5 stroke-[1.25] transition-transform duration-[var(--ak-motion-duration-slow)]", isExpanded && "rotate-180")} />
          </button>
        </div>
      )}

      {/* Luft oben bis die Icons beginnen (wenn kein Toggle gerendert wird) */}
      {!onToggleExpand && <div className="h-2" />}

      <div className="flex flex-col items-center w-full gap-3">
        {mainItems.map(renderItem)}
      </div>
      <div className="mt-auto flex flex-col items-center w-full gap-3 pb-2">
        {bottomItems.map(renderItem)}
      </div>
    </aside>
  )
}
