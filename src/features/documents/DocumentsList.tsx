'use client';

import { useState, useEffect } from 'react';
import { DocumentIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { AkBadge } from '@/components/ui/AkBadge';
import { AkButton } from '@/components/ui/AkButton';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { ensureDemoDocs } from '@/lib/api/demoApi';
import { getDocuments } from '@/lib/api/documentsApi';
import type { Document } from './types';

interface DocumentsListProps {
  tenantId?: string;
  onSelectDocument: (doc: Document) => void;
  selectedDocumentId?: string;
}

export function DocumentsList({ tenantId, onSelectDocument, selectedDocumentId }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoSeeding, setDemoSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-seed demo docs on mount if tenantId is available
  useEffect(() => {
    if (!tenantId || demoSeeding) return;

    const seedDemo = async () => {
      setDemoSeeding(true);
      try {
        const result = await ensureDemoDocs(tenantId);
        if (result.ok && result.docs_created > 0) {
          // Reload documents
          loadDocuments();
        }
      } catch (err) {
        console.error('Failed to seed demo docs:', err);
      } finally {
        setDemoSeeding(false);
      }
    };

    seedDemo();
  }, [tenantId]);

  const loadDocuments = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);
    try {
      const docs = await getDocuments(tenantId, true);
      // Filter out deleted docs
      const activeDocs = docs.filter(doc => !doc.deleted_at);
      setDocuments(activeDocs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadDocuments();
    }
  }, [tenantId]);

  if (loading || demoSeeding) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        <span className="ml-4 text-sm text-[var(--ak-color-text-secondary)]">
          {demoSeeding ? 'Demo-Dokumente werden geladen...' : 'Dokumente werden geladen...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AkEmptyState
          title="Fehler beim Laden"
          description={error}
          action={{
            label: 'Erneut versuchen',
            onClick: loadDocuments,
          }}
        />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-6">
        <AkEmptyState
          icon={<DocumentIcon />}
          title="Noch keine Dokumente"
          description="Lade dein erstes Dokument hoch oder nutze die Demo-Dokumente zum Testen."
        />
        {tenantId && (
          <div className="mt-4">
            <AkButton
              variant="primary"
              size="sm"
              onClick={() => {
                // Trigger demo seed
                ensureDemoDocs(tenantId).then(() => loadDocuments());
              }}
            >
              Demo-Dokumente laden
            </AkButton>
          </div>
        )}
      </div>
    );
  }

  const demoDocs = documents.filter(doc => doc.is_demo);
  const realDocs = documents.filter(doc => !doc.is_demo);

  return (
    <div className="space-y-4">
      {/* Banner: Demo Docs Info */}
      {demoDocs.length > 0 && realDocs.length === 0 && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)]">
          <div className="flex items-start gap-3">
            <DocumentIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">
                Demo-Dokumente
              </h3>
              <p className="text-xs text-[var(--ak-color-text-secondary)] mb-3">
                Diese Dokumente sind Beispiele zum Testen. Lade dein erstes echtes Dokument hoch, um die Demo-Dokumente zu entfernen.
              </p>
              <AkButton
                variant="secondary"
                size="xs"
                onClick={() => {
                  // TODO: Open upload modal or navigate to upload
                  console.log('Upload clicked');
                }}
              >
                Erstes Dokument hochladen
              </AkButton>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-2 px-4">
        {documents.map((doc) => {
          const isSelected = doc.id === selectedDocumentId;
          const docType = doc.classification?.type || 'document';
          const docTitle = doc.filename || 'Unbenanntes Dokument';

          return (
            <button
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-accent)] shadow-sm'
                  : 'bg-[var(--ak-color-bg-surface-muted)] border-[var(--ak-color-border-fine)] hover:border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-surface)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-bg-surface)] flex items-center justify-center flex-shrink-0">
                  <DocumentIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--ak-color-text-primary)] truncate">
                      {docTitle}
                    </span>
                    {doc.is_demo && (
                      <AkBadge tone="neutral" size="xs">
                        Demo
                      </AkBadge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-muted)]">
                    <span>{docType}</span>
                    {doc.created_at && (
                      <>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString('de-DE')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
