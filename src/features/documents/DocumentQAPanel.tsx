'use client';

import { useState } from 'react';
import { ChatBubbleLeftRightIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AkButton } from '@/components/ui/AkButton';
import { AkBadge } from '@/components/ui/AkBadge';
import { askDocumentQuestion } from '@/lib/api/documentsApi';
import type { Document, DocumentQAResponse } from './types';

interface DocumentQAPanelProps {
  document: Document;
  tenantId?: string;
  plan?: string;
}

export function DocumentQAPanel({ document, tenantId, plan = 'free' }: DocumentQAPanelProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<DocumentQAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);

  // Only show Q&A for demo documents
  if (!document.is_demo) {
    return (
      <div className="p-4 text-sm text-[var(--ak-color-text-secondary)]">
        Q&A ist nur für Demo-Dokumente verfügbar.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantId || !question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await askDocumentQuestion(tenantId, {
        document_id: document.id,
        question: question.trim(),
        plan,
      });

      setAnswer(response);
      setQuotaRemaining(response.quota_remaining);
      setQuestion(''); // Clear input after successful question
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Stellen der Frage');
      if (err instanceof Error && err.message.includes('Tageslimit')) {
        setQuotaRemaining(0);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--ak-color-border-fine)]">
        <div className="flex items-center gap-2 mb-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
          <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
            Fragen zum Dokument
          </h3>
        </div>
        {quotaRemaining !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--ak-color-text-secondary)]">
              Fragen übrig heute:
            </span>
            <AkBadge
              tone={quotaRemaining > 3 ? 'neutral' : quotaRemaining > 0 ? 'warning' : 'error'}
              size="xs"
            >
              {quotaRemaining}/10
            </AkBadge>
          </div>
        )}
      </div>

      {/* Question Input */}
      <div className="p-4 border-b border-[var(--ak-color-border-fine)]">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Stelle eine Frage zum Dokument..."
            disabled={loading || (quotaRemaining !== null && quotaRemaining === 0)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] resize-none"
            rows={3}
          />
          <AkButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading || !question.trim() || (quotaRemaining !== null && quotaRemaining === 0)}
            leftIcon={<SparklesIcon className="w-4 h-4" />}
            className="w-full"
          >
            {loading ? 'Frage wird gestellt...' : 'Frage stellen'}
          </AkButton>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 border-b border-[var(--ak-color-border-fine)]">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--ak-semantic-error-soft)] border border-[var(--ak-semantic-error)]/20">
            <ExclamationTriangleIcon className="w-5 h-5 text-[var(--ak-semantic-error)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--ak-semantic-error)] mb-1">
                Fehler
              </p>
              <p className="text-xs text-[var(--ak-semantic-error)]/80">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Answer Display */}
      {answer && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
              <span className="text-xs font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wide">
                Antwort
              </span>
              {answer.cached && (
                <AkBadge tone="neutral" size="xs">
                  Gecacht
                </AkBadge>
              )}
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-[var(--ak-color-text-primary)] whitespace-pre-wrap">
                {answer.answer}
              </div>
            </div>
          </div>

          {/* Citations */}
          {answer.citations && answer.citations.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-[var(--ak-color-border-fine)]">
              <span className="text-xs font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wide">
                Fundstellen
              </span>
              <div className="space-y-1">
                {answer.citations.map((citation, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-[var(--ak-color-text-muted)] px-2 py-1 rounded bg-[var(--ak-color-bg-surface-muted)]"
                  >
                    {citation.section_title || `Abschnitt ${citation.chunk_order + 1}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Info */}
          <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
            <div className="text-xs text-[var(--ak-color-text-muted)]">
              Modell: {answer.model_used}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!answer && !error && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-[var(--ak-color-text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
              Stelle eine Frage zum Dokument, um eine Antwort zu erhalten.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
