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
}

export const WizardShell: React.FC<WizardShellProps> = ({
  children,
  currentStep,
  totalSteps,
  onClose,
  showProgress = true,
}) => {
  return (
    <div className="fixed inset-0 z-[var(--apple-z-modal)] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Wizard Card */}
      <div className="relative w-full max-w-md apple-glass-enhanced rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-400">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--apple-glass-border)]">
          {showProgress ? (
            <span className="text-xs font-medium text-[var(--apple-text-tertiary)]">
              Schritt {currentStep} von {totalSteps}
            </span>
          ) : (
            <span />
          )}
          
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--apple-gray-100)] dark:hover:bg-[var(--apple-gray-800)] transition-colors"
              aria-label="Schließen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-8 sm:px-8">
          {children}
        </div>

        {/* Footer Progress */}
        {showProgress && (
          <div className="px-6 py-4 flex justify-center border-t border-[var(--apple-glass-border)]">
            <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}
      </div>
    </div>
  );
};

