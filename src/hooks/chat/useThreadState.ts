import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useChatThreads, setActiveThreadId as setActiveThreadIdStore, updateChatThread } from '@/lib/chatThreadsStore'
import type { ChatMessage } from '@/components/ChatShell'

export function useThreadState() {
  const { threads, activeThreadId: storeActiveThreadId } = useChatThreads()
  const [activeThreadId, setActiveThreadIdLocal] = useState<string>(storeActiveThreadId || "thread-default")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showJumpToBottom, setShowJumpToBottom] = useState(false)
  
  const messagesRef = useRef<ChatMessage[]>([])
  const activeThreadIdRef = useRef(activeThreadId)
  const currentThreadRef = useRef<string | null>(storeActiveThreadId || "thread-default")
  const isNearBottomRef = useRef(true)

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { activeThreadIdRef.current = activeThreadId }, [activeThreadId])

  const setActiveThreadId = useCallback((threadId: string) => {
    setActiveThreadIdLocal(threadId)
    setActiveThreadIdStore(threadId)
    currentThreadRef.current = threadId
  }, [])

  // Ambient Mode based on content
  const ambientColor = useMemo(() => {
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null
    if (!lastMsg) return "bg-[var(--ak-color-bg-surface)]"
    
    const text = lastMsg.text.toLowerCase()
    if (text.includes("code") || text.includes("function") || text.includes("api")) return "bg-[var(--ak-color-accent-soft)]"
    if (text.includes("marketing") || text.includes("text") || text.includes("email")) return "bg-[var(--ak-accent-growth-soft)]"
    if (text.includes("error") || text.includes("bug") || text.includes("fix")) return "bg-[var(--ak-semantic-danger-soft)]"
    if (text.includes("data") || text.includes("chart") || text.includes("analysis")) return "bg-[var(--ak-semantic-success-soft)]"
    
    return "bg-[var(--ak-color-bg-surface)]"
  }, [messages])

  return {
    // State
    threads,
    activeThreadId,
    storeActiveThreadId,
    setActiveThreadId,
    setActiveThreadIdLocal,
    messages,
    setMessages,
    showJumpToBottom,
    setShowJumpToBottom,
    ambientColor,
    
    // Refs
    messagesRef,
    activeThreadIdRef,
    currentThreadRef,
    isNearBottomRef,
  }
}

