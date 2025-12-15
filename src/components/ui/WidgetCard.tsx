"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

type WidgetCardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  shadow?: boolean;
};

export function WidgetCard({
  title,
  subtitle,
  actions,
  children,
  className,
  padding = "md",
  shadow = true,
}: WidgetCardProps) {
  const paddingClass =
    padding === "none" ? "" : padding === "sm" ? "px-3 py-3" : padding === "lg" ? "px-6 py-6" : "px-4 py-4";

  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <div
      className={clsx(
        "flex flex-col rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]",
        shadow ? "shadow-[var(--ak-elev-1)]" : "",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            {title ? <h3 className="ak-heading text-sm">{title}</h3> : null}
            {subtitle ? (
              <p className="ak-caption mt-0.5 text-[var(--ak-color-text-secondary)]">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      <div className={clsx("flex-1", paddingClass)}>{children}</div>
    </div>
  );
}
