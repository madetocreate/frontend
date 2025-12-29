'use client'

import { motion } from 'framer-motion'

/**
 * Skeleton-Loader für Chat-Threads in der Sidebar
 */
export function ChatThreadSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 px-2">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          className="flex items-center gap-3 px-3 py-3 rounded-lg"
        >
          {/* Icon */}
          <div 
            className="h-5 w-5 rounded-md bg-[var(--ak-color-bg-surface-muted)] animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Title */}
            <div 
              className="h-3.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] animate-pulse"
              style={{ 
                width: `${70 + Math.random() * 25}%`,
                animationDelay: `${i * 100 + 50}ms` 
              }}
            />
            
            {/* Preview/Subtitle - optional */}
            {i % 2 === 0 && (
              <div 
                className="h-2.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] animate-pulse opacity-60"
                style={{ 
                  width: `${50 + Math.random() * 30}%`,
                  animationDelay: `${i * 100 + 100}ms` 
                }}
              />
            )}
          </div>
          
          {/* Time Badge - optional */}
          {i % 3 === 0 && (
            <div 
              className="h-2.5 w-10 rounded-full bg-[var(--ak-color-bg-surface-muted)] animate-pulse opacity-50"
              style={{ animationDelay: `${i * 100 + 150}ms` }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Skeleton für einen einzelnen Chat-Thread
 */
export function SingleThreadSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-lg animate-pulse">
      <div className="h-5 w-5 rounded-md bg-[var(--ak-color-bg-surface-muted)]" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded-full bg-[var(--ak-color-bg-surface-muted)]" />
        <div className="h-2.5 w-1/2 rounded-full bg-[var(--ak-color-bg-surface-muted)] opacity-60" />
      </div>
    </div>
  )
}

/**
 * Skeleton für Projekte in der Sidebar
 */
export function ProjectSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1 px-2">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.2 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
        >
          {/* Chevron */}
          <div 
            className="h-3 w-3 rounded-sm bg-[var(--ak-color-bg-surface-muted)] animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
          
          {/* Folder Icon */}
          <div 
            className="h-4 w-4 rounded-md bg-[var(--ak-color-bg-surface-muted)] animate-pulse"
            style={{ animationDelay: `${i * 80 + 40}ms` }}
          />
          
          {/* Name */}
          <div 
            className="h-3 flex-1 rounded-full bg-[var(--ak-color-bg-surface-muted)] animate-pulse"
            style={{ 
              width: `${60 + Math.random() * 30}%`,
              animationDelay: `${i * 80 + 80}ms` 
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Vollständiges Sidebar-Skeleton mit Projekten und Chats
 */
export function ChatSidebarSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Skeleton */}
      <div className="px-4 py-3 border-b border-[var(--ak-color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 rounded-md bg-[var(--ak-color-bg-surface-muted)] animate-pulse" />
          <div className="h-7 w-24 rounded-md bg-[var(--ak-color-bg-surface-muted)] animate-pulse" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden py-4 space-y-6">
        {/* Projects Section */}
        <div>
          <div className="px-4 mb-2">
            <div className="h-3 w-16 rounded-full bg-[var(--ak-color-bg-surface-muted)] animate-pulse opacity-60" />
          </div>
          <ProjectSkeleton count={2} />
        </div>
        
        {/* Chats Section */}
        <div>
          <div className="px-4 mb-2">
            <div className="h-3 w-12 rounded-full bg-[var(--ak-color-bg-surface-muted)] animate-pulse opacity-60" />
          </div>
          <ChatThreadSkeleton count={6} />
        </div>
      </div>
      
      {/* Footer Skeleton */}
      <div className="px-4 py-3 border-t border-[var(--ak-color-border-subtle)]">
        <div className="h-8 w-full rounded-md bg-[var(--ak-color-bg-surface-muted)] animate-pulse opacity-50" />
      </div>
    </div>
  )
}

