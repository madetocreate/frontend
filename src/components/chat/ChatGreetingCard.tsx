'use client'

import React, { useMemo } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  SunIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

import { getDeterministicGreeting } from '@/lib/chatGreeting'

interface ChatGreetingCardProps {
  workspaceId?: string
  className?: string
  onQuickAction?: (actionId: string) => void
}

function SuggestionCard({ 
  icon: Icon, 
  title, 
  desc, 
  onClick 
}: { 
  icon: React.ComponentType<{ className?: string }>, 
  title: string, 
  desc: string, 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] border border-transparent hover:border-[var(--ak-color-border-subtle)] transition-all duration-200 group w-full text-left h-full"
    >
      <div className="flex items-center justify-between w-full mb-2">
        <Icon className="w-5 h-5 text-[var(--ak-color-text-primary)] opacity-80" />
        <ChevronRightIcon className="w-4 h-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-0.5">
        {title}
      </h3>
      <p className="text-xs text-[var(--ak-color-text-secondary)] line-clamp-2">
        {desc}
      </p>
    </button>
  )
}

export function ChatGreetingCard({ workspaceId = 'default', className, onQuickAction }: ChatGreetingCardProps) {
  const router = useRouter()
  
  // Greeting nur einmal pro Render/Tag berechnen
  const greeting = useMemo(() => {
    return getDeterministicGreeting(undefined, workspaceId)
  }, [workspaceId])

  const handleAction = (actionId: string) => {
    if (onQuickAction) {
      onQuickAction(actionId)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={clsx("w-full max-w-[680px] mx-auto px-4", className)}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Header Text */}
        <div className="space-y-2 max-w-lg text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
            {greeting.headline}
          </h2>
        </div>

        {/* Suggestion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          <SuggestionCard
            icon={SunIcon}
            title="Tagesbriefing"
            desc="Verschaffe mir einen Überblick"
            onClick={() => handleAction('daily_briefing')}
          />
          
          <SuggestionCard
            icon={PencilSquareIcon}
            title="Text verfassen"
            desc="Hilf mir beim Schreiben"
            onClick={() => handleAction('draft_content')}
          />
          
          <SuggestionCard
            icon={MagnifyingGlassIcon}
            title="Wissen finden"
            desc="Durchsuche meine Daten"
            onClick={() => handleAction('find_info')}
          />
        </div>
      </div>
    </motion.div>
  )
}
