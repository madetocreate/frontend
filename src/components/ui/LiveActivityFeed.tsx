'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, ChatBubbleLeftIcon, PhoneIcon, StarIcon } from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'call' | 'review' | 'message';
  title: string;
  subtitle: string;
  timestamp: Date;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Simulate incoming live events
  useEffect(() => {
    // Initial data
    setActivities([
      {
        id: '1',
        type: 'call',
        title: 'Verpasster Anruf',
        subtitle: 'von +49 171 1234567',
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 mins ago
      },
      {
        id: '2',
        type: 'review',
        title: 'Neue 5-Sterne Bewertung',
        subtitle: 'von Julia Meyer auf Google',
        timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 mins ago
      }
    ]);

    // Random new event every 15-30 seconds
    const interval = setInterval(() => {
      const types: Activity['type'][] = ['call', 'review', 'message'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        type,
        title: type === 'call' ? 'Neuer Anruf' : type === 'review' ? 'Neue Bewertung' : 'Neue Nachricht',
        subtitle: type === 'call' ? 'Unbekannte Nummer' : type === 'review' ? 'via Google Maps' : 'via Website Chat',
        timestamp: new Date()
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 5)); // Keep last 5
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ak-semantic-success)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--ak-semantic-success)]"></span>
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ak-color-text-secondary)]">
          Live Aktivität
        </h3>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3"
            >
              <div className={`
                p-2 rounded-full shrink-0 mt-0.5
                ${activity.type === 'call' ? 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]' : ''}
                ${activity.type === 'review' ? 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]' : ''}
                ${activity.type === 'message' ? 'bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]' : ''}
              `}>
                {activity.type === 'call' && <PhoneIcon className="w-3.5 h-3.5" />}
                {activity.type === 'review' && <StarIcon className="w-3.5 h-3.5" />}
                {activity.type === 'message' && <ChatBubbleLeftIcon className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--ak-color-text-primary)] truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-[var(--ak-color-text-secondary)] truncate">
                  {activity.subtitle}
                </p>
              </div>
              <span className="text-[10px] text-[var(--ak-color-text-muted)] whitespace-nowrap">
                {formatTime(activity.timestamp)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatTime(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Gerade eben';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

