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
      case 'inbox': return 'bg-blue-50 text-blue-600';
      case 'customer': return 'bg-purple-50 text-purple-600';
      case 'document': return 'bg-orange-50 text-orange-600';
      case 'review': return 'bg-yellow-50 text-yellow-600';
      case 'growth': return 'bg-green-50 text-green-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className={clsx(
      "group relative flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 border border-transparent",
      notification.unread ? "bg-white shadow-sm ring-1 ring-black/[0.03]" : "hover:bg-white/60"
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
            notification.unread ? "font-bold text-gray-900" : "font-medium text-gray-700"
          )}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">
            {notification.timestamp}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">
          {notification.subline}
        </p>
      </div>

      {/* Unread Dot */}
      {notification.unread && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
      )}

      {/* Hover Actions */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.done && (
          <button
            onClick={() => onMarkDone(notification.id)}
            className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors shadow-sm"
            title="Als erledigt markieren"
          >
            <CheckCircleIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onOpen(notification)}
          className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
          title="Öffnen"
        >
          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

