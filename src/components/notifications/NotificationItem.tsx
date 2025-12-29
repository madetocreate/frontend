'use client';

import React from 'react';
import { Notification } from './types';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  DocumentIcon, 
  StarIcon, 
  MegaphoneIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface NotificationItemProps {
  notification: Notification;
  onOpen: (n: Notification) => void;
  onMarkDone: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onOpen,
  onMarkDone
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'inbox': return <PaperAirplaneIcon className="w-4 h-4" />;
      case 'customer': return <UserIcon className="w-4 h-4" />;
      case 'document': return <DocumentIcon className="w-4 h-4" />;
      case 'review': return <StarIcon className="w-4 h-4" />;
      case 'growth': return <MegaphoneIcon className="w-4 h-4" />;
      default: return <PaperAirplaneIcon className="w-4 h-4" />;
    }
  };

  const getBadgeColor = () => {
    switch (notification.type) {
      case 'inbox': return 'bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]';
      case 'customer': return 'bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)]';
      case 'document': return 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]';
      case 'review': return 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]';
      case 'growth': return 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]';
      default: return 'ak-bg-surface-muted ak-text-secondary';
    }
  };

  return (
    <div className={clsx(
      "group relative flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 border border-transparent",
      notification.unread ? "bg-[var(--ak-surface-1)] shadow-sm ring-1 ring-black/[0.03]" : "hover:bg-[var(--ak-surface-1)]/60"
    )}>
      {/* Type Icon Badge */}
      <div className={clsx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
        getBadgeColor()
      )}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-12">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h4 className={clsx(
            "text-sm truncate",
            notification.unread ? "font-bold ak-text-primary" : "font-medium ak-text-secondary"
          )}>
            {notification.title}
          </h4>
          <span className="text-[10px] ak-text-muted tabular-nums whitespace-nowrap">
            {notification.timestamp}
          </span>
        </div>
        <p className="text-xs ak-text-secondary line-clamp-1">
          {notification.subline}
        </p>
      </div>

      {/* Unread Dot */}
      {notification.unread && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--ak-semantic-success)] ak-shadow-colored" />
      )}

      {/* Hover Actions */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.done && (
          <button
            onClick={() => onMarkDone(notification.id)}
            className="p-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 backdrop-blur-sm border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-success)] hover:bg-[var(--ak-semantic-success-soft)] transition-colors shadow-sm"
            title="Als erledigt markieren"
          >
            <CheckCircleIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onOpen(notification)}
          className="p-2 rounded-lg bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] hover:brightness-110 transition-colors shadow-md"
          title="Öffnen"
        >
          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

