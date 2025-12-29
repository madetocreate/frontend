'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold';
import { AkIconButton } from '@/components/ui/AkIconButton';
import { useAklowEscape } from '@/hooks/useAklowEscape';
import clsx from 'clsx';

interface SidebarFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  children: ReactNode;
  title?: string;
  isApplyDisabled?: boolean;
}

export function SidebarFilterOverlay({
  isOpen,
  onClose,
  onApply,
  children,
  title = 'Filter',
  isApplyDisabled = false,
}: SidebarFilterOverlayProps) {
  useAklowEscape({ enabled: isOpen, onEscape: onClose });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" aria-label="Filter Drawer">
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label="Schließen"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={clsx(
              'absolute right-3 top-3 bottom-3 w-[360px] max-w-[92vw]',
              'overflow-hidden rounded-2xl',
              'border border-[var(--ak-color-border-subtle)]',
              'bg-[var(--ak-color-bg-sidebar)]',
              'ak-shadow-strong'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AkDrawerScaffold
              title={title}
              trailing={
                <AkIconButton onClick={onClose} aria-label="Schließen">
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </AkIconButton>
              }
              footer={
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-xl text-[13px] font-semibold text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-all duration-200 ak-button-interactive"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={onApply}
                    disabled={isApplyDisabled}
                    className={clsx(
                      'flex-1 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ak-button-interactive shadow-sm',
                      isApplyDisabled
                        ? 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] cursor-not-allowed'
                        : 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-accent-strong)]'
                    )}
                  >
                    Anwenden
                  </button>
                </div>
              }
              bodyClassName="ak-scrollbar p-4"
            >
              {children}
            </AkDrawerScaffold>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

