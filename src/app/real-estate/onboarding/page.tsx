'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

type OnboardingStep = 'welcome' | 'properties' | 'leads' | 'calendar' | 'documents' | 'complete'

export default function RealEstateOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())

  const steps = [
    { 
      id: 'welcome' as OnboardingStep, 
      title: 'Willkommen', 
      description: 'Erste Schritte mit Ihrer Immobilien-Verwaltung',
      icon: CheckCircleIcon
    },
    { 
      id: 'properties' as OnboardingStep, 
      title: 'Immobilien verwalten', 
      description: 'Erfahren Sie, wie Sie Immobilien anlegen und verwalten',
      icon: BuildingOfficeIcon
    },
    { 
      id: 'leads' as OnboardingStep, 
      title: 'Leads verwalten', 
      description: 'Lernen Sie die Lead-Verwaltung kennen',
      icon: UserGroupIcon
    },
    { 
      id: 'calendar' as OnboardingStep, 
      title: 'Besichtigungen planen', 
      description: 'Organisieren Sie Besichtigungstermine',
      icon: CalendarIcon
    },
    { 
      id: 'documents' as OnboardingStep, 
      title: 'Exposés erstellen', 
      description: 'Erstellen Sie professionelle Exposés',
      icon: DocumentTextIcon
    },
    { 
      id: 'complete' as OnboardingStep, 
      title: 'Fertig!', 
      description: 'Sie sind bereit!',
      icon: CheckCircleIcon
    },
  ]

  const handleStepComplete = (step: OnboardingStep) => {
    setCompletedSteps(new Set([...completedSteps, step]))
    const stepOrder: OnboardingStep[] = ['welcome', 'properties', 'leads', 'calendar', 'documents', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleSkip = () => {
    router.push('/real-estate')
  }

  const currentStepData = steps.find(s => s.id === currentStep)!

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            Überspringen →
          </button>
          <h1 className="text-3xl font-bold mb-2">Onboarding</h1>
          <p className="text-gray-600">Lernen Sie die wichtigsten Features kennen</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => {
              const isCompleted = completedSteps.has(step.id)
              const isCurrent = step.id === currentStep
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex-1 h-2 rounded ${
                    isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                  {idx < steps.length - 1 && <div className="w-2" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <currentStepData.icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-gray-600 mb-6">{currentStepData.description}</p>

              {currentStep === 'welcome' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Willkommen bei Ihrer Immobilien-Verwaltung! In den nächsten Schritten zeigen wir Ihnen die wichtigsten Features.
                  </p>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Was Sie lernen werden:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Immobilien verwalten</li>
                      <li>Leads verwalten</li>
                      <li>Besichtigungen planen</li>
                      <li>Exposés erstellen</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 'properties' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Im Immobilien-Management können Sie alle Objekte verwalten, Details bearbeiten und Exposés erstellen.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Nutzen Sie den Immobilien-Wizard, um schnell neue Objekte anzulegen. Alle Daten werden strukturiert gespeichert.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'leads' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Die Lead-Verwaltung hilft Ihnen dabei, alle Interessenten zu organisieren und den Verkaufsprozess zu verfolgen.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Leads können automatisch aus verschiedenen Quellen importiert werden. Der AI-Assistent hilft bei der Kategorisierung.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'calendar' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Planen Sie Besichtigungstermine, verwalten Sie Verfügbarkeiten und senden Sie automatische Erinnerungen.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Besichtigungen können automatisch bestätigt werden. Interessenten erhalten Erinnerungen per E-Mail oder SMS.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'documents' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Erstellen Sie professionelle Exposés mit automatisch generierten Inhalten und Bildern.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Der Exposé-Editor unterstützt Sie bei der Erstellung. AI-generierte Beschreibungen können angepasst werden.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'complete' && (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Herzlichen Glückwunsch!</h3>
                  <p className="text-gray-600 mb-6">
                    Sie haben das Onboarding abgeschlossen. Sie können jetzt alle Features nutzen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          {currentStep !== 'welcome' && (
            <button
              onClick={() => {
                const stepOrder: OnboardingStep[] = ['welcome', 'properties', 'leads', 'calendar', 'documents', 'complete']
                const currentIndex = stepOrder.indexOf(currentStep)
                if (currentIndex > 0) {
                  setCurrentStep(stepOrder[currentIndex - 1])
                }
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Zurück
            </button>
          )}
          <div className="ml-auto flex gap-3">
            {currentStep !== 'complete' && (
              <button
                onClick={handleSkip}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Überspringen
              </button>
            )}
            {currentStep === 'complete' ? (
              <button
                onClick={() => router.push('/real-estate')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Zum Dashboard
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => handleStepComplete(currentStep)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Weiter
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

