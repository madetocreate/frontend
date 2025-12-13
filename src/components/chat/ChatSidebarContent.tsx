"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import clsx from "clsx";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

type ChatThread = {
  id: string;
  title: string;
  lastMessageAt: number;
  preview?: string;
  archived?: boolean;
};

// SSR-sicherer Startwert (keine Zeit-/Random-Aufrufe)
const DEFAULT_THREAD: ChatThread = {
  id: "thread-default",
  title: "Neuer Chat",
  lastMessageAt: 0,
  preview: "",
};

const THREADS_KEY = "aklow_chat_threads";

export function ChatSidebarContent() {
  const loadThreads = useCallback((): ChatThread[] => {
    if (typeof window === "undefined") return [DEFAULT_THREAD];
    try {
      const raw = localStorage.getItem(THREADS_KEY);
      if (!raw) return [DEFAULT_THREAD];
      const parsed = JSON.parse(raw) as ChatThread[];
      if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_THREAD];
      return parsed;
    } catch {
      return [DEFAULT_THREAD];
    }
  }, []);

  const saveThreads = useCallback((list: ChatThread[]) => {
    try {
      localStorage.setItem(THREADS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Konnte Threads nicht speichern", e);
    }
  }, []);

  // Initial SSR-sicher; echte Daten erst nach Hydration laden
  const [threads, setThreads] = useState<ChatThread[]>([DEFAULT_THREAD]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(DEFAULT_THREAD.id);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [, setHydrated] = useState(false); // Track hydration state (setter only, value not used)

  // Lade Threads nur auf dem Client nach Hydration
  useEffect(() => {
    const loaded = loadThreads();
    setThreads(loaded);
    if (loaded.length > 0) {
      setActiveThreadId((prev) => prev ?? loaded[0].id);
    }
    setHydrated(true);
  }, [loadThreads]);

  const filteredThreads = useMemo(() => {
    const base = threads.filter((t) => !t.archived);
    if (!searchQuery.trim()) return base;
    const query = searchQuery.toLowerCase();
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.preview?.toLowerCase().includes(query)
    );
  }, [threads, searchQuery]);

  const handleKebabClick = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    setOpenKebabId(openKebabId === threadId ? null : threadId);
  };

  const handleNewChat = () => {
    const newId = "thread-" + Date.now();
    const newThread: ChatThread = {
      id: newId,
      title: "Neuer Chat",
      lastMessageAt: Date.now(),
      preview: "",
    };
    const next = [newThread, ...threads].slice(0); // shallow copy
    setThreads(next);
    saveThreads(next);
    setActiveThreadId(newId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("aklow-new-chat", {
          detail: { threadId: newId },
        })
      );
    }
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("aklow-select-thread", {
          detail: { threadId },
        })
      );
    }
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== threadId)
      saveThreads(next)
      return next
    })
    setOpenKebabId(null)
    if (activeThreadId === threadId) {
      handleNewChat()
    }
  };

  const handleRenameThread = (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      setEditingThreadId(threadId);
      setEditingTitle(thread.title);
      setOpenKebabId(null);
    }
  };

  const handleSaveRename = (threadId: string) => {
    const trimmedTitle = editingTitle.trim()
    if (!trimmedTitle) {
      setEditingThreadId(null)
      return
    }

    setThreads((prev) => {
      const next = prev.map((t) => (t.id === threadId ? { ...t, title: trimmedTitle } : t))
      saveThreads(next)
      return next
    })

    setEditingThreadId(null)
    setEditingTitle("")
  };

  const handleCancelRename = () => {
    setEditingThreadId(null);
    setEditingTitle("");
  };

  const handleArchiveThread = (threadId: string) => {
    setThreads((prev) => {
      const next = prev.map((t) =>
        t.id === threadId ? { ...t, archived: true } : t
      );
      saveThreads(next);
      return next;
    });
    setOpenKebabId(null);
    if (activeThreadId === threadId) {
      handleNewChat();
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, threadId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename(threadId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

  // Listener für Updates aus ChatShell (letzte Nachricht + Titel)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { threadId: string; preview: string; lastMessageAt: number; title?: string }
        | undefined;
      if (!detail?.threadId) return;
      setThreads((prev) => {
        const found = prev.find((t) => t.id === detail.threadId);
        const nextTitle =
          detail.title && detail.title.trim().length > 0
            ? detail.title.trim()
            : found?.title || "Neuer Chat";
        const updated: ChatThread = found
          ? { ...found, preview: detail.preview, lastMessageAt: detail.lastMessageAt, title: nextTitle }
          : {
              id: detail.threadId,
              title: nextTitle,
              preview: detail.preview,
              lastMessageAt: detail.lastMessageAt,
              archived: false,
            };
        const others = prev.filter((t) => t.id !== detail.threadId);
        const next = [updated, ...others]
          .filter((t) => !t.archived)
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
        saveThreads(next);
        return next;
      });
    };
    window.addEventListener("aklow-thread-preview", handler as EventListener);
    return () => {
      window.removeEventListener("aklow-thread-preview", handler as EventListener);
    };
  }, [saveThreads]);

  // Initial select first thread
  useEffect(() => {
    if (activeThreadId || threads.length === 0) return;
    const first = threads[0];
    handleThreadSelect(first.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads]);

  return (
    <div className="flex h-full flex-col">
      {/* Header: New Chat + Search */}
      <div className="flex flex-col gap-2 p-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="flex w-full items-center gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-all duration-200 hover:bg-[var(--ak-color-bg-surface-muted)] hover:border-[var(--ak-color-border-strong)] ak-button-interactive"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          <span>Neuer Chat</span>
        </button>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ak-color-text-muted)]" />
          <input
            type="text"
            placeholder="Chats durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-8 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
        </div>
      </div>

      {/* Collapsible Chats Section */}
      <div>
        <button
          type="button"
          onClick={() => setChatsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[var(--ak-color-bg-surface-muted)] transition-colors ak-button-interactive"
        >
          <span className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
            Chats
          </span>
          <ChevronDownIcon
            className={clsx(
              "h-4 w-4 text-[var(--ak-color-text-muted)] transition-transform duration-200",
              chatsExpanded ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>
      </div>

      {/* Thread-Liste */}
      {chatsExpanded && (
        <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[var(--ak-color-text-muted)]">
            {searchQuery ? "Keine Chats gefunden" : "Noch keine Chats"}
          </div>
        ) : (
          <div className="p-2">
            {filteredThreads.map((thread) => {
              const isActive = activeThreadId === thread.id;
              const isHovered = hoveredThreadId === thread.id;
              const showKebab = isActive || isHovered;

              return (
                <div
                  key={thread.id}
                  className="group relative mb-1"
                  onMouseEnter={() => setHoveredThreadId(thread.id)}
                  onMouseLeave={() => setHoveredThreadId(null)}
                >
                  {editingThreadId === thread.id ? (
                    <div className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5">
                      <ChatBubbleLeftRightIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => handleRenameKeyDown(e, thread.id)}
                        onBlur={() => handleSaveRename(thread.id)}
                        className="ak-body min-w-0 flex-1 border-none bg-transparent font-medium outline-none focus:ring-0"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleThreadSelect(thread.id)}
                      className={clsx(
                        "flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ak-button-interactive",
                        isActive
                          ? "bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-text-primary)]"
                          : "text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-surface-muted)]"
                      )}
                    >
                      <ChatBubbleLeftRightIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="ak-body truncate font-medium">
                          {thread.title}
                        </div>
                        {thread.preview && (
                          <div className="ak-caption mt-0.5 truncate text-[var(--ak-color-text-muted)]">
                            {thread.preview}
                          </div>
                        )}
                      </div>
                    </button>
                  )}

                  {/* Kebab-Menü */}
                  {showKebab && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-[320]">
                      <button
                        type="button"
                        onClick={(e) => handleKebabClick(e, thread.id)}
                        className="flex h-6 w-6 items-center justify-center rounded text-[var(--ak-color-text-muted)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:text-[var(--ak-color-text-primary)]"
                        aria-label="Mehr Optionen"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>

                      {openKebabId === thread.id && (
                        <>
                          {/* Deckendes Overlay */}
                          <div
                            className="fixed inset-0 z-[9996]"
                            onClick={() => setOpenKebabId(null)}
                          />
                          {/* Kebab-Menü */}
                          <div className="absolute right-0 top-7 z-[9997] w-40 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-[var(--ak-shadow-soft)]">
                            <button
                              type="button"
                              onClick={() => handleRenameThread(thread.id)}
                              className="w-full px-3 py-2 text-left text-sm text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-surface-muted)]"
                            >
                              Umbenennen
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchiveThread(thread.id)}
                              className="w-full px-3 py-2 text-left text-sm text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-surface-muted)]"
                            >
                              Archivieren
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteThread(thread.id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              Löschen
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      )}
    </div>
  );
}

