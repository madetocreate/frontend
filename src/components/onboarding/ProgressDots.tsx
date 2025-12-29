'use client';

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

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
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isActive = i + 1 === currentStep;
        const isPast = i + 1 < currentStep;
        
        return (
          <motion.div
            key={i}
            className={clsx(
              'h-1.5 rounded-full transition-colors duration-300',
              isActive
                ? 'bg-[var(--ak-color-accent)]'
                : isPast
                ? 'bg-[var(--ak-color-accent)] opacity-60'
                : 'bg-[var(--ak-color-border-fine)]'
            )}
            initial={false}
            animate={{
              width: isActive ? 16 : 6,
              opacity: isActive ? 1 : isPast ? 0.6 : 1,
              boxShadow: isActive ? '0 0 8px -2px var(--ak-color-accent)' : 'none'
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Subtle inner pulse for active dot life */}
            {isActive && (
              <motion.div
                className="w-full h-full bg-white/20 rounded-full"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
