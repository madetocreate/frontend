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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

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
      </div>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
            Fortschritt
          </span>
          <span className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
            {completedCount} von {totalCount} abgeschlossen
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
                    ? 'border-green-200 bg-green-50/50'
                    : status === 'current'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                )}
              >
                {/* Status Indicator */}
                <div className="absolute top-4 right-4">
                  {status === 'completed' ? (
                    <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
                  ) : status === 'current' ? (
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                {/* Icon */}
                <div
                  className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                    status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : status === 'current'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
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
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                    Erforderlich
                  </span>
                )}

                {/* Arrow */}
                <div
                  className={clsx(
                    'absolute bottom-4 right-4 transition-transform group-hover:translate-x-1',
                    status === 'completed' ? 'text-green-600' : 'text-gray-400'
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
          className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 text-center"
        >
          <CheckCircleIconSolid className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)] mb-2">
            Alles erledigt! 🎉
          </h3>
          <p className="text-[var(--ak-color-text-secondary)]">
            Du hast die Einrichtung abgeschlossen. Du kannst jetzt alle Features von Aklow nutzen!
          </p>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-[var(--ak-color-text-secondary)] text-center">
          <strong>Tipp:</strong> Du kannst jederzeit zu diesen Einstellungen zurückkehren, um
          Änderungen vorzunehmen.
        </p>
      </div>
    </div>
  )
}

