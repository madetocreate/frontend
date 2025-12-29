"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatMarkdown } from "@/components/chat/markdown/ChatMarkdown";
import { stripInlineMemoryMarkers } from "@/lib/memoryMarkers";

type SnapshotMessage = { role: "user" | "assistant" | "system"; text: string };

type SnapshotResponse = {
  id: string;
  createdAt: number;
  expiresAt: number;
  snapshot: {
    threadId?: string;
    messageId?: string;
    messages: SnapshotMessage[];
    createdBy?: string;
  };
};

export default function SharePage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<SnapshotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/share/${id}`);
        if (!res.ok) {
          setError("Snapshot nicht gefunden oder abgelaufen.");
          return;
        }
        const json = (await res.json()) as SnapshotResponse;
        setData(json);
      } catch (e) {
        setError("Fehler beim Laden.");
      }
    };
    if (id) {
      void load();
    }
  }, [id]);

  const handleCopy = async () => {
    if (!data?.snapshot?.messages) return;
    const text = data.snapshot.messages
      .map((m) => `${m.role}: ${stripInlineMemoryMarkers(m.text)}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Kopiert");
      setTimeout(() => setCopyStatus(""), 1500);
    } catch {
      setCopyStatus("Fehler beim Kopieren");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-[var(--ak-color-text-primary)]">
        <h1 className="text-2xl font-semibold mb-2">Geteilte Nachricht</h1>
        <p className="text-sm text-[var(--ak-color-text-secondary)]">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-[var(--ak-color-text-primary)]">
        <p className="text-sm text-[var(--ak-color-text-secondary)]">Lädt …</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-[var(--ak-color-text-primary)]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Geteilte Unterhaltung</h1>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            ID: {data.id}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
        >
          {copyStatus || "Kopieren"}
        </button>
      </header>

      <div className="space-y-4">
        {data.snapshot.messages.map((msg, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-3"
          >
            <div className="text-xs font-semibold text-[var(--ak-color-text-muted)] mb-1 uppercase">
              {msg.role}
            </div>
            <ChatMarkdown content={msg.text} />
          </div>
        ))}
      </div>
    </div>
  );
}

