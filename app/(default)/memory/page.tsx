import Link from 'next/link'
import type { Metadata } from 'next'
import { getMemorySpaces } from '@/lib/memory-data'

export const metadata: Metadata = {
  title: 'Speicher & Memory',
}

export default async function MemoryIndexPage() {
  const spaces = getMemorySpaces()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Speicher &amp; Memory</h1>
          <p className="mt-2 text-sm text-muted">
            Verwalte die wichtigsten Wissensbereiche deines Assistenten: Profile, Business-Kontext, private Notizen
            und Chat-Verlauf.
          </p>
        </div>
      </div>
      <ul className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {spaces.map((space) => (
          <li key={space.id}>
            <Link
              href={`/memory/${space.id}`}
              className="flex h-full flex-col rounded-xl border border-soft bg-app p-4 shadow-sm transition hover:border-blue-500 hover:shadow-md"
            >
              <div className="mb-3 h-20 w-full rounded-lg bg-gradient-to-br from-blue-500/80 to-indigo-600/80" />
              <div className="space-y-1.5">
                <div className="text-base font-semibold text-foreground">{space.name}</div>
                <p className="text-xs text-muted">{space.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
