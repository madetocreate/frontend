'use client';

import { useState } from 'react';
import { SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useAutomationInsights } from './AutomationInsightsPanel';
import { AutomationSuggestionCard, AutomationRuleCard } from './AutomationSuggestionCard';
import { AkButton } from '@/components/ui/AkButton';
import { AkOverlay } from '@/components/ui/AkOverlay';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AutomationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'marketing' | 'service';
}

export function AutomationOverlay({ isOpen, onClose, context }: AutomationOverlayProps) {
  const {
    insights,
    rules,
    acceptInsight,
    dismissInsight,
    snoozeInsight,
    toggleRule,
    deleteRule,
    triggerAnalysis,
  } = useAutomationInsights();

  const [activeTab, setActiveTab] = useState<'suggestions' | 'rules'>('suggestions');

  // Filter logic (placeholder - in real app we'd filter by context in the API or here)
  const filteredInsights = insights; 
  const filteredRules = rules;

  return (
    <AkOverlay
      isOpen={isOpen}
      onClose={onClose}
      variant="panel"
      title={context === 'marketing' ? 'Marketing Automatisierung' : 'Service Automatisierung'}
    >
      <div className="flex flex-col h-full">
        <Tabs 
          defaultValue="suggestions" 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" />
              Vorschläge ({filteredInsights.length})
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <BoltIcon className="h-4 w-4" />
              Regeln ({filteredRules.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            {filteredInsights.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-[var(--ak-color-bg-surface-muted)] rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="h-8 w-8 text-[var(--ak-color-text-muted)]" />
                </div>
                <h3 className="text-base font-medium text-[var(--ak-color-text-primary)]">Keine Vorschläge</h3>
                <p className="text-sm text-[var(--ak-color-text-muted)] mt-1">Wir analysieren deine Aktivitäten laufend.</p>
                <div className="mt-6">
                  <AkButton onClick={() => triggerAnalysis()} size="sm" variant="secondary">
                    Jetzt analysieren
                  </AkButton>
                </div>
              </div>
            ) : (
              filteredInsights.map(insight => (
                <AutomationSuggestionCard
                  key={insight.id}
                  insight={insight}
                  onAccept={acceptInsight}
                  onDismiss={dismissInsight}
                  onSnooze={snoozeInsight}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            {filteredRules.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-[var(--ak-color-bg-surface-muted)] rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BoltIcon className="h-8 w-8 text-[var(--ak-color-text-muted)]" />
                </div>
                <h3 className="text-base font-medium text-[var(--ak-color-text-primary)]">Keine aktiven Regeln</h3>
                <p className="text-sm text-[var(--ak-color-text-muted)] mt-1">Aktiviere Vorschläge, um Regeln zu erstellen.</p>
              </div>
            ) : (
              filteredRules.map(rule => (
                <AutomationRuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={toggleRule}
                  onDelete={deleteRule}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AkOverlay>
  );
}
