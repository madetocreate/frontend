'use client'

import { useState, useMemo, type ReactNode, type ReactElement, isValidElement } from 'react'
import { ClipboardDocumentIcon, CheckIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { DynamicMermaidDiagram as MermaidDiagram } from './DynamicMermaidDiagram'

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TypeScript React',
  jsx: 'JavaScript React',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  csharp: 'C#',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  sql: 'SQL',
  graphql: 'GraphQL',
  md: 'Markdown',
  markdown: 'Markdown',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Zsh',
  powershell: 'PowerShell',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  nginx: 'Nginx',
  apache: 'Apache',
  toml: 'TOML',
  ini: 'INI',
  env: 'Environment',
  txt: 'Text',
  diff: 'Diff',
  plaintext: 'Text',
}

// Language colors for visual distinction
const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3572A5',
  ruby: '#CC342D',
  go: '#00ADD8',
  rust: '#dea584',
  java: '#b07219',
  php: '#4F5D95',
  swift: '#F05138',
  kotlin: '#A97BFF',
  html: '#e34c26',
  css: '#563d7c',
  json: '#292929',
  yaml: '#cb171e',
  bash: '#89e051',
  sql: '#e38c00',
}

type CodeBlockProps = {
  children?: ReactNode
  className?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ children, className, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Extract language from className (e.g., "language-typescript")
  const language = useMemo(() => {
    if (!className) return null
    const match = className.match(/language-(\w+)/)
    return match ? match[1].toLowerCase() : null
  }, [className])

  const displayLanguage = language ? (LANGUAGE_NAMES[language] || language.toUpperCase()) : 'Code'
  const languageColor = language ? LANGUAGE_COLORS[language] : undefined

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

  const codeText = extractText(children)
  const lines = codeText.split('\n')
  const hasMultipleLines = lines.length > 1

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Check if this is a Mermaid diagram
  if (language === 'mermaid') {
    return <MermaidDiagram className={className}>{children}</MermaidDiagram>
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl ak-codeblock shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between ak-codeblock-header px-4 py-2.5 border-b">
        <div className="flex items-center gap-2">
          {/* Language indicator dot */}
          {languageColor && (
            <span 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: languageColor }}
            />
          )}
          <CodeBracketIcon className="h-3.5 w-3.5 ak-text-code-muted" />
          <span className="text-xs font-medium ak-text-code-secondary">
            {displayLanguage}
          </span>
        </div>
        
        <button
          onClick={handleCopy}
          className={clsx(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all",
            copied 
              ? "ak-badge-success" 
              : "ak-text-code-muted hover:ak-text-code-primary hover:ak-bg-surface-muted"
          )}
        >
          {copied ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              <span>Kopiert!</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-3.5 w-3.5" />
              <span>Kopieren</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code Content */}
      <div className="overflow-x-auto ak-scrollbar-dark">
        <div className="p-4 flex">
          {/* Line Numbers */}
          {showLineNumbers && hasMultipleLines && (
            <div className="flex-shrink-0 pr-4 select-none border-r ak-code-border mr-4">
              {lines.map((_, i) => (
                <div 
                  key={i} 
                  className="font-mono text-[13px] leading-relaxed ak-text-code-secondary text-right"
                  style={{ minWidth: `${String(lines.length).length}ch` }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          
          {/* Code */}
          <pre className="flex-1 font-mono text-[13px] leading-relaxed ak-text-code-primary whitespace-pre">
            {children}
          </pre>
        </div>
      </div>
      
      {/* Line count footer for long code blocks */}
      {lines.length > 10 && (
        <div className="px-4 py-1.5 ak-codeblock-footer border-t text-[10px] ak-text-code-secondary">
          {lines.length} Zeilen
        </div>
      )}
    </div>
  )
}
