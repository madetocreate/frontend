'use client'

import { useState, type ReactNode, type ReactElement, isValidElement } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

type CodeBlockProps = {
  children?: ReactNode
}

export function CodeBlock({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Recursively extract text content from React children
  const extractText = (node: ReactNode): string => {
    if (!node) return ''
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (isValidElement(node)) {
      const element = node as ReactElement<{ children?: ReactNode }>
      return extractText(element.props.children)
    }
    return ''
  }

  const handleCopy = () => {
    const text = extractText(children)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-white/20 bg-gray-900/95 shadow-lg">
      <div className="flex items-center justify-between bg-white/5 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-gray-400">
        <span>Code</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Kopiert</span>
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
        <pre className="font-mono text-[13px] leading-relaxed text-gray-100">
          {children}
        </pre>
      </div>
    </div>
  )
}
