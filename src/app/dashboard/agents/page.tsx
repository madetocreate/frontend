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
      const response = await fetch("/api/agent-monitoring/metrics?hours=24");
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
        <div className="text-center py-12 text-red-500">
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
                      <div className="text-2xl font-bold text-red-500">
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
      </Tabs>
    </div>
  );
}

