'use client';

import { useState, useEffect } from 'react';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AkBadge } from '@/components/ui/AkBadge';
import { DocumentQAPanel } from './DocumentQAPanel';
import { getDocument } from '@/lib/api/documentsApi';
import type { Document } from './types';
import ReactMarkdown from 'react-markdown';

interface DocumentViewerProps {
  documentId: string | null;
  tenantId?: string;
  plan?: string;
  onClose?: () => void;
}

export function DocumentViewer({ documentId, tenantId, plan, onClose }: DocumentViewerProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId || !tenantId) {
      setDocument(null);
      setContent(null);
      return;
    }

    const loadDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const doc = await getDocument(documentId);
        setDocument(doc);

        // For demo docs, content is in metadata.content (reconstructed from chunks)
        // For real docs, content would be in content_base64 (needs decoding)
        if (doc.metadata && typeof doc.metadata === 'object' && 'content' in doc.metadata) {
          setContent(String(doc.metadata.content));
        } else if (doc.is_demo) {
          // Demo doc but no content in metadata - might be loading
          setContent('Dokumentinhalt wird geladen...');
        } else {
          // Real doc - would need to fetch content_base64 and decode
          setContent('Dokumentinhalt wird geladen...');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden des Dokuments');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId, tenantId]);

  if (!documentId) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <DocumentIcon className="w-16 h-16 text-[var(--ak-color-text-muted)] mx-auto mb-4" />
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Wähle ein Dokument aus, um es anzuzeigen.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--ak-semantic-error)] mb-2">
            Fehler
          </p>
          <p className="text-xs text-[var(--ak-color-text-secondary)]">
            {error || 'Dokument nicht gefunden'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--ak-color-border-fine)]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DocumentIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-[var(--ak-color-text-primary)] truncate">
                {document.filename || 'Unbenanntes Dokument'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {document.is_demo && (
                  <AkBadge tone="neutral" size="xs">
                    Demo
                  </AkBadge>
                )}
                {document.classification?.type && (
                  <span className="text-xs text-[var(--ak-color-text-muted)]">
                    {document.classification.type}
                  </span>
                )}
                {document.created_at && (
                  <span className="text-xs text-[var(--ak-color-text-muted)]">
                    • {new Date(document.created_at).toLocaleDateString('de-DE')}
                  </span>
                )}
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-surface-muted)] transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {content ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-sm text-[var(--ak-color-text-secondary)]">
              Dokumentinhalt wird geladen...
            </div>
          )}
        </div>
      </div>

      {/* Q&A Panel (only for demo docs) */}
      {document.is_demo && (
        <div className="w-96 border-l border-[var(--ak-color-border-fine)] flex flex-col">
          <DocumentQAPanel document={document} tenantId={tenantId} plan={plan} />
        </div>
      )}
    </div>
  );
}
