'use client';

import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Insight {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SmartInsightCardProps {
  insights: Insight[];
  onDismiss: (id: string) => void;
  className?: string;
}

export function SmartInsightCard({ insights, onDismiss, className = '' }: SmartInsightCardProps) {
  if (insights.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={`
              relative p-4 rounded-xl border flex items-start gap-4 transition-colors
              ${insight.type === 'info' ? 'bg-[var(--ak-color-bg-surface-muted)]/30 border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-semantic-info-soft)]' : ''}
              ${insight.type === 'success' ? 'bg-[var(--ak-color-bg-surface-muted)]/30 border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-semantic-success-soft)]' : ''}
              ${insight.type === 'warning' ? 'bg-[var(--ak-color-bg-surface-muted)]/30 border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-semantic-warning-soft)]' : ''}
              ${insight.type === 'alert' ? 'bg-[var(--ak-color-bg-surface-muted)]/30 border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-semantic-danger-soft)]' : ''}
            `}
          >
            {/* Icon */}
            <div className={`
              mt-0.5 p-1.5 rounded-lg shrink-0
              ${insight.type === 'info' ? 'bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]' : ''}
              ${insight.type === 'success' ? 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]' : ''}
              ${insight.type === 'warning' ? 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]' : ''}
              ${insight.type === 'alert' ? 'bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)]' : ''}
            `}>
              <SparklesIcon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                {insight.message}
              </p>
              {insight.action && (
                <button
                  onClick={insight.action.onClick}
                  className={`mt-2 text-xs font-semibold hover:underline
                    ${insight.type === 'info' ? 'text-[var(--ak-semantic-info)]' : ''}
                    ${insight.type === 'success' ? 'text-[var(--ak-semantic-success)]' : ''}
                    ${insight.type === 'warning' ? 'text-[var(--ak-semantic-warning)]' : ''}
                    ${insight.type === 'alert' ? 'text-[var(--ak-semantic-danger)]' : ''}
                  `}
                >
                  {insight.action.label} →
                </button>
              )}
            </div>

            {/* Dismiss */}
            <button
              onClick={() => onDismiss(insight.id)}
              className="p-1 rounded-md hover:bg-[var(--ak-color-bg-hover)] transition-colors shrink-0"
            >
              <XMarkIcon className="w-4 h-4 text-[var(--ak-color-text-muted)]" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

