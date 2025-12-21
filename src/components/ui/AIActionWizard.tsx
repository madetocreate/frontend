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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-2xl opacity-15 animate-pulse" />
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
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
        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
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

function ProcessingStep({ context, action, data, onNext, onUpdate }: WizardStepProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const steps = [
    'Kontext analysieren...',
    'Daten sammeln...',
    'KI-Verarbeitung...',
    'Ergebnis generieren...',
  ]

  useEffect(() => {
    let cancelled = false

    const executeAction = async () => {
      try {
        setCurrentStep(0) // Kontext analysieren
        setProgress(25)

        // Echter Chat-Call zum Backend (nicht Dummy)
        const { sendChatMessage } = await import('@/lib/chatClient')
        
        // Baue Prompt aus Action + Context + Config
        const config = (data.config as { tone?: string; length?: string; language?: string; includeContext?: boolean }) || {}
        const includeContext = config.includeContext !== false
        
        // Context ist ein String (AIActionContext), kein Objekt
        const contextText = typeof context === 'string' ? context : ''
        
        let prompt = action.label
        if (action.description) {
          prompt = `${prompt}: ${action.description}`
        }
        if (includeContext && contextText) {
          prompt = `${prompt}\n\nKontext: ${contextText}`
        }
        if (config.tone) {
          prompt = `${prompt}\n\nTon: ${config.tone}`
        }
        if (config.length) {
          prompt = `${prompt}\n\nLänge: ${config.length}`
        }
        
        // Chat-Call mit channel='ui_action_wizard'
        const response = await sendChatMessage({
          tenantId: 'aklow-main',
          sessionId: `wizard-${action.id}-${Date.now()}`,
          channel: 'ui_action_wizard',
          message: prompt,
          metadata: {
            actionId: action.id,
            actionLabel: action.label,
            config: data.config,
            context: includeContext ? context : undefined,
          },
        })

        setCurrentStep(1) // Daten sammeln
        setProgress(50)
        setCurrentStep(2) // KI-Verarbeitung
        setProgress(75)
        
        // Response ist ChatResponse mit content
        const resultText = response.content || ''
        setResult(resultText)
        setCurrentStep(3) // Ergebnis generieren
        setProgress(100)
        onUpdate({ result: resultText })
        setTimeout(() => onNext(), 500)
      } catch (err) {
        if (cancelled) return
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Action execution failed:', err)
      }
    }

    executeAction()

    return () => {
      cancelled = true
    }
  }, [context, action, data, onNext, onUpdate])

  if (error) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-900 font-medium">Fehler</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null)
            setProgress(0)
            setCurrentStep(0)
            setResult(null)
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-2xl opacity-20 animate-pulse" />
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
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
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
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

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
            <p className="text-xs text-gray-600 font-medium mb-1">Vorschau:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultStep({ data, onBack }: WizardStepProps) {
  const result = data.result as string | undefined

  if (!result) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-gray-600">Kein Ergebnis verfügbar</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Zurück
        </button>
      </div>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      // Optional: Toast-Notification
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleApply = () => {
    // Öffne Artifact im Inspector via CustomEvent
    const event = new CustomEvent('aklow-open-artifact', {
      detail: {
        content: result,
        threadId: `wizard-${Date.now()}`,
      },
    })
    window.dispatchEvent(event)
  }

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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ergebnis</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{result}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            Kopieren
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            Anwenden
          </button>
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

export function AIActionWizard({ isOpen, onClose, context, action }: AIActionWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [wizardData, setWizardData] = useState<Record<string, unknown>>({})

  // Ensure currentStepIndex is within valid range
  const safeStepIndex = Math.max(0, Math.min(currentStepIndex, WIZARD_STEPS.length - 1))
  const currentStep = WIZARD_STEPS[safeStepIndex]
  
  // If no valid step, return null
  if (!currentStep) {
    return null
  }
  
  const StepComponent = currentStep.component
  const progress = ((safeStepIndex + 1) / WIZARD_STEPS.length) * 100

  const handleNext = () => {
    if (safeStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1))
    }
  }

  const handleBack = () => {
    if (safeStepIndex > 0) {
      setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
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
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
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
                    index <= safeStepIndex
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
                key={safeStepIndex}
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

