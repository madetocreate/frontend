"use client";

import { useState } from "react";
import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface WriteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  summary: {
    method: string;
    endpoint: string;
    bodyKeys?: string[];
    bodySize?: number;
  };
  action: string;
}

export function WriteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  summary,
  action,
}: WriteConfirmationDialogProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--ak-color-bg-surface)] rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-[var(--ak-semantic-warning)]" />
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Write-Operation bestätigen
          </h3>
        </div>

        <div className="space-y-2 text-sm text-[var(--ak-color-text-secondary)]">
          <p>
            Sie sind dabei, eine <strong>{action}</strong> Operation auszuführen:
          </p>
          <div className="bg-[var(--ak-color-bg-surface-muted)] rounded p-3 space-y-1">
            <div>
              <strong>Method:</strong> {summary.method}
            </div>
            <div>
              <strong>Endpoint:</strong> {summary.endpoint}
            </div>
            {summary.bodyKeys && summary.bodyKeys.length > 0 && (
              <div>
                <strong>Body Keys:</strong> {summary.bodyKeys.join(", ")}
              </div>
            )}
            {summary.bodySize && (
              <div>
                <strong>Body Size:</strong> {summary.bodySize} bytes
              </div>
            )}
          </div>
          <p className="text-[var(--ak-semantic-warning-strong)]">
            Diese Aktion wird Daten im externen System ändern. Bitte bestätigen Sie die Operation.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[var(--ak-semantic-danger-soft)] rounded text-[var(--ak-semantic-danger)] text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={confirming}
            className="px-4 py-2 text-sm border border-[var(--ak-color-border-subtle)] rounded hover:bg-[var(--ak-color-bg-surface-muted)] transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="px-4 py-2 text-sm bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {confirming ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--ak-color-text-inverted)] border-t-transparent" />
                Bestätigen...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Bestätigen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

