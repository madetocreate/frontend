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
        "bg-white",
        "border border-black"
      )}
    >
      {/* Innerer Kreis */}
      <div
        className={clsx(
          "relative flex items-center justify-center rounded-full transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]",
          "h-[22px] w-[22px]",
          isActive ? "border border-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" : "border border-gray-400"
        )}
      >
        {/* Punkt in der Mitte */}
        <div
          className={clsx(
            "rounded-full transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]",
            "h-[6px] w-[6px]",
            isActive ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-black"
          )}
        />
      </div>
    </button>
  );
}

