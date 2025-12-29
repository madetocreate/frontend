'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mail, Users, FileText, CheckSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useIsMarketingVisible } from '@/lib/featureAccess'

export function GlobalCreateFab() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const isMarketingVisible = useIsMarketingVisible()

  const actions = [
    { 
      label: 'Neue Nachricht', 
      icon: Mail, 
      color: 'bg-[var(--ak-color-accent)]', 
      onClick: () => router.push('/inbox?compose=new') 
    },
    ...(isMarketingVisible ? [{ 
      label: 'Neue Kampagne', 
      icon: Mail, 
      color: 'bg-[var(--ak-accent-documents)]', 
      onClick: () => router.push('/marketing/campaigns/new') 
    }] : []),
    { 
      label: 'Neuer Kontakt', 
      icon: Users, 
      color: 'bg-[var(--ak-color-graphite-base)]', 
      onClick: () => router.push('/customers?action=new') 
    },
    { 
      label: 'Neue Notiz', 
      icon: FileText, 
      color: 'bg-[var(--ak-semantic-warning)]', 
      onClick: () => router.push('/kmu/notes?action=new') 
    },
    { 
      label: 'Neue Aufgabe', 
      icon: CheckSquare, 
      color: 'bg-[var(--ak-semantic-success)]', 
      onClick: () => router.push('/tasks?action=new') 
    },
  ]

  return (
    <div 
      className="fixed z-50 flex flex-col items-end gap-4 pointer-events-none"
      style={{
        right: 'calc(1.5rem + env(safe-area-inset-right, 0px))',
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2 pointer-events-auto">
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                className="group flex items-center gap-3 pr-1"
              >
                <span className="px-3 py-1.5 rounded-lg bg-[var(--ak-color-bg-surface-elevated)]/90 text-[var(--ak-color-text-primary)] text-sm font-medium shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center text-[var(--ak-color-text-inverted)] shadow-lg hover:brightness-110 transition-all`}>
                  <action.icon className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto scale-[0.8] origin-bottom-right">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-[var(--ak-color-text-inverted)] transition-colors
            ${isOpen ? 'bg-[var(--ak-color-graphite-base)] hover:bg-[var(--ak-color-graphite-hover)]' : 'bg-[var(--ak-color-graphite-base)] hover:bg-[var(--ak-color-graphite-hover)]'}
          `}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-8 h-8" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  )
}

