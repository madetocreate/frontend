"use client";

// Entfernt Inline-Memory-Marker [[mem:...|...]] oder [[mem:...]]
export function stripInlineMemoryMarkers(text: string): string {
  if (!text) return "";
  return text.replace(/\[\[mem:[^\]|]+(?:\|[^\]]*)?\]\]/g, "");
}

