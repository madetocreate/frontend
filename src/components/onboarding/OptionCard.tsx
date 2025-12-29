'use client';

import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  selected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-full p-4 text-left transition-all duration-200 ak-surface-1 group',
        'border rounded-lg',
        selected
          ? 'ak-bg-surface-2 border-[var(--ak-color-accent)] ak-elev-1 translate-y-[-2px] ring-1 ring-[var(--ak-color-accent)]/20'
          : 'ak-border-default ak-bg-surface-1 hover:ak-bg-surface-2 hover:border-[var(--ak-color-border-strong)] hover:translate-y-[-1px]'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            'text-[15px] font-medium transition-colors',
            selected ? 'ak-text-primary' : 'ak-text-secondary'
          )}
        >
          {label}
        </span>
        
        <div
          className={clsx(
            'flex items-center justify-center h-5 w-5 rounded-full border transition-all duration-200',
            selected
              ? 'bg-[var(--ak-color-accent)] border-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-sm'
              : 'ak-border-default group-hover:border-[var(--ak-color-border-strong)]'
          )}
        >
          {selected && <Check className="h-3 w-3 stroke-[3]" />}
        </div>
      </div>

      {/* Subtle selection indicator on the left with glow */}
      <div
        className={clsx(
          'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-[var(--ak-color-accent)] rounded-r-full transition-all duration-300 shadow-[0_0_8px_var(--ak-color-accent)]',
          selected ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        )}
      />

      {/* Focus ring for accessibility */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-[var(--ak-color-accent)] ring-offset-2 opacity-0 group-focus-visible:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
};
