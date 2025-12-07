'use client'

import { useEffect, useState } from 'react'

type GreetingCard = {
  id: string
  type: string
  title: string
  subtitle?: string | null
  body?: string | null
  topicTags?: string[] | null
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'

export function NewsSidebarWidget() {
  const [cards, setCards] = useState<GreetingCard[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const resp = await fetch(`${API_BASE_URL}/api/newsmanager/feed`, {
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
      } catch (err) {
        console.error('NewsSidebarWidget error', err)
        if (!cancelled) {
          setError('Konnte News-Feed nicht laden.')
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
      <div className="text-xs text-slate-500">
        News-Feed wird geladen …
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-xs text-amber-700">
        {error}
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-xs text-slate-500">
        Noch keine Empfehlungen verfügbar.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 text-xs">
      {cards.slice(0, 12).map((card) => (
        <article
          key={card.id}
          className="rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-semibold text-slate-900">
              {card.title}
            </span>
            {card.type && (
              <span className="ml-2 shrink-0 rounded-full bg-slate-100 px-2 text-[10px] uppercase tracking-wide text-slate-500">
                {card.type}
              </span>
            )}
          </div>
          {card.subtitle && (
            <p className="line-clamp-2 text-[11px] text-slate-500">
              {card.subtitle}
            </p>
          )}
          {card.body && (
            <p className="mt-1 line-clamp-3 text-[11px] text-slate-600">
              {card.body}
            </p>
          )}
        </article>
      ))}
    </div>
  )
}
