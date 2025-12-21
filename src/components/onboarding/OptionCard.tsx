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
        'relative w-full p-4 text-left transition-all duration-200 apple-card group',
        'border border-transparent',
        selected
          ? 'bg-[var(--apple-bg-elevated)] border-[var(--apple-green)] shadow-md translate-y-[-2px]'
          : 'bg-[var(--apple-bg-secondary)] hover:bg-[var(--apple-bg-tertiary)] hover:border-[var(--apple-gray-300)]'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            'text-[15px] font-medium transition-colors',
            selected ? 'text-[var(--apple-text-primary)]' : 'text-[var(--apple-text-secondary)]'
          )}
        >
          {label}
        </span>
        
        <div
          className={clsx(
            'flex items-center justify-center h-5 w-5 rounded-full border transition-all duration-200',
            selected
              ? 'bg-[var(--apple-green)] border-[var(--apple-green)] text-white'
              : 'border-[var(--apple-gray-400)] group-hover:border-[var(--apple-gray-500)]'
          )}
        >
          {selected && <Check className="h-3 w-3 stroke-[3]" />}
        </div>
      </div>

      {/* Subtle selection indicator on the left */}
      <div
        className={clsx(
          'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-[var(--apple-green)] rounded-r-full transition-all duration-300',
          selected ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        )}
      />

      {/* Focus ring for accessibility */}
      <div className="absolute inset-0 rounded-[var(--apple-radius-lg)] ring-[var(--apple-green)] ring-offset-2 opacity-0 group-focus-visible:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
};

