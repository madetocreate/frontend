'use client';

import { ActionTemplate } from './types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface TemplateFlowStubProps {
  template: ActionTemplate;
  onBack: () => void;
}

export function TemplateFlowStub({ template, onBack }: TemplateFlowStubProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
          aria-label="Zur Übersicht"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-medium text-[var(--ak-color-text-primary)]">
          Zur Übersicht
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Template Info */}
        <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]">
          <h2 className="text-base font-medium text-[var(--ak-color-text-primary)] mb-2">
            {template.title}
          </h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            {template.description}
          </p>
        </div>

        {/* Placeholder Steps */}
        <div className="space-y-4">
          <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] flex items-center justify-center text-xs font-medium">
                1
              </div>
              <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                Schritt 1: Ziel definieren
              </h3>
            </div>
            <p className="text-sm text-[var(--ak-color-text-muted)] ml-9">
              (V1) Flow kommt als nächste Stufe
            </p>
          </div>

          <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] flex items-center justify-center text-xs font-medium">
                2
              </div>
              <h3 className="text-sm font-medium text-[var(--ak-color-text-muted)]">
                Schritt 2: Kanal wählen
              </h3>
            </div>
            <p className="text-sm text-[var(--ak-color-text-muted)] ml-9">
              (V1) Flow kommt als nächste Stufe
            </p>
          </div>

          <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] flex items-center justify-center text-xs font-medium">
                3
              </div>
              <h3 className="text-sm font-medium text-[var(--ak-color-text-muted)]">
                Schritt 3: Output konfigurieren
              </h3>
            </div>
            <p className="text-sm text-[var(--ak-color-text-muted)] ml-9">
              (V1) Flow kommt als nächste Stufe
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-[var(--ak-color-border-fine)]">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg text-sm text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-button-interactive"
          >
            Abbrechen
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] opacity-50 cursor-not-allowed"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}

