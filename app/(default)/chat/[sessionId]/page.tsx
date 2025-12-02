'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { AppShell } from '@/components/AppShell'
import { AppDrawer } from '@/components/AppDrawer'
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  PlusIcon,
  ClipboardIcon,
  ArrowPathIcon,
  BookmarkIcon,
  PencilSquareIcon,
  SpeakerWaveIcon,
  ArrowDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useI18n } from '@/i18n/I18nContext'
import { MarkdownMessage } from '@/components/MarkdownMessage'
import {
  ensureSession,
  getSession,
  saveSessionMessages,
  setSessionTitle
} from '@/lib/sessionStore'

const CHAT_STREAM_URL =
  process.env.NEXT_PUBLIC_CHAT_STREAM_URL || 'http://localhost:3000/chat/stream'
const CHAT_HTTP_URL = CHAT_STREAM_URL.replace(/\/chat\/stream$/, '/chat')
const INGEST_AUDIO_URL = CHAT_HTTP_URL.replace(/\/chat$/, '/ingest/audio')
const TENANT_ID = 'tenant_demo'
const CHANNEL = 'app'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

type UiStepStatus = 'pending' | 'active' | 'done'

type UiStep = {
  id: string
  label: string
  status: UiStepStatus
}

type ComposerMode = 'default' | 'deep_research' | 'doc_analysis' | 'image' | 'upload'

function makeTitleFromMessage(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return 'Neuer Chat'
  let title = trimmed.split('\n')[0]
  if (title.length > 60) {
    title = title.slice(0, 57).trimEnd() + '...'
  }
  return title
}

