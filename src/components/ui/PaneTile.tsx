import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface PaneTileProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  badge?: string
  onClick?: () => void
  className?: string
}

export function PaneTile({
  icon,
  title,
  subtitle,
  badge,
  onClick,
  className,
}: PaneTileProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative flex w-full flex-col items-start p-3 text-left rounded-xl transition-all duration-200 ease-out",
        "bg-[var(--ak-surface-0)] hover:bg-[var(--ak-surface-1)]",
        // use the same fine divider token as the rest of the shell (no dark rim)
        "border border-[var(--ak-color-border-fine)] hover:border-[var(--ak-color-border-fine)]",
        className
      )}
    >
      <div className="flex w-full items-start justify-between mb-2">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--ak-surface-2)] text-[var(--ak-text-secondary)] group-hover:text-[var(--ak-text-primary)] transition-colors">
            {icon}
          </div>
        )}
        {badge && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--ak-surface-2)] text-[var(--ak-text-muted)]">
            {badge}
          </span>
        )}
      </div>
      
      <div className="font-medium text-[14px] text-[var(--ak-text-primary)] leading-tight mb-0.5">
        {title}
      </div>
      {subtitle && (
        <div className="text-[12px] text-[var(--ak-text-secondary)] leading-snug line-clamp-2">
          {subtitle}
        </div>
      )}
    </button>
  )
}

