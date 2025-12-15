"use client";

import { useState, useEffect, useCallback } from "react";
import { WidgetCard } from "./ui/WidgetCard";
import { AkButton } from "./ui/AkButton";

interface ApprovalRequest {
  approval_id: string;
  workflow_id: string;
  run_id: string;
  step_key: string;
  tool_name: string;
  action_description: string;
  input_data: Record<string, unknown>;
  status: "pending" | "approved" | "denied";
  requested_at: string;
  actor: string;
}

interface ApprovalQueueWidgetProps {
  tenantId?: string;
}

export function ApprovalQueueWidget({ tenantId = "demo-tenant" }: ApprovalQueueWidgetProps) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/approval-flows/queue?tenant_id=${tenantId}&status=pending`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch approvals");
      }
      const data = await response.json();
      setApprovals(data.queue || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchApprovals();
    // Poll every 5 seconds
    const interval = setInterval(fetchApprovals, 5000);
    return () => clearInterval(interval);
  }, [tenantId, fetchApprovals]);

  const handleApprove = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/approval-flows/${approvalId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId }),
      });
      if (!response.ok) {
        throw new Error("Failed to approve");
      }
      await fetchApprovals();
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleDeny = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/approval-flows/${approvalId}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId }),
      });
      if (!response.ok) {
        throw new Error("Failed to deny");
      }
      await fetchApprovals();
    } catch (err) {
      console.error("Failed to deny:", err);
    }
  };

  if (loading && approvals.length === 0) {
    return (
      <WidgetCard padding="sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[var(--ak-color-text-muted)]">Lade Freigaben...</div>
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard padding="sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[var(--ak-color-text-error)]">{error}</div>
        </div>
      </WidgetCard>
    );
  }

  if (approvals.length === 0) {
    return (
      <WidgetCard padding="sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-[var(--ak-color-text-muted)]">
            Keine ausstehenden Freigaben
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard padding="sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="ak-heading text-sm font-semibold">Freigaben ({approvals.length})</h3>
        <button
          onClick={fetchApprovals}
          className="text-xs text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
        >
          Aktualisieren
        </button>
      </div>

      <div className="space-y-3">
        {approvals.map((approval) => (
          <div
            key={approval.approval_id}
            className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                  {approval.tool_name}
                </div>
                <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
                  {approval.action_description || "Aktion erfordert Freigabe"}
                </div>
              </div>
              <div className="text-xs text-[var(--ak-color-text-muted)]">
                {new Date(approval.requested_at).toLocaleTimeString()}
              </div>
            </div>

            {approval.input_data && Object.keys(approval.input_data).length > 0 && (
              <div className="mt-2 p-2 bg-[var(--ak-color-bg-surface-muted)] rounded text-xs">
                <div className="font-medium mb-1">Details:</div>
                <pre className="text-[var(--ak-color-text-muted)] whitespace-pre-wrap break-words">
                  {JSON.stringify(approval.input_data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <AkButton
                onClick={() => handleApprove(approval.approval_id)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Genehmigen
              </AkButton>
              <AkButton
                onClick={() => handleDeny(approval.approval_id)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Ablehnen
              </AkButton>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

