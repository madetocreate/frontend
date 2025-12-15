'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'
import { CodeBlock } from './CodeBlock'
import { InlineCode } from './InlineCode'

type ChatMarkdownProps = {
  content: string
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="w-full max-w-none text-left leading-relaxed text-[var(--ak-color-text-primary)] space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="ak-heading mb-4 mt-6 text-3xl font-bold leading-tight tracking-tight text-gray-900 border-b border-gray-100 pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="ak-heading mb-3 mt-6 text-2xl font-bold leading-tight tracking-tight text-gray-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="ak-subheading mb-2 mt-4 text-xl font-semibold leading-snug tracking-tight text-gray-900">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="ak-body mb-4 mt-0 whitespace-pre-wrap leading-[1.75] text-[16px] text-gray-800">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="ak-body mb-4 mt-0 pl-6 list-disc list-outside space-y-2 leading-[1.75] text-[16px] text-gray-800">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="ak-body mb-4 mt-0 pl-6 list-decimal list-outside space-y-2 leading-[1.75] text-[16px] text-gray-800">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ak-body mb-1 pl-1 leading-[1.75] text-[16px] text-gray-800">{children}</li>
          ),
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', marginBottom: '1rem', marginTop: '0.5rem' }}>
              <table style={{ 
                borderCollapse: 'collapse', 
                width: '100%',
                border: '1px solid var(--ak-color-border-subtle)',
                borderRadius: '8px',
              }}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ backgroundColor: 'var(--ak-color-bg-surface-muted)' }}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr style={{ borderBottom: '1px solid var(--ak-color-border-subtle)' }}>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="ak-body p-3 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="ak-body p-3 align-top">
              {children}
            </td>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            return isInline ? (
              <InlineCode>{children}</InlineCode>
            ) : (
              <code className={clsx(className, "font-mono text-sm")}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <CodeBlock>{children}</CodeBlock>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-[var(--ak-color-accent)] pl-4 text-[var(--ak-color-text-secondary)]">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          a: ({ children, href }) => (
            <a 
              href={href}
              className="text-[var(--ak-color-accent)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
