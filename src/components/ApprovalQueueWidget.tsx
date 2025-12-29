"use client";

import { useEffect, useState } from "react";
import { AkButton } from '@/components/ui/AkButton';
import { authedFetch } from '@/lib/api/authedFetch';

type ApprovalStatus = "pending" | "approved" | "denied";

interface ApprovalRequest {
  id: string;
  tenant_id: string;
  tool_name: string;
  parameters: Record<string, unknown>;
  status: ApprovalStatus;
  created_at: string;
  decided_at?: string;
  actor?: string | null;
  reason?: string | null;
  approval_token?: string | null;
  source?: string | null;
}

interface ApprovalQueueResponse {
  queue: ApprovalRequest[];
  total_count: number;
  pending_count: number;
}

interface ApprovalQueueWidgetProps {
  // tenantId prop removed - server extracts from JWT
}

export function ApprovalQueueWidget({}: ApprovalQueueWidgetProps) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authedFetch('/api/approval-flows/queue?status=pending');
      if (!response.ok) throw new Error("Failed to fetch approvals");
      const data: ApprovalQueueResponse = await response.json();
      setApprovals(data.queue || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      setError(null);
      const response = await authedFetch(`/api/approval-flows/${approvalId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Failed to approve");
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleDeny = async (approvalId: string) => {
    try {
      setError(null);
      const response = await authedFetch(`/api/approval-flows/${approvalId}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Failed to deny");
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-4 text-sm text-[var(--ak-color-text-muted)]">Loading approval queue...</div>;
  if (error) return <div className="p-4 text-sm text-[var(--ak-color-danger-strong)]">Error: {error}</div>;
  if (approvals.length === 0)
    return <div className="p-4 text-sm text-[var(--ak-color-text-muted)]">No pending approvals</div>;

  return (
    <div className="p-4 border border-[var(--ak-color-border-subtle)] rounded-[var(--ak-radius-lg)] bg-[var(--ak-color-bg-surface)] ak-shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-[var(--ak-color-text-primary)]">Pending Approvals</h3>
      <div className="space-y-3">
        {approvals.map((approval) => (
          <div key={approval.id} className="p-3 border border-[var(--ak-color-border-subtle)] rounded-[var(--ak-radius-md)] bg-[var(--ak-color-bg-surface-muted)]">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--ak-color-text-primary)] break-words">Tool: {approval.tool_name}</p>
                <p className="text-sm text-[var(--ak-color-text-secondary)]">
                  Requested: {new Date(approval.created_at).toLocaleString()}
                </p>
                {approval.reason ? (
                  <p className="text-sm text-[var(--ak-color-text-secondary)] break-words">Reason: {approval.reason}</p>
                ) : null}
                {approval.actor ? (
                  <p className="text-sm text-[var(--ak-color-text-secondary)] break-words">Actor: {approval.actor}</p>
                ) : null}
                {approval.source ? (
                  <p className="text-sm text-[var(--ak-color-text-secondary)] break-words">Source: {approval.source}</p>
                ) : null}
                <details className="mt-2 group">
                  <summary className="text-sm text-[var(--ak-color-text-secondary)] cursor-pointer hover:text-[var(--ak-color-text-primary)] transition-colors">Parameters</summary>
                  <pre className="mt-2 p-2 bg-[var(--ak-color-bg-surface)] rounded text-xs overflow-auto border border-[var(--ak-color-border-fine)]">
                    {JSON.stringify(approval.parameters, null, 2)}
                  </pre>
                </details>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <AkButton
                  onClick={() => handleApprove(approval.id)}
                  variant="primary"
                  className="!bg-[var(--ak-color-success)] !border-transparent hover:!opacity-90"
                  style={{ color: 'var(--ak-text-primary-dark)' }}
                >
                  Approve
                </AkButton>
                <AkButton
                  onClick={() => handleDeny(approval.id)}
                  variant="primary"
                  className="!bg-[var(--ak-color-danger-strong)] !border-transparent hover:!opacity-90"
                  style={{ color: 'var(--ak-text-primary-dark)' }}
                >
                  Deny
                </AkButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
