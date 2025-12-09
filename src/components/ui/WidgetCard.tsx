"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

type WidgetCardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  shadow?: boolean;
};

export function WidgetCard({
  title,
  subtitle,
  actions,
  children,
  className,
  padding = "md",
}: WidgetCardProps) {
  const paddingClass = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  }[padding];

  return (
    <div
      className={clsx(
        "flex flex-col rounded-xl border border-slate-200 bg-[var(--ak-color-bg-surface)]/95 p-3 shadow-[var(--ak-shadow-soft)] backdrop-blur-xl",
        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between border-b border-[var(--ak-color-border-subtle)] mb-3 pb-3">
          <div className="flex-1">
            {title && (
              <h3 className="ak-heading mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="ak-caption text-[var(--ak-color-text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      )}
      <div className={clsx("flex-1", padding === "sm" ? "px-0 py-0" : paddingClass)}>{children}</div>
    </div>
  );
}

