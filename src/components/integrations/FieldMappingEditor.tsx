"use client";

import { useState, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface FieldMapping {
  canonicalField: string;
  providerPath: string;
  transform?: "trim" | "toLower" | "toUpper" | "parseMoney" | "parseDate";
}

interface FieldMappingEditorProps {
  tenantId: string;
  provider: string;
  connectionId: string;
}

export function FieldMappingEditor({ tenantId, provider, connectionId }: FieldMappingEditorProps) {
  const [mappings, setMappings] = useState<Record<string, FieldMapping>>({});
  const [transforms, setTransforms] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMappings();
  }, [tenantId, provider, connectionId]);

  const loadMappings = async () => {
    try {
      const res = await fetch(
        `/api/integrations/${provider}/${connectionId}/mappings?tenantId=${tenantId}`
      );
      if (res.ok) {
        const data = await res.json();
        setMappings(data.mappings || {});
        setTransforms(data.transforms || {});
      }
    } catch (err) {
      console.error("Failed to load mappings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/integrations/${provider}/${connectionId}/mappings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          mappings,
          transforms,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save mappings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save mappings");
    } finally {
      setSaving(false);
    }
  };

  const updateMapping = (canonicalField: string, providerPath: string) => {
    setMappings((prev) => ({
      ...prev,
      [canonicalField]: {
        canonicalField,
        providerPath,
        transform: prev[canonicalField]?.transform,
      },
    }));
  };

  const updateTransform = (canonicalField: string, transform: string) => {
    setMappings((prev) => ({
      ...prev,
      [canonicalField]: {
        ...prev[canonicalField],
        transform: transform ? (transform as FieldMapping["transform"]) : undefined,
      },
    }));
  };

  // Common canonical fields by entity type
  const commonFields = [
    { field: "email", label: "Email" },
    { field: "phone", label: "Phone" },
    { field: "first_name", label: "First Name" },
    { field: "last_name", label: "Last Name" },
    { field: "total", label: "Total Amount" },
    { field: "status", label: "Status" },
    { field: "created_at", label: "Created At" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ak-color-border-subtle)] border-t-[var(--ak-color-accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
          Feldzuordnung
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-[var(--ak-semantic-success-soft)] rounded text-[var(--ak-semantic-success)]">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Gespeichert</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--ak-semantic-danger-soft)] rounded text-[var(--ak-semantic-danger)]">
          <XCircleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {commonFields.map(({ field, label }) => (
          <div key={field} className="flex items-center gap-3 p-3 border border-[var(--ak-color-border-subtle)] rounded">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">
                {label} ({field})
              </label>
              <input
                type="text"
                value={mappings[field]?.providerPath || ""}
                onChange={(e) => updateMapping(field, e.target.value)}
                placeholder="provider.field.path"
                className="w-full px-3 py-2 border border-[var(--ak-color-border-subtle)] rounded bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)]"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">
                Transform
              </label>
              <select
                value={mappings[field]?.transform || ""}
                onChange={(e) => updateTransform(field, e.target.value)}
                className="w-full px-3 py-2 border border-[var(--ak-color-border-subtle)] rounded bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)]"
              >
                <option value="">Keine</option>
                <option value="trim">Trim</option>
                <option value="toLower">To Lower</option>
                <option value="toUpper">To Upper</option>
                <option value="parseMoney">Parse Money</option>
                <option value="parseDate">Parse Date</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--ak-color-text-secondary)]">
        Mappe Canonical-Felder auf Provider-spezifische Pfade (z.B. "customer.email" oder "order.total").
      </p>
    </div>
  );
}

