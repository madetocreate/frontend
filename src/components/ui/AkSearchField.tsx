"use client";

import React, { useId } from "react";
import clsx from "clsx";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export type AkSearchFieldSize = "sm" | "md" | "lg";
export type AkSearchFieldTone = "default" | "subtle";

export type AkSearchFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "size"
> & {
  value: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  size?: AkSearchFieldSize;
  tone?: AkSearchFieldTone;
  ariaLabel?: string;
  hasIcon?: boolean;
  prefixIcon?: "search" | React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  inputClassName?: string;
};

export function AkSearchField({
  value,
  onValueChange,
  onChange,
  placeholder,
  ariaLabel,
  size = "md",
  tone = "default",
  hasIcon,
  prefixIcon,
  leading,
  trailing,
  className,
  inputClassName,
  ...props
}: AkSearchFieldProps) {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange?.(next);
    onValueChange?.(next);
  };

  const sizeClass =
    size === "sm"
      ? "h-8 px-2.5 text-[13px]"
      : size === "lg"
        ? "h-10 px-3.5 text-[15px]"
        : "h-9 px-3 text-sm";

  const hasLeading = Boolean(leading || hasIcon || prefixIcon);
  const hasTrailing = Boolean(trailing);

  const leadPadClass =
    size === "sm" ? "pl-8" : size === "lg" ? "pl-10" : "pl-9";

  const trailPadClass =
    size === "sm" ? "pr-9" : size === "lg" ? "pr-10" : "pr-10";

  const toneClass =
    tone === "subtle"
      ? "bg-[var(--ak-color-bg-surface-muted)]"
      : "bg-[var(--ak-color-bg-surface)]";

  const resolvedAria =
    ariaLabel || placeholder || "Suche";

  const resolvedPrefix =
    leading ??
    (hasLeading ? (
      typeof prefixIcon === "string" || prefixIcon == null ? (
        <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        prefixIcon
      )
    ) : null);

  return (
    <div className={clsx("relative w-full", className)}>
      {resolvedPrefix && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ak-color-text-muted)]">
          {resolvedPrefix}
        </div>
      )}
      {trailing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {trailing}
        </div>
      )}
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        aria-label={resolvedAria}
        className={clsx(
          "w-full rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] shadow-none outline-none placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)]/50 focus:ring-2 focus:ring-[var(--ak-color-accent)]/25",
          sizeClass,
          toneClass,
          hasLeading && leadPadClass,
          hasTrailing && trailPadClass,
          inputClassName
        )}
        {...props}
      />
    </div>
  );
}
