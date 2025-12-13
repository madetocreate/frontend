"use client";

import type { CSSProperties } from "react";
import clsx from "clsx";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type AkSearchFieldAccent =
  | "default"
  | "chat"
  | "inbox"
  | "customers"
  | "documents"
  | "growth";

export type AkSearchFieldProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  accent?: AkSearchFieldAccent;
  size?: "sm" | "md";
  disabled?: boolean;
};

const ACCENT_VALUE: Record<AkSearchFieldAccent, string> = {
  default: "var(--ak-color-accent)",
  chat: "var(--ak-color-accent)",
  inbox: "var(--ak-accent-inbox)",
  customers: "var(--ak-accent-customers)",
  documents: "var(--ak-accent-documents)",
  growth: "var(--ak-accent-growth)",
};

export function AkSearchField({
  value,
  onChange,
  placeholder = "Suchen…",
  name,
  className,
  inputClassName,
  autoFocus,
  accent = "default",
  size = "md",
  disabled,
}: AkSearchFieldProps) {
  const heightClass =
    size === "sm"
      ? "h-[var(--ak-button-height-sm)]"
      : "h-[var(--ak-button-height-md)]";

  const style: CSSProperties & Record<string, string> = {
    ["--ak-control-accent"]: ACCENT_VALUE[accent],
  };

  return (
    <div className={clsx("relative w-full", className)} style={style}>
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ak-color-text-muted)]" />
      <input
        type="search"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={clsx(
          "w-full",
          heightClass,
          "rounded-[var(--ak-radius-control)]",
          "border border-[var(--ak-color-border-subtle)]",
          "bg-[var(--ak-color-bg-surface-muted)]",
          "pl-9 pr-9",
          "text-[var(--ak-color-text-primary)]",
          "placeholder:text-[var(--ak-color-text-muted)]",
          "focus:outline-none focus:ring-1 focus:ring-[var(--ak-control-accent)] focus:border-[var(--ak-control-accent)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          inputClassName
        )}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--ak-color-text-muted)] hover:bg-[var(--ak-color-bg-hover)]"
          aria-label="Suche löschen"
          disabled={disabled}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
