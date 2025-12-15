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
    padding === "none" ? "" : padding === "sm" ? "px-4 py-4" : padding === "lg" ? "px-8 py-8" : "px-6 py-6";

  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <div
      className={clsx(
        "flex flex-col rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]",
        shadow ? "shadow-[var(--ak-shadow-soft)]" : "",
        "transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]",
        "hover:shadow-[var(--ak-shadow-md)]",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex items-start justify-between gap-4 px-6 py-5">
          <div className="min-w-0 flex-1">
            {title ? <h3 className="ak-heading text-base font-semibold">{title}</h3> : null}
            {subtitle ? (
              <p className="ak-caption mt-1.5 text-[var(--ak-color-text-secondary)] text-sm">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      <div className={clsx("flex-1", paddingClass)}>{children}</div>
    </div>
  );
}
