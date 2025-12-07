'use client'

import { useEffect, useState } from 'react'

type CardSource = {
  name: string
  url: string
}

type CardAction = {
  id: string
  type: 'open_chat' | 'open_url' | 'feedback'
  label: string
  url?: string | null
}

type GreetingCard = {
  id: string
  type: string
  title: string
  subtitle?: string | null
  body?: string | null
  topicTags?: string[] | null
  priority?: number | null
  source?: CardSource | null
  imageUrl?: string | null
  imagePrompt?: string | null
  actions?: CardAction[] | null
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'

export function NewsGreetingWidget() {
  const [cards, setCards] = useState<GreetingCard[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const url = `${API_BASE_URL}/api/newsmanager/feed`
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`)
        }
        const data = (await resp.json()) as any
        const list: GreetingCard[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.cards)
          ? data.cards
          : []
        if (!cancelled) {
          setCards(list)
        }
      } catch (err: any) {
        console.error('NewsGreetingWidget error', err)
        if (!cancelled) {
          setError('Fehler beim Laden der News')
          setCards([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-4 text-sm text-slate-500">
        Persönliche News werden geladen…
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        {error}
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-4 text-sm text-slate-500">
        Noch keine Empfehlungen – starte ein Gespräch, damit ich deine Interessen besser kennenlerne.
      </div>
    )
  }

  return (
    <section className="border-b border-slate-200 bg-slate-50/60 px-6 py-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Dein persönlicher Start
          </h2>
          <p className="text-xs text-slate-500">
            Mischung aus KI-News, Projekten und Themen, die zu dir passen.
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.slice(0, 6).map((card) => (
          <article
            key={card.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white/80 p-3 text-sm shadow-sm backdrop-blur"
          >
            {card.imageUrl && (
              <div className="mb-2 overflow-hidden rounded-lg">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-28 w-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex rounded-full bg-slate-100 px-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {card.type}
                </span>
                {card.source?.name && (
                  <span className="text-[11px] text-slate-400">
                    {card.source.name}
                  </span>
                )}
              </div>
              <h3 className="line-clamp-2 text-[13px] font-semibold text-slate-900">
                {card.title}
              </h3>
              {card.subtitle && (
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                  {card.subtitle}
                </p>
              )}
              {card.body && (
                <p className="mt-2 line-clamp-3 text-[12px] text-slate-700">
                  {card.body}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
