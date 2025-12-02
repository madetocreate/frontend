import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMemorySpace, getSpaceMemories } from '@/lib/memory-data'

export const metadata: Metadata = {
  title: 'Memory-Bereich',
}

export default function MemorySpacePage({ params }: { params: { spaceId: string } }) {
  const { spaceId } = params
  const space = getMemorySpace(spaceId)
  const memories = getSpaceMemories(spaceId)

  if (!space) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500/80 to-indigo-600/80" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{space.name}</h1>
            <p className="mt-1 text-sm text-muted">{space.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Erinnerungen</h2>
        <div className="overflow-hidden rounded-xl border border-soft bg-app">
          <table className="min-w-full text-sm">
            <thead className="bg-soft/60 text-xs font-medium uppercase text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Titel</th>
                <th className="px-4 py-3 text-left">Typ</th>
                <th className="px-4 py-3 text-left">Quelle</th>
                <th className="px-4 py-3 text-left">Zuletzt aktualisiert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft">
              {memories.map((memory) => (
                <tr key={memory.id} className="hover:bg-soft/60">
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/memory/${space.id}/${memory.id}`}
                      className="font-medium text-foreground hover:text-blue-600"
                    >
                      {memory.title}
                    </Link>
                    <div className="mt-1 text-xs text-muted line-clamp-1">{memory.summary}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted align-top">{memory.sourceType}</td>
                  <td className="px-4 py-3 text-xs text-muted align-top">{memory.sourceLabel}</td>
                  <td className="px-4 py-3 text-xs text-muted align-top">{memory.updatedAt}</td>
                </tr>
              ))}
              {memories.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-muted" colSpan={4}>
                    Noch keine Erinnerungen in diesem Bereich.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