export default function ChatSessionPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [steps, setSteps] = useState<UiStep[]>([])
  const [composerMode, setComposerMode] = useState<ComposerMode>('default')
  const [isRecording, setIsRecording] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordingCancelRef = useRef(false)

  useEffect(() => {
    const initialAssistant: Message = {
      id: 1,
      role: 'assistant',
      content: t('chat.welcome')
    }

    const stored = getSession(sessionId)
    if (stored && Array.isArray(stored.messages) && stored.messages.length > 0) {
      setMessages(stored.messages as Message[])
    } else {
      setMessages([initialAssistant])
      ensureSession(sessionId, [initialAssistant])
    }
  }, [sessionId, t])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const handleScroll = () => {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollToBottom(distanceToBottom > 80)
    }
    el.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => {
      el.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceToBottom < 80) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  async function fetchFallback(message: string, assistantId: number) {
    try {
      setStatus('Fallback wird ausgeführt...')

      const metadata: any = {
        mode: 'general_chat',
        language: 'de'
      }

      const response = await fetch(CHAT_HTTP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: TENANT_ID,
          sessionId,
          channel: CHANNEL,
          message,
          metadata
        })
      })

      if (!response.ok) {
        setStatus('Fehler beim Fallback (' + response.status + ')')
        setMessages(prev => {
          const next = prev.map(m =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    m.content +
                    '\n\n[Fehler beim Abrufen der Antwort (' +
                    response.status +
                    ')]'
                }
              : m
          )
          saveSessionMessages(sessionId, next)
          return next
        })
        return
      }

      const json = await response.json()
      const content =
        json && typeof json.content === 'string'
          ? json.content
          : JSON.stringify(json)

      setMessages(prev => {
        const next = prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + content } : m
        )
        saveSessionMessages(sessionId, next)
        return next
      })
      setStatus(null)
      setSteps([])
    } catch (e) {
      setStatus('Es ist ein Fehler beim Fallback-Request aufgetreten.')
      setMessages(prev => {
        const next = prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  m.content +
                  '\n\n[Es ist ein Fehler beim Fallback-Request aufgetreten.]'
              }
            : m
        )
        saveSessionMessages(sessionId, next)
        return next
      })
      setSteps([])
    }
  }

  async function streamAssistant(message: string, assistantId: number) {
    try {
      setIsStreaming(true)
      setStatus('Verbinde mit dem Orchestrator...')

      const metadata: any = {
        language: 'de'
      }

      if (composerMode === 'deep_research') {
        metadata.tool = 'research_query'
        metadata.mode = 'research'
        metadata.scope = 'market'
        metadata.maxSources = 5
      } else if (composerMode === 'doc_analysis') {
        metadata.tool = 'analysis_query'
        metadata.mode = 'analysis'
      } else {
        metadata.mode = 'general_chat'
      }

      const response = await fetch(CHAT_STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: TENANT_ID,
          sessionId,
          channel: CHANNEL,
          message,
          metadata
        })
      })

      if (!response.ok || !response.body) {
        setIsStreaming(false)
        setStatus('Streaming fehlgeschlagen, versuche Fallback...')
        await fetchFallback(message, assistantId)
        return
      }

      setStatus('Antwort wird generiert...')
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const result = await reader.read()
        const value = result.value
        const done = result.done
        if (done) {
          break
        }
        if (!value) {
          continue
        }

        buffer += decoder.decode(value, { stream: true })

        let boundary = buffer.indexOf('\n\n')
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          handleSseEvent(rawEvent, assistantId)
          boundary = buffer.indexOf('\n\n')
        }
      }

      if (buffer.trim().length > 0) {
        handleSseEvent(buffer, assistantId)
      }
      setIsStreaming(false)
      setStatus(null)
      setSteps([])
    } catch (e) {
      setIsStreaming(false)
      setStatus('Es ist ein Fehler beim Streaming, versuche Fallback...')
      void fetchFallback(message, assistantId)
    }
  }

  function handleSseEvent(rawEvent: string, assistantId: number) {
    const lines = rawEvent.split('\n')
    let eventType = 'message'
    let data = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      if (trimmed.startsWith('event:')) {
        eventType = trimmed.slice(6).trim()
      } else if (trimmed.startsWith('data:')) {
        const value = trimmed.slice(5).trim()
        if (data.length === 0) {
          data = value
        } else {
          data = data + value
        }
      }
    }

    if (!data) {
      return
    }

    let payload: any
    try {
      payload = JSON.parse(data)
    } catch {
      console.error('Failed to parse SSE data', data)
      return
    }

    if (eventType === 'steps' && Array.isArray(payload.steps)) {
      setSteps(
        payload.steps
          .filter((s: any) => s && typeof s.id === 'string' && typeof s.label === 'string')
          .map((s: any) => ({
            id: s.id as string,
            label: s.label as string,
            status:
              s.status === 'active' || s.status === 'done'
                ? (s.status as UiStepStatus)
                : 'pending'
          }))
      )
      return
    }

    if (eventType === 'step_update' && typeof payload.id === 'string' && payload.status) {
      setSteps(prev =>
        prev.map(step =>
          step.id === payload.id
            ? {
                ...step,
                status:
                  payload.status === 'active' || payload.status === 'done'
                    ? (payload.status as UiStepStatus)
                    : step.status
              }
            : step
        )
      )
      return
    }

    if (eventType === 'start') {
      setStatus('Antwort wird generiert...')
      return
    }

    if (eventType === 'end') {
      setIsStreaming(false)
      setStatus(null)
      setSteps([])
      return
    }

    if (eventType === 'chunk' && typeof payload.content === 'string' && payload.content) {
      const delta = payload.content
      setMessages(prev => {
        const next = prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + delta } : m
        )
        saveSessionMessages(sessionId, next)
        return next
      })
    } else if (eventType === 'error') {
      setStatus('Der Orchestrator hat einen Fehler gemeldet.')
      setMessages(prev => {
        const next = prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  m.content +
                  '\n\n[Der Orchestrator hat einen Fehler gemeldet.]'
              }
            : m
        )
        saveSessionMessages(sessionId, next)
        return next
      })
      setSteps([])
    }
  }

  function handleSend() {
    const value = input.trim()
    if (!value) return
    if (isStreaming) {
      setStatus('Bitte warte, bis die aktuelle Antwort fertig ist.')
      return
    }
    const id = Date.now()
    const hasUserMessage = messages.some(m => m.role === 'user')
    if (!hasUserMessage) {
      const title = makeTitleFromMessage(value)
      setSessionTitle(sessionId, title)
    }

    const assistantId = id + 1

    setMessages(prev => {
      const next: Message[] = [
        ...prev,
        { id, role: 'user', content: value },
        {
          id: assistantId,
          role: 'assistant',
          content: ''
        }
      ]
      saveSessionMessages(sessionId, next)
      return next
    })

    setInput('')
    setIsStreaming(true)
    setStatus('Antwort wird vorbereitet...')
    setSteps([])
    void streamAssistant(value, assistantId)
  }

  function renderModeLabel(mode: ComposerMode): string {
    if (mode === 'deep_research') return 'Modus: Deep Research'
    if (mode === 'doc_analysis') return 'Modus: Dokumentanalyse'
    if (mode === 'image') return 'Modus: Bildgenerierung'
    if (mode === 'upload') return 'Modus: Datei-Upload'
    return ''
  }

  function handleCopy(content: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(content).catch(() => {})
  }

  function handleSpeak(content: string) {
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') {
      return
    }
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.lang = 'de-DE'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  async function handleMicClick() {
    if (isRecording) {
      const recorder = mediaRecorderRef.current
      recordingCancelRef.current = false
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop()
      }
      return
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.warn('Kein Mikrofonzugriff verfügbar.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const streamLocal = mediaStreamRef.current
        if (streamLocal) {
          streamLocal.getTracks().forEach(track => track.stop())
          mediaStreamRef.current = null
        }
        const cancelled = recordingCancelRef.current
        recordingCancelRef.current = false
        setIsRecording(false)

        if (cancelled) {
          audioChunksRef.current = []
          return
        }

        try {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          const arrayBuffer = await blob.arrayBuffer()
          const bytes = new Uint8Array(arrayBuffer)
          let binary = ''
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          const audioBase64 = btoa(binary)

          const res = await fetch(INGEST_AUDIO_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tenantId: TENANT_ID,
              sessionId,
              externalId: 'mic-' + Date.now().toString(),
              platform: 'web_app',
              from: 'user',
              audioBase64,
              audioMimeType: blob.type || 'audio/webm',
              channel: CHANNEL,
              metadata: {
                source: 'chat_mic'
              }
            })
          })

          if (!res.ok) {
            console.error('Audio Ingest fehlgeschlagen', res.status)
            return
          }

          const data = await res.json()
          const transcript =
            data &&
            data.normalized &&
            typeof data.normalized.body === 'string' &&
            data.normalized.body

          if (transcript) {
            setInput(prev =>
              prev ? prev.replace(/\s*$/, ' ') + String(transcript) : String(transcript)
            )
            if (inputRef.current) {
              inputRef.current.focus()
            }
          }
        } catch (error) {
          console.error('Fehler bei der Audioverarbeitung', error)
        } finally {
          audioChunksRef.current = []
        }
      }

      mediaRecorderRef.current = recorder
      recordingCancelRef.current = false
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Mikrofonzugriff fehlgeschlagen', error)
    }
  }

  function handleMicCancel() {
    const recorder = mediaRecorderRef.current
    recordingCancelRef.current = true
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
      return
    }
    const stream = mediaStreamRef.current
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    audioChunksRef.current = []
    setIsRecording(false)
  }

  function scrollToBottom() {
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  function renderMessageActions(message: Message) {
    const isAssistant = message.role === 'assistant'
    const sideClass = isAssistant ? 'mr-2' : 'ml-2'
    const containerClass = isAssistant
      ? 'flex items-center justify-start'
      : 'flex items-center justify-end'
    return (
      <div className={containerClass}>
        <div
          className={
            'flex items-center gap-0.5 text-soft opacity-0 transition-opacity group-hover:opacity-100'
          }
        >
          <button
            type="button"
            title="Kopieren"
            onClick={() => handleCopy(message.content)}
            className={
              sideClass +
              ' inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] hover:bg-soft hover:text-primary'
            }
          >
            <ClipboardIcon className="h-3.5 w-3.5" />
          </button>
          {isAssistant && (
            <button
              type="button"
              title="Vorlesen"
              onClick={() => handleSpeak(message.content)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] hover:bg-soft hover:text-primary"
            >
              <SpeakerWaveIcon className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            title="Neu generieren"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] hover:bg-soft hover:text-primary"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Speichern"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] hover:bg-soft hover:text-primary"
          >
            <BookmarkIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Bearbeiten"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] hover:bg-soft hover:text-primary"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="flex h-full min-h-0 flex-col px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col">
            <div className="flex items-center justify-end py-1">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded-full border border-subtle px-3 py-1 text-xs font-medium text-muted hover:text-primary hover:border-strong"
              >
                {t('chat.stepsLabel')}
              </button>
            </div>
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto pb-4 pt-0 space-y-3"
            >
              {messages.map(m => (
                <div
                  key={m.id}
                  className={
                    'group flex flex-col gap-0.5 ' +
                    (m.role === 'user' ? 'items-end' : 'items-start')
                  }
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-3xl rounded-2xl bg-surface-elevated-soft px-4 py-3 text-base leading-relaxed text-primary border border-subtle'
                        : 'max-w-3xl rounded-2xl bg-surface-elevated px-4 py-3 text-lg leading-relaxed text-on-elevated'
                    }
                  >
                    {m.role === 'assistant' ? (
                      <MarkdownMessage content={m.content} />
                    ) : (
                      m.content
                    )}
                  </div>
                  {renderMessageActions(m)}
                </div>
              ))}
              {showScrollToBottom && (
                <div className="sticky bottom-0 flex justify-end">
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="mb-2 mr-1 inline-flex items-center gap-1 rounded-full bg-surface-elevated px-3 py-1 text-xs font-medium text-on-elevated shadow hover:bg-app-muted"
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                    Nach unten
                  </button>
                </div>
              )}
            </div>
            <div className="bg-app/90 pb-4 pt-3 backdrop-blur">
              {status && (
                <div className="mx-auto max-w-3xl pb-1 text-center text-xs text-muted">
                  {status}
                </div>
              )}
              {steps.length > 0 && (
                <div className="mx-auto max-w-3xl pb-2 text-center text-[11px] text-muted">
                  {steps.map((step, index) => (
                    <span key={step.id}>
                      {index > 0 && ' · '}
                      {step.label}
                      {step.status === 'active'
                        ? ' (läuft)'
                        : step.status === 'done'
                        ? ' (fertig)'
                        : ''}
                    </span>
                  ))}
                </div>
              )}
              {composerMode !== 'default' && (
                <div className="mx-auto mb-2 flex max-w-3xl items-center justify-between text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2 py-0.5">
                    <span>{renderModeLabel(composerMode)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setComposerMode('default')}
                    className="text-[11px] text-soft hover:text-muted"
                  >
                    Modus zurücksetzen
                  </button>
                </div>
              )}
              <form
                className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-subtle bg-surface-elevated-soft px-3 py-3 shadow-sm"
                onSubmit={e => {
                  e.preventDefault()
                  if (!isRecording) {
                    handleSend()
                  }
                }}
              >
                <Menu as="div" className="relative">
                  <MenuButton className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-primary focus:outline-none">
                    <span className="sr-only">Aktion hinzufügen</span>
                    <PlusIcon aria-hidden="true" className="h-5 w-5" />
                  </MenuButton>
                  <MenuItems className="absolute bottom-11 left-0 mb-1 w-56 origin-bottom-left rounded-xl border border-subtle bg-surface-elevated-soft p-1 text-sm shadow-lg outline-none">
                    <MenuItem>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setComposerMode('deep_research')}
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${
                            active ? 'bg-soft text-primary' : 'text-muted'
                          }`}
                        >
                          <span>Deep Research</span>
                          {composerMode === 'deep_research' && (
                            <span className="text-[10px] text-accent">aktiv</span>
                          )}
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setComposerMode('doc_analysis')}
                          className={`mt-0.5 flex w-full items-center justify_between rounded-lg px-2 py-1.5 text-left text-xs ${
                            active ? 'bg-soft text-primary' : 'text-muted'
                          }`}
                        >
                          <span>Dokumentanalyse</span>
                          {composerMode === 'doc_analysis' && (
                            <span className="text-[10px] text-accent">aktiv</span>
                          )}
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setComposerMode('image')}
                          className={`mt-0.5 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${
                            active ? 'bg-soft text-primary' : 'text-muted'
                          }`}
                        >
                          <span>Bildgenerierung</span>
                          {composerMode === 'image' && (
                            <span className="text-[10px] text-accent">aktiv</span>
                          )}
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setComposerMode('upload')}
                          className={`mt-0.5 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${
                            active ? 'bg-soft text-primary' : 'text-muted'
                          }`}
                        >
                          <span>Datei / Foto hochladen</span>
                          {composerMode === 'upload' && (
                            <span className="text-[10px] text-accent">aktiv</span>
                          )}
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t('chat.inputPlaceholder')}
                  className="flex-1 bg-transparent text-base text-primary placeholder:text-muted outline-none border-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={
                      'flex h-9 w-9 items-center justify-center rounded-full ' +
                      (isRecording ? 'bg-soft text-primary' : 'text-muted hover:text-primary')
                    }
                  >
                    <span className="sr-only">
                      {isRecording ? 'Aufnahme beenden' : 'Mikrofon aktivieren'}
                    </span>
                    <MicrophoneIcon aria-hidden="true" className="h-5 w-5" />
                  </button>
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={handleMicCancel}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-on-elevated"
                    >
                      <span className="sr-only">Aufnahme abbrechen</span>
                      <XMarkIcon aria-hidden="true" className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() || isStreaming}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-on-elevated disabled:opacity-40"
                    >
                      <span className="sr-only">Nachricht senden</span>
                      <PaperAirplaneIcon aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t('chat.orchestratorStepsTitle')}
      >
        <div className="space-y-3 text-sm text-on-elevated">
          <div>
            <p className="font-semibold">{t('chat.step1Title')}</p>
            <p className="text-muted">{t('chat.step1Text')}</p>
          </div>
          <div>
            <p className="font-semibold">{t('chat.step2Title')}</p>
            <p className="text-muted">{t('chat.step2Text')}</p>
          </div>
          <div>
            <p className="font-semibold">{t('chat.step3Title')}</p>
            <p className="text-muted">{t('chat.step3Text')}</p>
          </div>
          <div>
            <p className="font-semibold">{t('chat.step4Title')}</p>
            <p className="text-muted">{t('chat.step4Text')}</p>
          </div>
        </div>
      </AppDrawer>
    </AppShell>
  )
}
