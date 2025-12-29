"use client";

const KEY = "aklow-memory-enabled-v1";
const UPDATE_EVENT = "aklow-memory-pref-updated";

export function readMemoryEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(KEY);
  if (raw === null) return true; // default: enabled
  return raw === "1" || raw === "true";
}

export function writeMemoryEnabled(val: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, val ? "1" : "0");
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch (e) {
    console.warn("Failed to persist memory preference", e);
  }
}

export function subscribeMemoryEnabled(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(UPDATE_EVENT, handler);
  };
}

