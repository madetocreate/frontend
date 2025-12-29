'use client';

import React from 'react';
import { CardRenderer } from '@/components/chat/cards/CardRenderer';
import { actionOutputV1ToCard } from '@/lib/actions/outputToCard';

export interface ActionResultCardRendererProps {
  card: Record<string, unknown>;
  actionId?: string;
  className?: string;
}

export function ActionResultCardRenderer({
  card,
  actionId,
  className,
}: ActionResultCardRendererProps) {
  const chatCard = actionOutputV1ToCard(card, actionId);

  if (!chatCard) {
    // Fallback: Zeige rohes JSON
    return (
      <div className={className}>
        <pre className="p-4 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] text-xs overflow-auto">
          {JSON.stringify(card, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className={className}>
      <CardRenderer card={chatCard} />
    </div>
  );
}

