'use client'

import { useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline'

type BadgeColor = 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery'

type NewsStory = {
  id: string
  image: string
  title: string
  description: string
  category: string
  badgeColor: BadgeColor
  source: string
  age: string
}

type NewsfeedWidgetProps = {
  stories: NewsStory[]
  onStoryClick?: (id: string) => void
}

const BADGE_COLORS: Record<BadgeColor, string> = {
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  discovery: 'bg-purple-100 text-purple-700 border-purple-200',
}

export function NewsfeedWidget({ stories, onStoryClick }: NewsfeedWidgetProps) {
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set())
  const [dislikedStories, setDislikedStories] = useState<Set<string>>(new Set())

  const handleStoryClick = (id: string) => {
    if (onStoryClick) {
      onStoryClick(id)
    }
  }

  const handleLike = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation()
    setLikedStories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(storyId)) {
        newSet.delete(storyId)
      } else {
        newSet.add(storyId)
        setDislikedStories((prev) => {
          const newSet = new Set(prev)
          newSet.delete(storyId)
          return newSet
        })
      }
      return newSet
    })
  }

  const handleDislike = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation()
    setDislikedStories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(storyId)) {
        newSet.delete(storyId)
      } else {
        newSet.add(storyId)
        setLikedStories((prev) => {
          const newSet = new Set(prev)
          newSet.delete(storyId)
          return newSet
        })
      }
      return newSet
    })
  }

  return (
    <div className="flex h-full flex-col gap-3 px-3 py-3">
      {/* Stories List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-3">
          {stories.map((story) => (
            <li key={story.id}>
              <div className="flex w-full flex-col gap-2 rounded-[var(--ak-radius-card)] border border-slate-200 bg-[var(--ak-color-bg-surface)]/80 p-3 shadow-sm backdrop-blur-sm transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-slate-300 hover:bg-[var(--ak-color-bg-surface-muted)]/80 hover:shadow-[var(--ak-shadow-card)]">
                {/* Content oben - klickbarer Bereich */}
                <button
                  type="button"
                  onClick={() => handleStoryClick(story.id)}
                  className="flex w-full flex-col gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-1"
                >
                  {/* Title - vollständig lesbar */}
                  <h3 className="ak-subheading whitespace-normal font-semibold text-[var(--ak-color-text-primary)]">
                    {story.title}
                  </h3>

                  {/* Description */}
                  <p className="ak-body line-clamp-2 text-[var(--ak-color-text-secondary)]">
                    {story.description}
                  </p>
                </button>

                {/* Image und Meta unten */}
                <div className="flex items-end justify-between gap-3">
                  {/* Bild und Meta links */}
                  <div className="flex items-end gap-2">
                    {/* Image unten links - 30% größer */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={story.image}
                        alt={`${story.category} Thumbnail`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    {/* Badge und Source rechts neben dem Bild */}
                    <div className="flex flex-col gap-1">
                      {/* Badge über Source */}
                      <span
                        className={clsx(
                          'text-[10px] inline-flex w-fit items-center rounded-full border px-1.5 py-0.5 font-medium',
                          BADGE_COLORS[story.badgeColor]
                        )}
                      >
                        {story.category}
                      </span>
                      {/* Source und Datum in einer Zeile */}
                      <span className="text-[10px] text-[var(--ak-color-text-muted)]">
                        {story.source} • {story.age}
                      </span>
                    </div>
                  </div>

                  {/* Thumbs up/down Buttons - unten rechts */}
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleLike(e, story.id)}
                      className={clsx(
                        'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                        likedStories.has(story.id)
                          ? 'border-green-300 bg-green-50 text-green-600'
                          : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-muted)] hover:border-green-300 hover:bg-green-50 hover:text-green-600'
                      )}
                      aria-label="Gefällt mir"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDislike(e, story.id)}
                      className={clsx(
                        'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                        dislikedStories.has(story.id)
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-muted)] hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                      )}
                      aria-label="Gefällt mir nicht"
                    >
                      <HandThumbDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

