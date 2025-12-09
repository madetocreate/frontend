'use client'

import Image from 'next/image'
import clsx from 'clsx'

type NewsStory = {
  id: string
  image: string
  title: string
  description: string
  fullText?: string
  category: string
  badgeColor: 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery'
  source: string
  age: string
}

type NewsDetailPanelProps = {
  story: NewsStory | null
}

const BADGE_COLORS: Record<NewsStory['badgeColor'], string> = {
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  discovery: 'bg-purple-100 text-purple-700 border-purple-200',
}

export function NewsDetailPanel({ story }: NewsDetailPanelProps) {
  if (!story) {
    return (
      <div className="ak-body px-3 py-3 text-slate-500">
        Wähle einen Artikel aus, um Details zu sehen.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 px-3 py-3">
      {/* Header mit Bild */}
      <div className="flex flex-col gap-3">
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={story.image}
            alt={story.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'ak-caption inline-flex items-center rounded-full border px-2 py-0.5 font-medium',
              BADGE_COLORS[story.badgeColor]
            )}
          >
            {story.category}
          </span>
          <span className="ak-caption text-[var(--ak-color-text-muted)]">
            {story.source} • {story.age}
          </span>
        </div>
      </div>

      {/* Titel */}
      <h1 className="ak-heading font-semibold text-[var(--ak-color-text-primary)]">
        {story.title}
      </h1>

      {/* Vollständiger Artikel-Text */}
      <div className="flex-1 overflow-y-auto">
        {story.fullText ? (
          <div className="ak-body whitespace-pre-wrap text-[var(--ak-color-text-primary)] leading-relaxed">
            {story.fullText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="ak-body whitespace-pre-wrap text-[var(--ak-color-text-primary)] leading-relaxed">
            {story.description}
          </p>
        )}
      </div>
    </div>
  )
}

