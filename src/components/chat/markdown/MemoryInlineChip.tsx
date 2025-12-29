"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { archiveMemory } from "@/lib/memoryClient";

type MemoryInlineChipProps = {
  id: string;
  label: string;
  tenantId?: string;
};

export function MemoryInlineChip({ id, label, tenantId }: MemoryInlineChipProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleForget = async () => {
    try {
      // B1: Nutze memoryClient für Auth
      await archiveMemory(id);
      setOpen(false);
    } catch (e) {
      console.warn("Memory forget failed", e);
      setOpen(false);
    }
  };

  const handleOpen = () => {
    // Redirect zu V2 Settings Memory
    const url = `/settings?tab=memory&id=${encodeURIComponent(id)}`;
    window.open(url, "_blank");
  };

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className={clsx(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border text-[10px] leading-tight",
          "border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]",
          "hover:bg-[var(--ak-color-bg-hover)] transition-colors"
        )}
        onClick={() => setOpen((p) => !p)}
        aria-label={`Memory: ${label}`}
      >
        <span className="truncate max-w-[80px]">{label}</span>
      </button>
      {open && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-1 min-w-[140px] rounded-md border border-[var(--ak-color-border-subtle)] ak-bg-surface-1 shadow-sm p-2 text-xs text-[var(--ak-color-text-primary)]"
          style={{ top: "100%", left: 0 }}
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="text-left px-2 py-1 rounded hover:bg-[var(--ak-color-bg-hover)]"
              onClick={handleOpen}
            >
              Ansehen
            </button>
            <button
              type="button"
              className="text-left px-2 py-1 rounded hover:bg-[var(--ak-color-bg-hover)]"
              onClick={handleForget}
            >
              Vergessen
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

