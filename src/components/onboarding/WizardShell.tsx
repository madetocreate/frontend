'use client';

import React from 'react';
import { X } from 'lucide-react';
import { ProgressDots } from './ProgressDots';

interface WizardShellProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onClose?: () => void;
  showProgress?: boolean;
  maxWidth?: string;
  // Visual props
  title?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const WizardShell: React.FC<WizardShellProps> = ({
  children,
  currentStep,
  totalSteps,
  onClose,
  showProgress = true,
  maxWidth = 'max-w-md',
  title,
  icon,
  subtitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--ak-color-bg-hover)]/80 animate-in fade-in duration-300 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Wizard Card */}
      <div className={`relative w-full ${maxWidth} ak-surface-1 rounded-[var(--ak-radius-xl)] overflow-hidden ak-elev-3 animate-in fade-in zoom-in-95 duration-400 border ak-border-default flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="relative px-6 py-4 flex items-center justify-between border-b ak-border-default shrink-0 bg-[var(--ak-bg-surface-1)]/50">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--ak-color-accent)] to-transparent opacity-20" />
          
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Step Icon Badge */}
            {icon && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)] shrink-0 border border-[var(--ak-color-accent)]/10 shadow-[inset_0_0_8px_-4px_var(--ak-color-accent)]">
                {icon}
              </div>
            )}
            
            <div className="flex flex-col min-w-0">
              {title && (
                <h3 className="text-sm font-semibold ak-text-primary truncate leading-tight">
                  {title}
                </h3>
              )}
              {showProgress && (
                <span className="text-xs font-medium ak-text-secondary truncate">
                  {subtitle || `Schritt ${currentStep} von ${totalSteps}`}
                </span>
              )}
            </div>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--ak-color-bg-hover)] transition-colors ak-text-muted hover:ak-text-primary shrink-0 ml-2"
              aria-label="Schließen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-8 sm:px-8 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer Progress */}
        {showProgress && (
          <div className="px-6 py-4 flex justify-center border-t ak-border-default shrink-0 bg-[var(--ak-bg-surface-1)]/30">
            <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}
      </div>
    </div>
  );
};
