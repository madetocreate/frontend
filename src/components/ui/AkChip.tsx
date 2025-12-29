"use client";

import React from "react";
import clsx from "clsx";

export type AkChipSize = "sm" | "md";

export type AkChipProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  pressed?: boolean;
  size?: AkChipSize;
};

export function AkChip({
  pressed = false,
  size = "sm",
  className,
  ...props
}: AkChipProps) {
  const sizeClass = size === "md" ? "h-6 px-2.5 text-[10px]" : "h-5 px-1.5 text-[9px]";

  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center gap-1 rounded-[var(--ak-radius-sm)] ring-1 ring-inset",
        "transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25",
        sizeClass,
        pressed
          ? "bg-[var(--ak-color-graphite-base)] text-[var(--ak-color-graphite-text)] ring-[var(--ak-color-graphite-border)] shadow-sm"
          : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] ring-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)]",
        className
      )}
      {...props}
    />
  );
}
