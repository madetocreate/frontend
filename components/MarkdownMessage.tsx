'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownMessageProps = {
  content: string
}

const components: Components = {
  p({ node, children, ...props }) {
    const anyNode: any = node
    const hasBlockChild =
      anyNode &&
      Array.isArray(anyNode.children) &&
      anyNode.children.some((child: any) => child.tagName === 'pre')
    if (hasBlockChild) {
      return <>{children}</>
    }
    return (
      <p className="text-base leading-relaxed text-on-elevated" {...props}>
        {children}
      </p>
    )
  },
  h1({ node, ...props }) {
    return <h1 className="text-xl font-semibold text-on-elevated" {...props} />
  },
  h2({ node, ...props }) {
    return <h2 className="text-lg font-semibold text-on-elevated" {...props} />
  },
  h3({ node, ...props }) {
    return <h3 className="text-base font-semibold text-on-elevated" {...props} />
  },
  ul({ node, ...props }) {
    return (
      <ul
        className="list-disc space-y-1 pl-5 text-base leading-relaxed text-on-elevated"
        {...props}
      />
    )
  },
  ol({ node, ...props }) {
    return (
      <ol
        className="list-decimal space-y-1 pl-5 text-base leading-relaxed text-on-elevated"
        {...props}
      />
    )
  },
  li({ node, ...props }) {
    return <li className="text-base leading-relaxed text-on-elevated" {...props} />
  },
  strong({ node, ...props }) {
    return <strong className="font-semibold text-on-elevated" {...props} />
  },
  em({ node, ...props }) {
    return <em className="italic text-on-elevated" {...props} />
  },
  blockquote({ node, ...props }) {
    return (
      <blockquote
        className="border-l-2 border-subtle pl-3 text-base leading-relaxed text-muted"
        {...props}
      />
    )
  },
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return (
        <code
          className="rounded bg-surface-elevated-soft px-1.5 py-0.5 text-sm font-mono text-on-elevated"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className="font-mono text-on-elevated" {...props}>
        {children}
      </code>
    )
  },
  pre({ node, ...props }) {
    return (
      <pre
        className="max-h-96 overflow-x-auto overflow-y-auto rounded-lg bg-surface-elevated-soft p-3 text-sm"
        {...props}
      />
    )
  },
  a({ node, ...props }) {
    return (
      <a
        className="font-medium text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      />
    )
  },
  hr({ node, ...props }) {
    return <hr className="border-subtle" {...props} />
  },
  table({ node, ...props }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" {...props} />
      </div>
    )
  },
  thead({ node, ...props }) {
    return <thead className="bg-surface-elevated-soft" {...props} />
  },
  th({ node, ...props }) {
    return (
      <th
        className="border-b border-subtle px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted"
        {...props}
      />
    )
  },
  td({ node, ...props }) {
    return <td className="border-b border-subtle px-2 py-1 align-top" {...props} />
  }
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="space-y-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
