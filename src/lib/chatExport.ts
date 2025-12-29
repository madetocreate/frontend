/**
 * Chat Export Utilities
 * Exportiert Chat-Konversationen in verschiedene Formate
 */

export interface ExportMessage {
  role: 'user' | 'assistant' | 'system'
  text: string
  timestamp?: number
}

export interface ExportOptions {
  format: 'markdown' | 'json' | 'text'
  includeTimestamps?: boolean
  includeMetadata?: boolean
  title?: string
}

/**
 * Exportiert Nachrichten als Markdown
 */
function toMarkdown(messages: ExportMessage[], options: ExportOptions): string {
  const lines: string[] = []
  
  // Header
  if (options.title) {
    lines.push(`# ${options.title}`)
    lines.push('')
  }
  
  if (options.includeMetadata) {
    lines.push(`_Exportiert am ${new Date().toLocaleString('de-DE')}_`)
    lines.push('')
    lines.push('---')
    lines.push('')
  }
  
  // Messages
  for (const msg of messages) {
    const roleLabel = msg.role === 'user' ? '**Du:**' : '**Assistent:**'
    
    if (options.includeTimestamps && msg.timestamp) {
      const time = new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      lines.push(`${roleLabel} _${time}_`)
    } else {
      lines.push(roleLabel)
    }
    
    lines.push('')
    lines.push(msg.text)
    lines.push('')
    lines.push('---')
    lines.push('')
  }
  
  return lines.join('\n')
}

/**
 * Exportiert Nachrichten als JSON
 */
function toJSON(messages: ExportMessage[], options: ExportOptions): string {
  const exportData = {
    title: options.title || 'Chat Export',
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.text,
      ...(options.includeTimestamps && msg.timestamp ? { timestamp: msg.timestamp } : {})
    }))
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Exportiert Nachrichten als Plain Text
 */
function toText(messages: ExportMessage[], options: ExportOptions): string {
  const lines: string[] = []
  
  if (options.title) {
    lines.push(options.title)
    lines.push('='.repeat(options.title.length))
    lines.push('')
  }
  
  for (const msg of messages) {
    const roleLabel = msg.role === 'user' ? 'Du:' : 'Assistent:'
    
    if (options.includeTimestamps && msg.timestamp) {
      const time = new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      lines.push(`[${time}] ${roleLabel}`)
    } else {
      lines.push(roleLabel)
    }
    
    lines.push(msg.text)
    lines.push('')
    lines.push('-'.repeat(40))
    lines.push('')
  }
  
  return lines.join('\n')
}

/**
 * Exportiert Chat-Nachrichten in das gewählte Format
 */
export function exportChat(messages: ExportMessage[], options: ExportOptions): string {
  switch (options.format) {
    case 'markdown':
      return toMarkdown(messages, options)
    case 'json':
      return toJSON(messages, options)
    case 'text':
      return toText(messages, options)
    default:
      return toMarkdown(messages, options)
  }
}

/**
 * Lädt den exportierten Chat als Datei herunter
 */
export function downloadChat(
  messages: ExportMessage[], 
  options: ExportOptions,
  filename?: string
): void {
  const content = exportChat(messages, options)
  
  const extension = options.format === 'json' ? 'json' : options.format === 'markdown' ? 'md' : 'txt'
  const mimeType = options.format === 'json' ? 'application/json' : 'text/plain'
  
  const finalFilename = filename || `chat-export-${Date.now()}.${extension}`
  
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Kopiert den exportierten Chat in die Zwischenablage
 */
export async function copyChat(messages: ExportMessage[], options: ExportOptions): Promise<void> {
  const content = exportChat(messages, options)
  await navigator.clipboard.writeText(content)
}

