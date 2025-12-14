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
        "inline-flex items-center justify-center gap-1 rounded-[4px] ring-1 ring-inset",
        "transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25",
        sizeClass,
        pressed
          ? "bg-slate-900 text-white ring-slate-900/20 shadow-sm"
          : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] ring-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)]",
        className
      )}
      {...props}
    />
  );
}
