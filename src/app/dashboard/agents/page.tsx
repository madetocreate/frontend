/**
 * Agent Performance Monitoring Dashboard
 */

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AgentMetrics {
  agent_name: string;
  tenant_id?: string;
  total_executions: number;
  success_count: number;
  failure_count: number;
  success_rate: number;
  avg_execution_time_ms: number;
  p50_execution_time_ms: number;
  p95_execution_time_ms: number;
  p99_execution_time_ms: number;
  last_execution?: string;
  error_rate: number;
}

interface AgentMetricsResponse {
  agents: AgentMetrics[];
  total_agents: number;
}

export default function AgentMonitoringDashboard() {
  const [metrics, setMetrics] = useState<AgentMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch("/api/agent-monitoring/metrics?hours=24");
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Agent Performance Dashboard</h1>
        <div className="text-center py-12">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Agent Performance Dashboard</h1>
        <div className="text-center py-12 text-[var(--ak-semantic-danger)]">
          Error: {error}
        </div>
      </div>
    );
  }

  const agents = metrics?.agents || [];
  const totalExecutions = agents.reduce((sum, a) => sum + (a.total_executions || 0), 0);

  const toPercent = (value: number | undefined) => {
    if (value === undefined || Number.isNaN(value)) return 0;
    return value > 1 ? value : value * 100;
  };
  const avgSuccessRate =
    agents.length > 0
      ? (() => {
          const sum = agents.reduce((acc, a) => {
            const rate = a.success_rate > 1 ? a.success_rate : a.success_rate * 100;
            return acc + rate;
          }, 0);
          return sum / agents.length;
        })()
      : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Agent Performance Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor agent execution metrics and performance
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.total_agents || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Executions (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalExecutions}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgSuccessRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Execution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents.length > 0
                    ? Math.round(
                        agents.reduce(
                          (sum, a) => sum + a.avg_execution_time_ms,
                          0
                        ) / agents.length
                      )
                    : 0}
                  ms
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Summary</CardTitle>
              <CardDescription>
                Overview of all agents in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No agent metrics available
                  </div>
                ) : (
                  agents.map((agent) => (
                    <div
                      key={agent.agent_name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{agent.agent_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {agent.total_executions} executions
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Success Rate
                          </div>
                          <div className="font-semibold">
                          {toPercent(agent.success_rate).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Avg Time
                          </div>
                          <div className="font-semibold">
                            {Math.round(agent.avg_execution_time_ms)}ms
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No detailed metrics available
              </CardContent>
            </Card>
          ) : (
            agents.map((agent) => (
              <Card key={agent.agent_name}>
                <CardHeader>
                  <CardTitle>{agent.agent_name}</CardTitle>
                  <CardDescription>Detailed performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Total Executions
                      </div>
                      <div className="text-2xl font-bold">
                        {agent.total_executions}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Success Rate
                      </div>
                      <div className="text-2xl font-bold">
                        {(agent.success_rate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Error Rate
                      </div>
                      <div className="text-2xl font-bold text-[var(--ak-semantic-danger)]">
                          {toPercent(agent.error_rate).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Avg Execution Time
                      </div>
                      <div className="text-2xl font-bold">
                        {Math.round(agent.avg_execution_time_ms)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">P50</div>
                      <div className="text-xl font-semibold">
                        {Math.round(agent.p50_execution_time_ms)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">P95</div>
                      <div className="text-xl font-semibold">
                        {Math.round(agent.p95_execution_time_ms)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">P99</div>
                      <div className="text-xl font-semibold">
                        {Math.round(agent.p99_execution_time_ms)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Last Execution
                      </div>
                      <div className="text-sm">
                        {agent.last_execution
                          ? new Date(agent.last_execution).toLocaleString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <RunsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Runs Tab Component
function RunsTab() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runDetail, setRunDetail] = useState<RunDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchRuns();
    // Refresh every 10 seconds
    const interval = setInterval(fetchRuns, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedRunId) {
      fetchRunDetail(selectedRunId);
    } else {
      setRunDetail(null);
    }
  }, [selectedRunId]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch("/api/runs?limit=50");
      if (!response.ok) {
        throw new Error("Failed to fetch runs");
      }
      const data = await response.json();
      setRuns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRunDetail = async (runId: string) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/api/runs/${runId}?event_limit=100`);
      if (!response.ok) {
        throw new Error("Failed to fetch run details");
      }
      const data = await response.json();
      setRunDetail(data);
    } catch (err) {
      console.error("Failed to fetch run detail:", err);
      setRunDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "ak-badge-success";
      case "failed":
        return "ak-badge-danger";
      case "running":
        return "ak-badge-info";
      case "cancelled":
        return "ak-badge-muted";
      default:
        return "ak-badge-muted";
    }
  };

  const formatDuration = (ms: number | null | undefined) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const shortId = (id: string | null | undefined) => {
    if (!id) return "-";
    return id.substring(0, 8);
  };

  if (loading && runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">Loading runs...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-[var(--ak-semantic-danger)]">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Runs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>
            {runs.length} runs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {runs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No runs found
              </div>
            ) : (
              runs.map((run) => (
                <div
                  key={run.run_id}
                  onClick={() => setSelectedRunId(run.run_id)}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-colors
                    ${selectedRunId === run.run_id
                      ? "bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-border-strong)]"
                      : "hover:bg-[var(--ak-color-bg-hover)]"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {shortId(run.run_id)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${getStatusBadgeColor(
                          run.status
                        )}`}
                      >
                        {run.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(run.started_at)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {run.workflow_name || "Unknown workflow"}
                  </div>
                  {run.correlation_id && (
                    <div className="text-xs text-muted-foreground mt-1">
                      CID: {shortId(run.correlation_id)}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Duration: {formatDuration(run.execution_time_ms)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Run Detail Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Run Details</CardTitle>
          <CardDescription>
            {selectedRunId ? `Run ${shortId(selectedRunId)}` : "Select a run to view details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedRunId ? (
            <div className="text-center py-12 text-muted-foreground">
              Select a run from the list to view details
            </div>
          ) : detailLoading ? (
            <div className="text-center py-12">Loading details...</div>
          ) : runDetail ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Run Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${getStatusBadgeColor(
                      runDetail.status
                    )}`}
                  >
                    {runDetail.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Workflow:</span>
                  <span className="text-sm">{runDetail.workflow_name || "-"}</span>
                </div>
                {runDetail.correlation_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Correlation ID:</span>
                    <span className="text-xs font-mono">{runDetail.correlation_id}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Started:</span>
                  <span className="text-sm">{formatDate(runDetail.started_at)}</span>
                </div>
                {runDetail.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed:</span>
                    <span className="text-sm">{formatDate(runDetail.completed_at)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm">{formatDuration(runDetail.execution_time_ms)}</span>
                </div>
              </div>

              {/* Error Message */}
              {runDetail.error_message && (
                <div className="p-3 ak-alert-danger rounded-lg">
                  <div className="text-sm font-medium mb-1">Error:</div>
                  <div className="text-sm">{runDetail.error_message}</div>
                </div>
              )}

              {/* Events Timeline */}
              <div>
                <div className="text-sm font-medium mb-2">Events ({runDetail.events.length})</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {runDetail.events.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No events</div>
                  ) : (
                    runDetail.events.map((event, idx) => (
                      <div
                        key={event.id || idx}
                        className="p-2 border rounded text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.level}</span>
                          <span className="text-muted-foreground">
                            {event.ts ? new Date(event.ts).toLocaleTimeString() : "-"}
                          </span>
                        </div>
                        <div className="text-muted-foreground">{event.message}</div>
                        {event.payload && Object.keys(event.payload).length > 0 && (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-muted-foreground">
                              Payload
                            </summary>
                            <pre className="mt-1 p-2 bg-[var(--ak-color-bg-surface-muted)] rounded text-xs overflow-x-auto text-[var(--ak-color-text-primary)]">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Failed to load run details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface RunSummary {
  run_id: string;
  workflow_id?: string | null;
  tenant_id: string;
  session_id?: string | null;
  status: string;
  correlation_id?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  execution_time_ms?: number | null;
  last_event_ts?: string | null;
  workflow_name?: string | null;
}

interface RunDetail {
  run_id: string;
  workflow_id?: string | null;
  tenant_id: string;
  session_id?: string | null;
  status: string;
  correlation_id?: string | null;
  input_data?: Record<string, any> | null;
  output_data?: Record<string, any> | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  execution_time_ms?: number | null;
  temporal_workflow_id?: string | null;
  workflow_name?: string | null;
  events: Array<{
    id: string;
    ts?: string | null;
    level: string;
    message: string;
    payload?: Record<string, any>;
    correlation_id?: string | null;
  }>;
}

