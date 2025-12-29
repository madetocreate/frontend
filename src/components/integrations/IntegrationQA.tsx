"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

interface QAOverview {
  provider: string;
  lastSync: string | null;
  lastWebhook: string | null;
  lastIngest: string | null;
  needsReauth: boolean;
}

interface QARun {
  id: string;
  provider: string;
  sync_name: string;
  status: string;
  attempt: number;
  started_at: string | null;
  finished_at: string | null;
  last_error_code: string | null;
  correlation_id: string | null;
}

interface IntegrationQAProps {
  tenantId: string;
}

export function IntegrationQA({ tenantId }: IntegrationQAProps) {
  const [overview, setOverview] = useState<QAOverview[]>([]);
  const [runs, setRuns] = useState<QARun[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "runs" | "errors">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, [tenantId]);

  useEffect(() => {
    if (activeTab === "runs" && selectedProvider) {
      loadRuns(selectedProvider);
    }
  }, [activeTab, selectedProvider, tenantId]);

  const loadOverview = async () => {
    try {
      const res = await fetch(`/api/integrations/qa/overview?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data.overview || []);
      }
    } catch (err) {
      console.error("Failed to load QA overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async (provider: string) => {
    try {
      const res = await fetch(
        `/api/integrations/qa/runs?tenantId=${tenantId}&provider=${provider}`
      );
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error("Failed to load runs:", err);
    }
  };

  const copyCorrelationId = (correlationId: string) => {
    navigator.clipboard.writeText(correlationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ak-color-border-subtle)] border-t-[var(--ak-color-accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--ak-color-text-primary)]">
          Integration QA
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm rounded ${
              activeTab === "overview"
                ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]"
                : "border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-surface-muted)]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("runs")}
            className={`px-4 py-2 text-sm rounded ${
              activeTab === "runs"
                ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]"
                : "border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-surface-muted)]"
            }`}
          >
            Runs
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`px-4 py-2 text-sm rounded ${
              activeTab === "errors"
                ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]"
                : "border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-surface-muted)]"
            }`}
          >
            Errors
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-3">
          {overview.map((item) => (
            <div
              key={item.provider}
              className="p-4 border border-[var(--ak-color-border-subtle)] rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-[var(--ak-color-text-primary)]">
                  {item.provider}
                </h3>
                {item.needsReauth && (
                  <span className="px-2 py-1 text-xs ak-badge-warning rounded">
                    Reauth benötigt
                  </span>
                )}
              </div>
              <div className="text-sm text-[var(--ak-color-text-secondary)] space-y-1">
                <div>Last Sync: {item.lastSync ? new Date(item.lastSync).toLocaleString() : "Never"}</div>
                <div>Last Webhook: {item.lastWebhook ? new Date(item.lastWebhook).toLocaleString() : "Never"}</div>
                <div>Last Ingest: {item.lastIngest ? new Date(item.lastIngest).toLocaleString() : "Never"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "runs" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedProvider || ""}
              onChange={(e) => setSelectedProvider(e.target.value || null)}
              className="px-3 py-2 border border-[var(--ak-color-border-subtle)] rounded bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)]"
            >
              <option value="">All Providers</option>
              {overview.map((item) => (
                <option key={item.provider} value={item.provider}>
                  {item.provider}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                className="p-3 border border-[var(--ak-color-border-subtle)] rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--ak-color-text-primary)]">
                      {run.provider} / {run.sync_name}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        run.status === "success"
                          ? "ak-badge-success"
                          : run.status === "failed"
                            ? "ak-badge-danger"
                            : "ak-badge-muted"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  {run.correlation_id && (
                    <button
                      onClick={() => copyCorrelationId(run.correlation_id!)}
                      className="flex items-center gap-1 text-xs text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                      title="Copy correlation ID"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      {run.correlation_id.substring(0, 8)}...
                    </button>
                  )}
                </div>
                <div className="text-xs text-[var(--ak-color-text-secondary)] space-y-1">
                  <div>Attempt: {run.attempt}</div>
                  {run.started_at && (
                    <div>Started: {new Date(run.started_at).toLocaleString()}</div>
                  )}
                  {run.finished_at && (
                    <div>Finished: {new Date(run.finished_at).toLocaleString()}</div>
                  )}
                  {run.last_error_code && (
                    <div className="ak-text-danger">Error: {run.last_error_code}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "errors" && (
        <div className="p-4 border border-[var(--ak-color-border-subtle)] rounded-lg text-center text-[var(--ak-color-text-secondary)]">
          Error view - Coming soon
        </div>
      )}
    </div>
  );
}

