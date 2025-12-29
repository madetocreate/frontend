'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// import remarkMath from 'remark-math'
// import rehypeKatex from 'rehype-katex'
// import 'katex/dist/katex.min.css'
import clsx from 'clsx'
import { CodeBlock } from './CodeBlock'
import { InlineCode } from './InlineCode'
import { MemoryInlineChip } from './MemoryInlineChip'
import { injectMemoryMarkersToLinks } from './normalizeChatMarkdown'

type ChatMarkdownProps = {
  content: string
  tenantId?: string
}

export function ChatMarkdown({ content, tenantId }: ChatMarkdownProps) {
  const processed = injectMemoryMarkersToLinks(content)

  return (
    <div className="w-full max-w-none text-left leading-relaxed text-[var(--ak-color-text-primary)] space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="ak-heading mb-4 mt-6 text-3xl font-bold leading-tight tracking-tight ak-text-primary border-b ak-border-default pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="ak-heading mb-3 mt-6 text-2xl font-bold leading-tight tracking-tight ak-text-primary">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="ak-subheading mb-2 mt-4 text-xl font-semibold leading-snug tracking-tight ak-text-primary">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="ak-body mb-4 mt-0 whitespace-pre-wrap leading-[1.75] text-[16px] text-[var(--ak-color-text-primary)]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="ak-body mb-4 mt-0 pl-6 list-disc list-outside space-y-2 leading-[1.75] text-[16px] text-[var(--ak-color-text-primary)]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="ak-body mb-4 mt-0 pl-6 list-decimal list-outside space-y-2 leading-[1.75] text-[16px] text-[var(--ak-color-text-primary)]">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ak-body mb-1 pl-1 leading-[1.75] text-[16px] text-[var(--ak-color-text-primary)]">{children}</li>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto ak-scrollbar rounded-xl border ak-border-default shadow-sm">
              <table className="min-w-full divide-y divide-[var(--ak-color-border-subtle)]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--ak-color-bg-surface-muted)]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[var(--ak-color-bg-hover)] transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ak-text-secondary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm ak-text-secondary align-top whitespace-normal break-words">
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
          pre: ({ children, node }) => {
            // Extract language from the code element inside pre
            const codeElement = node?.children?.find(
              (child: any) => 'tagName' in child && child.tagName === 'code'
            ) as any
            const className = codeElement?.properties?.className?.[0]
            return <CodeBlock className={className}>{children}</CodeBlock>
          },
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
          a: ({ children, href }) => {
            if (href?.startsWith('aklow-mem://')) {
              try {
                const id = decodeURIComponent(href.replace('aklow-mem://', ''))
                // P0 Fix: Type-safe access to children array
                const childrenArray = Array.isArray(children) ? children : [children]
                const label = typeof childrenArray[0] === 'string' ? childrenArray[0] : 'Memory'
                return <MemoryInlineChip id={id} label={label} tenantId={tenantId} />
              } catch {
                // Fallback auf normalen Link
              }
            }
            return (
              <a 
                href={href}
                className="text-[var(--ak-color-accent)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              decoding="async"
              className="max-w-full h-auto rounded-lg my-4"
              style={{
                contentVisibility: 'auto',
                containIntrinsicSize: 'auto 400px',
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
              {...props}
            />
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
