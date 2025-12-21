'use client';

import React from 'react';
import clsx from 'clsx';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  currentStep,
  totalSteps,
  className,
}) => {
  return (
    <div className={clsx('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'h-1.5 w-1.5 rounded-full transition-all duration-300',
            i + 1 === currentStep
              ? 'bg-[var(--apple-green)] w-4'
              : i + 1 < currentStep
              ? 'bg-[var(--apple-green)] opacity-50'
              : 'bg-[var(--apple-gray-300)]'
          )}
        />
      ))}
    </div>
  );
};

