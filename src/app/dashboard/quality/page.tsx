"use client";

import { useState, useEffect } from "react";
import { WidgetCard } from "@/components/ui/WidgetCard";

interface FeedbackMetrics {
  total: number;
  positive: number;
  negative: number;
  positive_rate: number;
  negative_rate: number;
  recent_positive: number;
  recent_negative: number;
}

export default function QualityDashboardPage() {
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId] = useState("demo-tenant");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/feedback/metrics?tenant_id=${tenantId}`);
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

    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm text-[var(--ak-color-text-muted)]">Lade Metriken...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm text-[var(--ak-color-text-error)]">{error}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm text-[var(--ak-color-text-muted)]">Keine Daten verfügbar</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="ak-heading text-2xl font-bold">Quality Dashboard</h1>
        <p className="text-sm text-[var(--ak-color-text-muted)] mt-1">
          Übersicht über Feedback und Qualitätsmetriken
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <WidgetCard padding="md">
          <div className="text-sm text-[var(--ak-color-text-muted)] mb-1">Gesamt Feedback</div>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
            {metrics.total}
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <div className="text-sm text-[var(--ak-color-text-muted)] mb-1">Positive</div>
          <div className="text-2xl font-bold text-green-600">{metrics.positive}</div>
          <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
            {metrics.positive_rate.toFixed(1)}%
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <div className="text-sm text-[var(--ak-color-text-muted)] mb-1">Negative</div>
          <div className="text-2xl font-bold text-red-600">{metrics.negative}</div>
          <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
            {metrics.negative_rate.toFixed(1)}%
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <div className="text-sm text-[var(--ak-color-text-muted)] mb-1">Zufriedenheitsrate</div>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
            {metrics.positive_rate.toFixed(1)}%
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard padding="md">
          <h3 className="ak-heading text-sm font-semibold mb-4">Letzte 24 Stunden</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--ak-color-text-muted)]">Positive</span>
              <span className="text-sm font-medium text-green-600">
                {metrics.recent_positive}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--ak-color-text-muted)]">Negative</span>
              <span className="text-sm font-medium text-red-600">
                {metrics.recent_negative}
              </span>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <h3 className="ak-heading text-sm font-semibold mb-4">Trend</h3>
          <div className="text-sm text-[var(--ak-color-text-muted)]">
            {metrics.recent_positive > metrics.recent_negative
              ? "📈 Verbesserung"
              : metrics.recent_positive < metrics.recent_negative
              ? "📉 Verschlechterung"
              : "➡️ Stabil"}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

