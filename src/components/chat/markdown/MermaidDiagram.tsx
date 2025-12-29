'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import DOMPurify from 'isomorphic-dompurify'

type MermaidDiagramProps = {
  children?: React.ReactNode
  className?: string
}

export function MermaidDiagram({ children, className }: MermaidDiagramProps) {
  const [copied, setCopied] = useState(false)
  const diagramRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Extract text content from React children
  const extractText = (node: React.ReactNode): string => {
    if (!node) return ''
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (typeof node === 'object' && 'props' in node) {
      return extractText((node as any).props.children)
    }
    return ''
  }

  const codeContent = extractText(children).trim()

  useEffect(() => {
    if (!codeContent || !diagramRef.current) return

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict', // SECURITY: Prevent script injection
      htmlLabels: false, // SECURITY: Disable HTML labels to prevent XSS
      fontFamily: 'inherit',
    })

    const renderDiagram = async () => {
      try {
        setError(null)
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const { svg } = await mermaid.render(id, codeContent)
        
        // SECURITY: Sanitize SVG before DOM insertion to prevent XSS
        // DOMPurify with SVG profile removes script tags and event handlers
        const sanitizedSvg = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ['foreignObject'], // Allow foreignObject for complex diagrams
          ADD_ATTR: ['viewBox', 'preserveAspectRatio'], // Allow essential SVG attributes
        })
        
        if (diagramRef.current) {
          diagramRef.current.innerHTML = sanitizedSvg
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Mermaid rendering error:', err)
      }
    }

    renderDiagram()
  }, [codeContent])

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-white/20 bg-[var(--ak-color-graphite-surface)]/95 shadow-lg">
      <div className="flex items-center justify-between bg-white/5 px-4 py-2 text-[10px] font-medium uppercase tracking-widest ak-text-muted">
        <div className="flex items-center gap-2">
          <span>Mermaid Diagram</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:ak-text-primary transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3 text-[var(--ak-semantic-success)]" />
              <span className="text-[var(--ak-semantic-success)]">Kopiert</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-3 w-3" />
              <span>Kopieren</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto ak-scrollbar-dark">
        {error ? (
          <div className="text-sm text-[var(--ak-semantic-danger)] p-4 bg-[var(--ak-semantic-danger-soft)] rounded-lg">
            <p className="font-medium mb-1">Fehler beim Rendern des Diagramms:</p>
            <pre className="text-xs whitespace-pre-wrap">{error}</pre>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs opacity-75">Mermaid-Code anzeigen</summary>
              <pre className="mt-2 text-xs font-mono bg-black/20 p-2 rounded overflow-x-auto">{codeContent}</pre>
            </details>
          </div>
        ) : (
          <div ref={diagramRef} className="flex items-center justify-center min-h-[200px]" />
        )}
      </div>
    </div>
  )
}

