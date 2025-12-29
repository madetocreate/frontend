"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { appleCardStyle } from "@/lib/appleDesign";

type WidgetCardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  shadow?: boolean;
  status?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  hoverActions?: ReactNode;
  variant?: "default" | "glassy";
};

export function WidgetCard({
  title,
  subtitle,
  actions,
  children,
  className,
  padding = "md",
  shadow = false,
  status,
  hoverActions,
  variant = "default"
}: WidgetCardProps) {
  const paddingClass =
    padding === "none" ? "" : padding === "sm" ? "p-4" : padding === "lg" ? "p-8" : "p-[var(--ak-card-padding)]";

  const hasHeader = Boolean(title || subtitle || actions);

  // Status Border Colors
  const statusBorderClass = status ? {
    info: 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--ak-color-accent)]',
    success: 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--ak-semantic-success)]',
    warning: 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--ak-semantic-warning)]',
    danger: 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--ak-semantic-danger)]',
    neutral: 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--ak-color-border-strong)]'
  }[status] : '';

  return (
    <div
      className={clsx(
        variant === "glassy" 
          ? appleCardStyle 
          : "rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]",
        "group relative flex flex-col overflow-hidden",
        shadow ? "ak-shadow-card" : "",
        "transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]",
        "hover:border-[var(--ak-color-border-strong)]",
        status && "pl-[2px]", // Offset for the absolute positioned accent bar
        statusBorderClass,
        className,
      )}
    >
      {/* Hover Actions Overlay (Top Right) */}
      {hoverActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex gap-1 bg-[var(--ak-surface-1)]/90 backdrop-blur-sm p-1 rounded-lg border border-[var(--ak-color-border-subtle)] shadow-sm">
           {hoverActions}
        </div>
      )}

      {hasHeader ? (
        <div className={clsx(
            "flex items-start justify-between gap-4 px-[var(--ak-card-padding)] py-5",
            // Add subtle separator if content follows
            children && "border-b border-[var(--ak-color-border-fine)]"
        )}>
          <div className="min-w-0 flex-1">
            {title ? <h3 className="ak-text-title text-[var(--ak-color-text-primary)]">{title}</h3> : null}
            {subtitle ? (
              <p className="ak-text-meta mt-1 text-[var(--ak-color-text-secondary)]">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0 flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className={clsx("flex-1 relative", paddingClass)}>{children}</div>
    </div>
  );
}
