'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getWorkspaceByPath } from './workspaces';
import { usePathname } from 'next/navigation';
import { NotificationsDropdown } from './NotificationsDropdown';
import { AvatarMenu } from './AvatarMenu';
import { CommandPalette, type Command } from '@/components/CommandPalette';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  BoltIcon,
  UserGroupIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { AkButton } from '@/components/ui/AkButton';
import { ACTION_REGISTRY } from '@/lib/actions/registry';
import { dispatchActionStart } from '@/lib/actions/dispatch';
import { filterActionsForCommandPalette } from '@/lib/actions/filter';
import { useIsMarketingVisible } from '@/lib/featureAccess';

export function WorkspaceHeaderV2() {
  const pathname = usePathname();
  const router = useRouter();
  const isMarketingVisible = useIsMarketingVisible();
  const workspace = getWorkspaceByPath(pathname);
  const title = workspace?.label || 'Workspace';
  const isChat = workspace?.id === 'chat';
  const isMarketing = workspace?.id === 'marketing';
  const isService = workspace?.id === 'serviceHub';
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const handleNewChat = () => {
    window.dispatchEvent(new CustomEvent('aklow-keyboard-new-chat'));
  };

  const handleMarketingCopilot = () => {
    window.dispatchEvent(new CustomEvent('aklow-marketing-open-copilot'));
  };

  const handleMarketingAutomation = () => {
    window.dispatchEvent(new CustomEvent('aklow-marketing-open-automation'));
  };

  const handleServiceCopilot = () => {
    window.dispatchEvent(new CustomEvent('aklow-service-open-copilot'));
  };

  const handleServiceAutomation = () => {
    window.dispatchEvent(new CustomEvent('aklow-service-open-automation'));
  };

  // Single source of truth: listen to centralized command palette events
  useEffect(() => {
    const onToggle = () => setIsCommandPaletteOpen((prev) => !prev)
    const onOpen = () => setIsCommandPaletteOpen(true)
    const onClose = () => setIsCommandPaletteOpen(false)

    window.addEventListener('aklow-toggle-command-palette', onToggle)
    window.addEventListener('aklow-open-command-palette', onOpen)
    window.addEventListener('aklow-close-command-palette', onClose)
    return () => {
      window.removeEventListener('aklow-toggle-command-palette', onToggle)
      window.removeEventListener('aklow-open-command-palette', onOpen)
      window.removeEventListener('aklow-close-command-palette', onClose)
    }
  }, []);

  // Build commands for Command Palette
  const commands = useMemo<Command[]>(() => {
    const baseCommands: Command[] = [
      // Navigation
      {
        id: 'nav-inbox',
        label: 'Inbox',
        description: 'Zum Posteingang navigieren',
        category: 'navigation',
        action: () => router.push('/inbox'),
        keywords: ['posteingang', 'inbox', 'emails'],
      },
      {
        id: 'nav-docs',
        label: 'Docs',
        description: 'Zu Dokumenten navigieren',
        category: 'navigation',
        action: () => router.push('/docs'),
        keywords: ['dokumente', 'docs', 'files'],
      },
      {
        id: 'nav-chat',
        label: 'Chat',
        description: 'Zum Chat navigieren',
        category: 'navigation',
        action: () => router.push('/chat'),
        keywords: ['chat', 'konversation'],
      },
      {
        id: 'nav-settings',
        label: 'Settings',
        description: 'Zu Einstellungen navigieren',
        category: 'navigation',
        action: () => router.push('/settings'),
        keywords: ['einstellungen', 'settings', 'config'],
      },

      // --- SERVICE HUB ---
      {
        id: 'nav-service',
        label: 'Service Hub',
        description: 'Zum Service Dashboard',
        category: 'navigation',
        action: () => router.push('/service-hub'),
        keywords: ['service', 'support', 'hub', 'kunden'],
      },
      {
        id: 'action-new-customer',
        label: 'Neuer Kunde',
        description: 'Einen neuen Kundenkontakt anlegen',
        category: 'action',
        action: () => router.push('/customers?action=new'),
        keywords: ['kunde', 'neu', 'kontakt', 'erstellen'],
      },
      {
        id: 'nav-telephony',
        label: 'Telefonzentrale',
        description: 'Anrufe und Voicemails verwalten',
        category: 'navigation',
        action: () => router.push('/service-hub?area=telephony'),
        keywords: ['telefon', 'anrufe', 'voicemail'],
      },
      {
        id: 'nav-reviews',
        label: 'Bewertungen',
        description: 'Kundenfeedback ansehen',
        category: 'navigation',
        action: () => router.push('/service-hub?area=reviews'),
        keywords: ['reviews', 'bewertungen', 'feedback', 'sterne'],
      },

      // General Actions
      {
        id: 'action-new-chat',
        label: 'Neuer Chat',
        description: 'Neue Konversation starten',
        category: 'action',
        action: () => router.push('/chat'),
        keywords: ['chat', 'neu', 'konversation'],
      },
    ];

    // Workflows from ACTION_REGISTRY (filtered to exclude marketing/growth/reviews)
    const workflowCommands: Command[] = filterActionsForCommandPalette(
      Object.values(ACTION_REGISTRY)
    )
      .map(action => {
        const prefix = action.id.split('.')[0];
        
        // Mapping of internal modules to command palette categories
        const categoryMap: Record<string, Command['category']> = {
          'inbox': 'inbox',
          'customers': 'customers',
          'crm': 'customers',
          'documents': 'docs',
          'automation': 'automation',
          'telephony': 'customers', // Telephony often linked to CRM
          'calendar': 'action',
          'storage': 'docs',
        };

        // Icon Mapping
        const iconMap: Record<string, any> = {
          'inbox': SparklesIcon,
          'customers': UserGroupIcon,
          'docs': DocumentIcon,
          'automation': BoltIcon,
        };

        const category = categoryMap[prefix] || 'action';
        const Icon = iconMap[category] || SparklesIcon;

        return {
          id: `workflow-${action.id}`,
          label: action.label,
          description: action.description || `KI-Workflow: ${action.label}`,
          category,
          icon: Icon,
          keywords: [action.label, prefix, 'ai', 'ki', 'workflow', action.id],
          action: () => {
            dispatchActionStart(
              action.id,
              { 
                module: prefix as any,
                target: { type: prefix as any, id: 'global' } // Global context for palette trigger
              },
              {},
              'CommandPalette'
            );
          },
        };
      });

    return [...baseCommands, ...workflowCommands];
  }, [router, pathname, isMarketingVisible]);

  const handleInputClick = () => {
    setIsCommandPaletteOpen(true);
  };

  return (
    <>
      <header className="h-14 bg-[var(--ak-color-bg-surface)] flex items-center px-6 z-30 border-b border-[var(--ak-color-border-fine)]">
        <div className="flex-1 flex items-center gap-4">
          {/* Workspace Title */}
          <h1 className="text-base font-bold text-[var(--ak-color-text-primary)]">
            {title}
          </h1>

          {/* Command Bar */}
          <div className="flex-1 max-w-md ml-4">
            <input
              type="text"
              placeholder="Was möchtest du erledigen?"
              onClick={handleInputClick}
              readOnly
              className="w-full h-9 px-4 rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/30 text-[13px] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus-visible:outline-none focus-visible:border-[var(--ak-color-border-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent-soft)] transition-all cursor-text font-medium"
            />
          </div>
        </div>

        {/* Right Cluster: Glocke + Avatar */}
        <div className="flex items-center gap-3">
          {/* Marketing Actions */}
          {isMarketing && isMarketingVisible && (
            <div className="flex items-center gap-2 mr-2">
              <AkButton
                variant="ghost"
                size="sm"
                accent="graphite"
                onClick={handleMarketingCopilot}
                leftIcon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
                className="ak-text-secondary hover:ak-text-primary"
              >
                Hub Copilot
              </AkButton>
              <AkButton
                variant="secondary"
                accent="marketing"
                size="sm"
                onClick={handleMarketingAutomation}
                leftIcon={<SparklesIcon className="h-4 w-4" />}
                className="shadow-sm"
              >
                Automatisieren
              </AkButton>
            </div>
          )}

          {/* Service Actions */}
          {isService && (
            <div className="flex items-center gap-2 mr-2">
              <AkButton
                variant="ghost"
                size="sm"
                accent="graphite"
                onClick={handleServiceCopilot}
                leftIcon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
                className="ak-text-secondary hover:ak-text-primary"
              >
                Hub Copilot
              </AkButton>
              <AkButton
                variant="secondary"
                accent="customers"
                size="sm"
                onClick={handleServiceAutomation}
                leftIcon={<SparklesIcon className="h-4 w-4" />}
                className="shadow-sm"
              >
                Automatisieren
              </AkButton>
            </div>
          )}

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Avatar Menu */}
          <AvatarMenu />
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
    </>
  );
}
