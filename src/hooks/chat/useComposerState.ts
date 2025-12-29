import { useState, useRef, useCallback } from 'react'
import type { ComposerMode } from '@/types/chat'

export type Attachment = {
  id: string
  name: string
  type: string
  file: File
}

export function useComposerState() {
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false)
  const [composerMode, setComposerMode] = useState<ComposerMode>("chat")
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [temporaryChat, setTemporaryChat] = useState(false)
  
  const dragCounter = useRef(0)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        file,
      }))
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        file,
      }
      setAttachments(prev => [...prev, newAttachment])
    }
    e.target.value = ""
  }, [])

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => id !== a.id))
  }, [])

  const clearAttachments = useCallback(() => {
    setAttachments([])
  }, [])

  return {
    // State
    input,
    setInput,
    attachments,
    setAttachments,
    isDragging,
    isPlusMenuOpen,
    setIsPlusMenuOpen,
    composerMode,
    setComposerMode,
    memoryEnabled,
    setMemoryEnabled,
    temporaryChat,
    setTemporaryChat,
    
    // Refs
    inputRef,
    fileInputRef,
    
    // Handlers
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    removeAttachment,
    clearAttachments,
  }
}

