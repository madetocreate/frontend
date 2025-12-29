import { useCallback } from 'react'
import { searchMemory as searchMemoryAPI, saveMemory as saveMemoryAPI, archiveMemory as archiveMemoryAPI } from '@/lib/memoryClient'

type MemoryItem = {
  id: string
  content: string
  type?: string
}

type LoadMessagesFn = (threadId: string) => any[]

type ChatThread = {
  id: string
  projectId?: string
}

export function useMemoryIntegration(
  tenantId: string | undefined,
  memoryEnabled: boolean,
  temporaryChat: boolean,
  messagesRef: React.MutableRefObject<any[]>,
  currentThreadRef: React.MutableRefObject<string | null>,
  loadMessages: LoadMessagesFn,
  threads?: ChatThread[] // Optional: für Project-only Memory
) {
  const searchMemory = useCallback(async (query: string): Promise<MemoryItem[]> => {
    if (!memoryEnabled || temporaryChat) {
      return []
    }

    try {
      const searchData = await searchMemoryAPI({
        query,
        limit: 5,
      })
      
      if (Array.isArray(searchData.items)) {
        return searchData.items.slice(0, 5).map((item: any) => ({
          id: item.id || item.memory_id || "",
          content: item.content || item.snippet || "",
          type: item.type,
        }))
      }
    } catch (error) {
      console.error("Memory search failed:", error)
    }
    
    return []
  }, [tenantId, memoryEnabled, temporaryChat])

  const saveThreadToMemory = useCallback(async (threadId: string) => {
    if (temporaryChat) return // Skip memory save in temporary chat mode
    
    const tenant = tenantId || "aklow-main"
    const messagesToUse = threadId === currentThreadRef.current 
      ? messagesRef.current 
      : loadMessages(threadId)
    
    const textParts = messagesToUse
      .filter((m: any) => (m.text || "").trim().length > 0)
      .slice(-10) // letzte 10 Nachrichten
      .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text?.trim() || ""}`)
    const summarySource = textParts.join("\n").slice(0, 4000)

    const summary = summarySource
      ? `Zusammenfassung des Chats:\n${summarySource}`
      : "Leerer Chat ohne Inhalt."

    // Project-only Memory: Ermittle projectId, wenn Thread in Projekt ist
    const currentThread = threads?.find((t) => t.id === threadId);
    const saveBody: Record<string, unknown> = {
      threadId,
      role: "assistant",
      content: summary,
      timestamp: new Date().toISOString(),
      tenantId: tenant,
    };
    if (currentThread?.projectId) {
      saveBody.projectId = currentThread.projectId;
    }

    try {
      await saveMemoryAPI({
        threadId: saveBody.threadId as string,
        role: saveBody.role as string,
        content: saveBody.content as string,
        timestamp: saveBody.timestamp as string,
        kind: saveBody.kind as string | undefined,
        tags: saveBody.tags as string[] | undefined,
      })
    } catch (err) {
      console.error("Speichern fehlgeschlagen:", err)
    }
  }, [tenantId, temporaryChat, messagesRef, currentThreadRef, loadMessages, threads])

  const archiveMemory = useCallback(async (memoryId: string) => {
    try {
      await archiveMemoryAPI(memoryId)
      return true
    } catch (error) {
      console.error("Failed to archive memory:", error)
      return false
    }
  }, [])

  return {
    searchMemory,
    saveThreadToMemory,
    archiveMemory,
  }
}

