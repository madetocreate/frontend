"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

type ChatThread = {
  id: string;
  title: string;
  lastMessageAt: number;
  preview?: string;
};

// Mock-Daten für Threads
const MOCK_THREADS: ChatThread[] = [
  {
    id: "thread-1",
    title: "Architektur erklären",
    lastMessageAt: Date.now() - 1000 * 60 * 30,
    preview: "Kannst du mir die Architektur dieser App erklären?",
  },
  {
    id: "thread-2",
    title: "Bug Analyse",
    lastMessageAt: Date.now() - 1000 * 60 * 60 * 2,
    preview: "Hilf mir, einen Bug zu analysieren...",
  },
  {
    id: "thread-3",
    title: "Marketing Kampagne",
    lastMessageAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    preview: "Ideen für die nächste Social Media Kampagne.",
  },
  {
    id: "thread-4",
    title: "Meeting Notizen",
    lastMessageAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    preview: "Zusammenfassung des letzten Kundenmeetings.",
  },
  {
    id: "thread-5",
    title: "Produkt-Feedback",
    lastMessageAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    preview: "Feedback zur neuen Funktion X.",
  },
];

export function ChatSidebarContent() {
  const [threads, setThreads] = useState<ChatThread[]>(MOCK_THREADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const query = searchQuery.toLowerCase();
    return threads.filter(
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
    setActiveThreadId(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("aklow-new-chat", {
          detail: { threadId: null },
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

  const handleDeleteThread = async (threadId: string) => {
    try {
      // Backend-API aufrufen
      const response = await fetch(`/api/chatkit/threads/${threadId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Threads');
      }

      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setOpenKebabId(null);
      if (activeThreadId === threadId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      // Fallback: Lokal löschen
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setOpenKebabId(null);
      if (activeThreadId === threadId) {
        handleNewChat();
      }
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

  const handleSaveRename = async (threadId: string) => {
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      setEditingThreadId(null);
      return;
    }

    try {
      // Backend-API aufrufen
      const response = await fetch(`/api/chatkit/threads/${threadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: trimmedTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        const errorMessage = errorData?.error || errorData?.detail || `HTTP ${response.status}`;
        console.error(`Fehler beim Umbenennen des Threads (${response.status}):`, errorMessage);
        // Fallback: Lokal umbenennen trotz Fehler
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, title: trimmedTitle } : t))
        );
        setEditingThreadId(null);
        setEditingTitle("");
        return;
      }

      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title: trimmedTitle } : t))
      );
      setEditingThreadId(null);
      setEditingTitle("");
    } catch (error) {
      console.error('Fehler beim Umbenennen:', error);
      // Fallback: Lokal umbenennen
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title: trimmedTitle } : t))
      );
      setEditingThreadId(null);
      setEditingTitle("");
    }
  };

  const handleCancelRename = () => {
    setEditingThreadId(null);
    setEditingTitle("");
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

  return (
    <div className="flex h-full flex-col">
      {/* Header: New Chat + Search */}
      <div className="flex flex-col gap-2 border-b border-[var(--ak-color-border-subtle)] p-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="flex w-full items-center gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-all duration-200 hover:bg-[var(--ak-color-bg-surface-muted)] hover:border-[var(--ak-color-border-strong)]"
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

      {/* Thread-Liste */}
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
                        "flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
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
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenKebabId(null)}
                          />
                          {/* Kebab-Menü */}
                          <div className="absolute right-0 top-7 z-50 w-40 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-[var(--ak-shadow-soft)]">
                            <button
                              type="button"
                              onClick={() => handleRenameThread(thread.id)}
                              className="w-full px-3 py-2 text-left text-sm text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-surface-muted)]"
                            >
                              Umbenennen
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
    </div>
  );
}

