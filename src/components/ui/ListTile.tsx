"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

type ListTileProps = {
  icon?: ReactNode;
  title: string;
  meta?: string;
  rightAction?: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
};

export function ListTile({
  icon,
  title,
  meta,
  rightAction,
  onClick,
  className,
  active = false,
}: ListTileProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
        "hover:bg-[var(--ak-color-bg-surface-muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-1",
        active && "bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-text-primary)]",
        !active && "text-[var(--ak-color-text-secondary)]",
        className
      )}
    >
      {icon && (
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--ak-color-text-muted)]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="ak-body truncate font-medium">{title}</div>
        {meta && (
          <div className="ak-caption mt-0.5 truncate text-[var(--ak-color-text-muted)]">
            {meta}
          </div>
        )}
      </div>
      {rightAction && (
        <div className="flex-shrink-0">{rightAction}</div>
      )}
    </Component>
  );
}

