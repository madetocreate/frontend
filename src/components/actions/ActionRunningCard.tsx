'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export interface ActionRunningCardProps {
  actionId: string;
  status: 'running' | 'reconnecting' | 'failed' | 'done';
  stepLabel?: string;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function ActionRunningCard({
  actionId,
  status,
  stepLabel,
  error,
  onRetry,
  className,
}: ActionRunningCardProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'running':
        return {
          label: 'Wird ausgeführt...',
          icon: SparklesIcon,
          color: 'text-[var(--ak-color-accent)]',
          bgColor: 'bg-[var(--ak-color-accent)]/10',
          borderColor: 'border-[var(--ak-color-accent)]/20',
        };
      case 'reconnecting':
        return {
          label: 'Verbindung wird wiederhergestellt...',
          icon: SparklesIcon,
          color: 'text-[var(--ak-semantic-warning)]',
          bgColor: 'bg-[var(--ak-semantic-warning)]/10',
          borderColor: 'border-[var(--ak-semantic-warning)]/20',
        };
      case 'failed':
        return {
          label: 'Fehlgeschlagen',
          icon: SparklesIcon,
          color: 'text-[var(--ak-color-danger)]',
          bgColor: 'bg-[var(--ak-color-danger)]/10',
          borderColor: 'border-[var(--ak-color-danger)]/20',
        };
      case 'done':
        return {
          label: 'Abgeschlossen',
          icon: SparklesIcon,
          color: 'text-[var(--ak-color-success)]',
          bgColor: 'bg-[var(--ak-color-success)]/10',
          borderColor: 'border-[var(--ak-color-success)]/20',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div
      className={clsx(
        'p-4 rounded-lg border bg-[var(--ak-color-bg-surface)]',
        statusInfo.borderColor,
        statusInfo.bgColor,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', statusInfo.bgColor)}>
          <Icon className={clsx('w-4 h-4', statusInfo.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('text-sm font-medium', statusInfo.color)}>
              {statusInfo.label}
            </span>
            {status === 'running' && (
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-[var(--ak-color-accent)] animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-[var(--ak-color-accent)] animate-pulse delay-75" />
                <div className="w-1 h-1 rounded-full bg-[var(--ak-color-accent)] animate-pulse delay-150" />
              </div>
            )}
          </div>
          {stepLabel && (
            <p className="text-xs text-[var(--ak-color-text-muted)]">{stepLabel}</p>
          )}
          {error && (
            <p className="text-xs text-[var(--ak-color-danger)] mt-1">{error}</p>
          )}
        </div>
        {status === 'failed' && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-hover)] hover:bg-[var(--ak-color-bg-hover-strong)] rounded-lg transition-colors"
          >
            Nochmal versuchen
          </button>
        )}
      </div>
    </div>
  );
}

