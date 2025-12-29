'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRightIcon,
  SparklesIcon,
  LightBulbIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { getOnboardingProgress, trackOnboardingStep, type OnboardingProgress } from '@/lib/settingsClient'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  required?: boolean
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Willkommen bei Aklow',
    description: 'Erstelle dein Profil und starte deine Reise',
    icon: SparklesIcon,
    category: 'Einführung',
    required: true,
  },
  {
    id: 'profile',
    title: 'Profil einrichten',
    description: 'Vervollständige deine Kontaktdaten und Präferenzen',
    icon: UserGroupIcon,
    category: 'Einführung',
    required: true,
  },
  {
    id: 'integrations',
    title: 'Integrationen verbinden',
    description: 'Verbinde Gmail, Kalender und andere Dienste',
    icon: PuzzlePieceIcon,
    category: 'Integrationen',
    required: false,
  },
  {
    id: 'ai-settings',
    title: 'KI-Einstellungen',
    description: 'Passe das Verhalten der KI an deine Bedürfnisse an',
    icon: LightBulbIcon,
    category: 'Konfiguration',
    required: false,
  },
  {
    id: 'preferences',
    title: 'Einstellungen',
    description: 'Wähle deine bevorzugte Sprache, Design und Benachrichtigungen',
    icon: Cog6ToothIcon,
    category: 'Konfiguration',
    required: false,
  },
]

export function SettingsOnboarding({ mode: _mode }: { mode?: 'simple' | 'expert' }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<string | null>(null)

  const loadProgress = async () => {
    setLoading(true)
    const data = await getOnboardingProgress()
    setProgress(data)
    setLoading(false)
  }

   
  useEffect(() => {
    void loadProgress()
  }, [])

  const getStepStatus = (stepId: string): 'completed' | 'pending' | 'current' => {
    if (!progress) return 'pending'
    
    const step = progress.steps.find(s => s.step_id === stepId)
    if (step?.completed) return 'completed'
    if (currentStep === stepId) return 'current'
    return 'pending'
  }

  const handleStepClick = async (step: OnboardingStep) => {
    setCurrentStep(step.id)
    
    // Wenn noch nicht abgeschlossen, markiere als abgeschlossen
    const status = getStepStatus(step.id)
    if (status !== 'completed') {
      const success = await trackOnboardingStep({
        step_id: step.id,
        step_name: step.title,
        completed: true,
      })
      
      if (success) {
        await loadProgress()
        
        // Wenn alle Schritte abgeschlossen, markiere Onboarding als komplett
        if (progress && progress.completed_count + 1 === totalCount) {
          localStorage.setItem('aklow_onboarding_complete', 'true')
        }
        
        // Navigate to relevant settings page based on step
        if (step.id === 'integrations') {
          router.push('/settings?view=integrations')
        } else if (step.id === 'ai-settings') {
          router.push('/settings?view=ai')
        } else if (step.id === 'preferences') {
          router.push('/settings?view=general')
        }
      }
    }
  }

  const completedCount = progress?.completed_count || 0
  const totalCount = ONBOARDING_STEPS.length
  const progressPercent = progress?.progress_percent || 0

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-semantic-info)]" />
      </div>
    )
  }

  const handleStartWizard = () => {
    window.dispatchEvent(new CustomEvent('aklow-restart-onboarding'));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
          Willkommen bei Aklow! 👋
        </h2>
        <p className="text-[var(--ak-color-text-secondary)]">
          Lass uns gemeinsam dein Profil einrichten. Dies dauert nur wenige Minuten.
        </p>
        <button
          onClick={handleStartWizard}
          className="mt-4 px-6 py-3 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Wizard starten
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-[var(--ak-color-bg-surface)]/60 backdrop-blur-2xl rounded-2xl border border-[var(--ak-color-border-subtle)] p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
            Fortschritt
          </span>
          <span className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
            {completedCount} von {totalCount} abgeschlossen
          </span>
        </div>
        <div className="w-full bg-[var(--ak-color-bg-surface-muted)] rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        <p className="text-xs text-[var(--ak-color-text-secondary)] mt-2">
          {progressPercent < 50 && 'Du hast gerade erst angefangen!'}
          {progressPercent >= 50 && progressPercent < 100 && 'Du machst gute Fortschritte!'}
          {progressPercent === 100 && 'Perfekt! Du bist startklar! 🎉'}
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {ONBOARDING_STEPS.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon

            return (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleStepClick(step)}
                className={clsx(
                  'relative p-6 rounded-2xl border-2 transition-all text-left group',
                  'bg-white/60 backdrop-blur-2xl',
                  status === 'completed'
                    ? 'border-[var(--ak-color-success-strong)]/30 bg-[var(--ak-semantic-success-soft)]'
                    : status === 'current'
                    ? 'border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)] ring-2 ring-[var(--ak-color-accent-soft)]'
                    : 'border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] hover:ak-shadow-md'
                )}
              >
                {/* Status Indicator */}
                <div className="absolute top-4 right-4">
                  {status === 'completed' ? (
                    <CheckCircleIconSolid className="h-6 w-6 text-[var(--ak-semantic-success)]" />
                  ) : status === 'current' ? (
                    <div className="h-6 w-6 rounded-full bg-[var(--ak-semantic-info)] flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-[var(--ak-color-bg-surface)] animate-pulse" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-[var(--ak-color-border-subtle)]" />
                  )}
                </div>

                {/* Icon */}
                <div
                  className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                    status === 'completed'
                      ? 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]'
                      : status === 'current'
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] group-hover:bg-[var(--ak-color-accent-soft)] group-hover:text-[var(--ak-color-accent)]'
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)] mb-3">
                  {step.description}
                </p>

                {/* Badge */}
                {step.required && (
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)] border border-[color-mix(in oklab,var(--ak-semantic-info) 40%,var(--ak-color-border-fine) 60%)]">
                    Erforderlich
                  </span>
                )}

                {/* Arrow */}
                <div
                  className={clsx(
                    'absolute bottom-4 right-4 transition-transform group-hover:translate-x-1',
                    status === 'completed' ? 'text-[var(--ak-semantic-success)]' : 'text-[var(--ak-color-text-muted)]'
                  )}
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Completion Message */}
      {progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[var(--ak-semantic-success-soft)] to-[var(--ak-semantic-info-soft)] border border-[color-mix(in oklab,var(--ak-semantic-success) 40%,var(--ak-color-border-fine) 60%)] rounded-2xl p-6 text-center"
        >
          <CheckCircleIconSolid className="h-12 w-12 text-[var(--ak-semantic-success)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)] mb-2">
            Alles erledigt! 🎉
          </h3>
          <p className="text-[var(--ak-color-text-secondary)]">
            Du hast die Einrichtung abgeschlossen. Du kannst jetzt alle Features von Aklow nutzen!
          </p>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="bg-[var(--ak-semantic-info-soft)]/50 border border-[color-mix(in oklab,var(--ak-semantic-info) 40%,var(--ak-color-border-fine) 60%)] rounded-xl p-4">
        <p className="text-sm text-[var(--ak-color-text-secondary)] text-center">
          <strong>Tipp:</strong> Du kannst jederzeit zu diesen Einstellungen zurückkehren, um
          Änderungen vorzunehmen.
        </p>
      </div>
    </div>
  )
}

