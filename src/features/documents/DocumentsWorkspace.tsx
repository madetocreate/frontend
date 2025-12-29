'use client';

import { useState } from 'react';
import { DocumentsList } from './DocumentsList';
import { DocumentViewer } from './DocumentViewer';
import type { Document } from './types';

interface DocumentsWorkspaceProps {
  tenantId?: string;
  plan?: string;
}

export function DocumentsWorkspace({ tenantId, plan = 'free' }: DocumentsWorkspaceProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocumentId(doc.id);
  };

  const handleCloseViewer = () => {
    setSelectedDocumentId(null);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar: Documents List */}
      <div className="w-80 border-r border-[var(--ak-color-border-fine)] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <DocumentsList
            tenantId={tenantId}
            onSelectDocument={handleSelectDocument}
            selectedDocumentId={selectedDocumentId}
          />
        </div>
      </div>

      {/* Main: Document Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DocumentViewer
          documentId={selectedDocumentId}
          tenantId={tenantId}
          plan={plan}
          onClose={handleCloseViewer}
        />
      </div>
    </div>
  );
}
