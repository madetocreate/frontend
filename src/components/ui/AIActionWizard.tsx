'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, SparklesIcon, CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import type { AIAction, AIActionContext } from './AIActions'

interface AIActionWizardProps {
  isOpen: boolean
  onClose: () => void
  context: AIActionContext
  action: AIAction
}

type WizardStep = {
  id: string
  title: string
  description: string
  component: React.ComponentType<WizardStepProps>
}

interface WizardStepProps {
  context: AIActionContext
  action: AIAction
  data: Record<string, unknown>
  onUpdate: (data: Record<string, unknown>) => void
  onNext: () => void
  onBack: () => void
}

// Step Components
function OverviewStep({ action, onNext }: WizardStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-2xl opacity-20 animate-pulse" />
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
          <SparklesIcon className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-gray-900">{action.label}</h3>
        {action.description && (
          <p className="text-gray-600 max-w-md">{action.description}</p>
        )}
      </div>
      
      <div className="w-full max-w-md space-y-3 pt-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Die KI analysiert den Kontext und führt die Aktion schrittweise aus.
          </p>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
      >
        Starten
        <ArrowRightIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

function ConfigurationStep({ data, onUpdate, onNext, onBack }: WizardStepProps) {
  const [config, setConfig] = useState((data.config as { tone: string; length: string; language: string; includeContext: boolean }) || {
    tone: 'professionell',
    length: 'mittel',
    language: 'de',
    includeContext: true,
  })

  const updateConfig = (key: string, value: string | boolean) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onUpdate({ ...data, config: newConfig })
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Konfiguration</h3>
        <p className="text-sm text-gray-600">Passen Sie die Einstellungen für diese Aktion an</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ton</label>
          <div className="grid grid-cols-3 gap-2">
            {['professionell', 'freundlich', 'locker'].map((tone) => (
              <button
                key={tone}
                onClick={() => updateConfig('tone', tone)}
                className={clsx(
                  'px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                  config.tone === tone
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Länge</label>
          <div className="grid grid-cols-3 gap-2">
            {['kurz', 'mittel', 'detailliert'].map((length) => (
              <button
                key={length}
                onClick={() => updateConfig('length', length)}
                className={clsx(
                  'px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                  config.length === length
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                {length}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sprache</label>
          <select
            value={config.language}
            onChange={(e) => updateConfig('language', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="includeContext"
            checked={config.includeContext}
            onChange={(e) => updateConfig('includeContext', e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="includeContext" className="text-sm text-gray-700">
            Kontext aus aktueller Ansicht einbeziehen
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Zurück
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
        >
          Weiter
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

function ProcessingStep({ onNext }: WizardStepProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    'Kontext analysieren...',
    'Daten sammeln...',
    'KI-Verarbeitung...',
    'Ergebnis generieren...',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => onNext(), 500)
          return 100
        }
        return prev + 2
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [onNext, steps.length])

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-2xl opacity-30 animate-pulse" />
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <SparklesIcon className="h-10 w-10 text-white" />
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{steps[currentStep]}</span>
            <span className="text-gray-500 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="space-y-2 pt-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={clsx(
                'flex items-center gap-3 text-sm transition-all',
                index < currentStep
                  ? 'text-green-600'
                  : index === currentStep
                  ? 'text-purple-600 font-medium'
                  : 'text-gray-400'
              )}
            >
              {index < currentStep ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <div className={clsx(
                  'h-5 w-5 rounded-full border-2',
                  index === currentStep
                    ? 'border-purple-500 bg-purple-100'
                    : 'border-gray-300'
                )} />
              )}
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultStep({ onBack }: WizardStepProps) {
  const [result] = useState({
    title: 'Ergebnis generiert',
    content: 'Die KI-Aktion wurde erfolgreich ausgeführt. Hier ist das Ergebnis...',
    actions: [
      { label: 'Anwenden', action: 'apply' },
      { label: 'Bearbeiten', action: 'edit' },
      { label: 'Kopieren', action: 'copy' },
    ],
  })

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
        <div>
          <h3 className="font-semibold text-green-900">Erfolgreich abgeschlossen</h3>
          <p className="text-sm text-green-700">Die Aktion wurde erfolgreich ausgeführt</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{result.title}</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.content}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {result.actions.map((action, index) => (
            <button
              key={index}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                index === 0
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Schließen
        </button>
      </div>
    </div>
  )
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'overview',
    title: 'Übersicht',
    description: 'KI-Aktion starten',
    component: OverviewStep,
  },
  {
    id: 'configuration',
    title: 'Konfiguration',
    description: 'Einstellungen anpassen',
    component: ConfigurationStep,
  },
  {
    id: 'processing',
    title: 'Verarbeitung',
    description: 'KI arbeitet...',
    component: ProcessingStep,
  },
  {
    id: 'result',
    title: 'Ergebnis',
    description: 'Fertig',
    component: ResultStep,
  },
]

export function AIActionWizard({ isOpen, onClose, action }: AIActionWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [wizardData, setWizardData] = useState<Record<string, unknown>>({})

  const currentStep = WIZARD_STEPS[currentStepIndex]
  const StepComponent = currentStep.component
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100

  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    } else {
      onClose()
    }
  }

  const handleUpdate = (data: Record<string, unknown>) => {
    setWizardData((prev) => ({ ...prev, ...data }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{action.label}</h2>
                  <p className="text-sm text-white/80">{currentStep.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {WIZARD_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={clsx(
                    'h-2 rounded-full transition-all',
                    index <= currentStepIndex
                      ? 'bg-white w-8'
                      : 'bg-white/30 w-2'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <StepComponent
                  context={context}
                  action={action}
                  data={wizardData}
                  onUpdate={handleUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

