'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

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
          credentials: 'include',
        })
        // 401: nicht eingeloggt oder keine Berechtigung – im UI ruhig behandeln
        if (resp.status === 401) {
          if (!cancelled) {
            // Keine harten Fehler im Banner, einfach „noch keine Empfehlungen“ zeigen
            setCards([])
            setError(null)
          }
          return
        }
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`)
        }
        const data: unknown = await resp.json()
        const list: GreetingCard[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { cards?: unknown })?.cards)
          ? ((data as { cards: GreetingCard[] }).cards ?? [])
          : []
        if (!cancelled) {
          setCards(list)
        }
      } catch (err: unknown) {
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
      <div className="border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-6 py-4 ak-body text-[var(--ak-color-text-muted)]">
        Persönliche News werden geladen…
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-6 py-4 ak-body text-[var(--ak-color-warning)]">
        {error}
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-6 py-4 ak-body text-[var(--ak-color-text-muted)]">
        Noch keine Empfehlungen – starte ein Gespräch, damit ich deine Interessen besser kennenlerne.
      </div>
    )
  }

  return (
    <section className="border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-6 py-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="ak-subheading font-semibold">
            Dein persönlicher Start
          </h2>
          <p className="ak-caption mt-0.5 text-[var(--ak-color-text-secondary)]">
            Mischung aus KI-News, Projekten und Themen, die zu dir passen.
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.slice(0, 2).map((card) => (
          <article
            key={card.id}
            className="flex flex-col rounded-[var(--ak-radius-card)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3 shadow-none"
          >
            {card.imageUrl && (
              <div className="mb-2 overflow-hidden rounded-lg">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  width={800}
                  height={320}
                  className="h-28 w-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="ak-caption inline-flex rounded-full bg-[var(--ak-color-bg-surface-muted)] px-2 font-medium uppercase tracking-wide text-[var(--ak-color-text-muted)]">
                  {card.type}
                </span>
                {card.source?.name && (
                  <span className="ak-caption text-[var(--ak-color-text-muted)]">
                    {card.source.name}
                  </span>
                )}
              </div>
              <h3 className="ak-body line-clamp-2 font-semibold">
                {card.title}
              </h3>
              {card.subtitle && (
                <p className="ak-caption mt-1 line-clamp-2 text-[var(--ak-color-text-secondary)]">
                  {card.subtitle}
                </p>
              )}
              {card.body && (
                <p className="ak-caption mt-2 line-clamp-3 text-[var(--ak-color-text-secondary)]">
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
