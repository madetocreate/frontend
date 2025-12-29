"use client";

import React from "react";
import clsx from "clsx";

export type AkBadgeSize = "xs" | "sm" | "md";

export type AkBadgeTone =
  | "muted"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"
  | "neutral"
  | "error";

export type AkBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: AkBadgeSize;
  tone?: AkBadgeTone;
};

const TONE_CLASSES: Record<AkBadgeTone, string> = {
  muted:
    "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] ring-[var(--ak-color-border-subtle)]",
  success:
    "bg-[var(--ak-color-bg-success)] text-[var(--ak-color-text-success)] ring-[var(--ak-color-border-success)]",
  warning:
    "bg-[var(--ak-color-bg-warning)] text-[var(--ak-color-text-warning)] ring-[var(--ak-color-border-warning)]",
  danger:
    "bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-danger)] ring-[var(--ak-color-border-danger)]",
  info:
    "bg-[var(--ak-color-bg-info)] text-[var(--ak-color-text-info)] ring-[var(--ak-color-border-info)]",
  accent:
    "bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent-strong)] ring-[var(--ak-color-border-subtle)]",
  neutral:
    "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] ring-[var(--ak-color-border-subtle)]",
  error:
    "bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-danger)] ring-[var(--ak-color-border-danger)]",
};

export function AkBadge({ className, size = "sm", tone = "muted", ...props }: AkBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-[var(--ak-radius-pill)] px-2 py-0.5 text-xs font-medium ring-[var(--ak-border-hairline)] ring-inset", /* Subtiler Border - Apple Style */
        size === "md" ? "px-2.5 py-1 text-sm" : "",
        size === "xs" ? "px-1.5 py-[3px] text-[11px]" : "",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
