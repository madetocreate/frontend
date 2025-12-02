import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMemory, getMemorySpace } from '@/lib/memory-data'

export const metadata: Metadata = {
  title: 'Memory-Detail',
}

export default function MemoryDetailPage({ params }: { params: { spaceId: string; memoryId: string } }) {
  const { spaceId, memoryId } = params
  const space = getMemorySpace(spaceId)
  const memory = getMemory(spaceId, memoryId)

  if (!space || !memory) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="max-lg:hidden">
        <Link
          href={`/memory/${space.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-soft px-2 py-0.5 text-xs text-foreground">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {space.name}
          </span>
          <span>zurück zur Übersicht</span>
        </Link>
      </div>

      <div className="mt-2 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{memory.title}</h1>
        <p className="text-sm text-muted">{memory.summary}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Originalinhalt</h2>
          <div className="rounded-xl border border-soft bg-app p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {memory.content}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Metadaten</h2>
          <dl className="space-y-2 rounded-xl border border-soft bg-app p-4 text-xs text-muted">
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-foreground">ID</dt>
              <dd className="text-right break-all">{memory.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-foreground">Bereich</dt>
              <dd className="text-right">{space.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-foreground">Typ</dt>
              <dd className="text-right">{memory.sourceType}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-foreground">Quelle</dt>
              <dd className="text-right">{memory.sourceLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-foreground">Erstellt</dt>
              <dd className="text-right">{memory.createdAt}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-foreground">Zuletzt aktualisiert</dt>
              <dd className="text-right">{memory.updatedAt}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
