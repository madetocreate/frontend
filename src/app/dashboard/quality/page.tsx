"use client";

import { useState, useEffect } from "react";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { authedFetch } from "@/lib/api/authedFetch";

interface FeedbackMetrics {
  total_feedback?: number;
  thumbs_up_count?: number;
  thumbs_down_count?: number;
  average_rating?: number;
  positive_feedback_rate?: number; // may be 0..1 or percentage
}

export default function QualityDashboardPage() {
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await authedFetch('/api/feedback/metrics?days=7');
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
  }, []);

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

  const total = metrics.total_feedback ?? 0;
  const positive = metrics.thumbs_up_count ?? 0;
  const negative = metrics.thumbs_down_count ?? 0;
  const rawPositiveRate = metrics.positive_feedback_rate;
  const positiveRate = rawPositiveRate !== undefined ? (rawPositiveRate > 1 ? rawPositiveRate : rawPositiveRate * 100) : undefined;
  const negativeRate = positiveRate !== undefined ? Math.max(0, 100 - positiveRate) : undefined;

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
            {total}
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <div className="text-sm text-[var(--ak-color-text-muted)] mb-1">Positive</div>
          <div className="text-2xl font-bold text-[var(--ak-semantic-success)]">{positive}</div>
          <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
            {positiveRate !== undefined ? `${positiveRate.toFixed(1)}%` : "–"}
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <div className="text-sm text-[var(--ak-color-text-muted)] mb-1">Negative</div>
          <div className="text-2xl font-bold text-[var(--ak-semantic-danger)]">{negative}</div>
          <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
            {negativeRate !== undefined ? `${negativeRate.toFixed(1)}%` : "–"}
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <div className="text-sm text-[var(--ak-color-text-muted)] mb-1">Zufriedenheitsrate</div>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
            {positiveRate !== undefined ? `${positiveRate.toFixed(1)}%` : "–"}
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard padding="md">
          <h3 className="ak-heading text-sm font-semibold mb-4">Durchschnittsbewertung</h3>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
            {metrics.average_rating !== undefined ? metrics.average_rating.toFixed(1) : "–"}
          </div>
          <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
            Skala 1-5
          </div>
        </WidgetCard>

        <WidgetCard padding="md">
          <h3 className="ak-heading text-sm font-semibold mb-4">Positive Rate</h3>
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
            {positiveRate !== undefined ? `${positiveRate.toFixed(1)}%` : "–"}
          </div>
          <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
            Anteil positiver Feedbacks
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

