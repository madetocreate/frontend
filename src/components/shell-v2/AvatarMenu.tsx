'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cog6ToothIcon,
  SparklesIcon,
  LifebuoyIcon,
  CommandLineIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useAklowEscape } from '@/hooks/useAklowEscape';
import clsx from 'clsx';

interface AvatarMenuProps {
  className?: string;
}

export function AvatarMenu({ className }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC: zentralisiertes Escape-Handling
  useAklowEscape({ enabled: isOpen, onEscape: () => setIsOpen(false) });

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleShowKeyboardShortcuts = () => {
    window.dispatchEvent(new CustomEvent('aklow-toggle-shortcuts'));
  };

  const menuItems = [
    {
      id: 'settings',
      label: 'Einstellungen',
      icon: Cog6ToothIcon,
      action: () => router.push('/settings'),
    },
    {
      id: 'memory',
      label: 'Memory',
      icon: SparklesIcon,
      action: () => {
        // Check if memory route exists, otherwise use settings tab
        router.push('/settings?tab=memory');
      },
    },
    {
      id: 'help',
      label: 'Hilfe & Kontakt',
      icon: LifebuoyIcon,
      action: () => {
        // TODO: Navigate to /help if exists, otherwise mailto
        window.location.href = 'mailto:support@aklow.com';
      },
    },
    {
      id: 'shortcuts',
      label: 'Tastenkürzel',
      icon: CommandLineIcon,
      action: handleShowKeyboardShortcuts,
    },
    {
      id: 'auth',
      label: isAuthenticated ? 'Abmelden' : 'Anmelden',
      icon: isAuthenticated ? ArrowRightOnRectangleIcon : UserCircleIcon,
      action: async () => {
        if (isAuthenticated) {
          await logout();
        } else {
          router.push('/auth/login');
        }
      },
      variant: isAuthenticated ? 'danger' : 'default',
    },
  ];

  // Get user initials
  const initials = user
    ? user.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
    : '?';

  return (
    <div className={clsx('relative', className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--ak-color-bg-hover)] hover:bg-[var(--ak-color-bg-hover-strong)] transition-colors ak-icon-interactive ak-focus-ring border border-[var(--ak-color-border-fine)]"
        aria-label="Benutzermenü"
      >
        {user?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt={user.name || user.email || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <span className="text-xs font-medium text-[var(--ak-color-text-primary)]">
            {initials}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === menuItems.length - 1;

              return (
                <div key={item.id}>
                  {isLast && index > 0 && (
                    <div className="h-px bg-[var(--ak-color-border-fine)] my-1" />
                  )}
                  <button
                    onClick={() => handleMenuItemClick(item.action)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ak-focus-ring',
                      item.variant === 'danger'
                        ? 'text-[var(--ak-color-danger)] hover:bg-[var(--ak-color-danger-soft)]'
                        : 'text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

