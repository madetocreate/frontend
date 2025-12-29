"use client";

import React, { useState } from "react";
import clsx from "clsx";

type MicrophoneButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export function MicrophoneButton({ onClick, disabled }: MicrophoneButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsActive(!isActive);
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-full transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/30 focus-visible:ring-offset-1",
        "h-[32px] w-[32px] flex-shrink-0",
        "ak-bg-surface-1",
        "border border-[var(--ak-color-graphite-base)]"
      )}
    >
      {/* Innerer Kreis */}
      <div
        className={clsx(
          "relative flex items-center justify-center rounded-full transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]",
          "h-[22px] w-[22px]",
            isActive ? "border border-[var(--ak-semantic-danger)]" : "border border-[var(--ak-color-border-subtle)]"
        )}
      >
        {/* Punkt in der Mitte */}
        <div
          className={clsx(
            "rounded-full transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]",
            "h-[6px] w-[6px]",
            isActive ? "bg-[var(--ak-semantic-danger)]" : "bg-[var(--ak-color-graphite-base)]"
          )}
        />
      </div>
    </button>
  );
}

