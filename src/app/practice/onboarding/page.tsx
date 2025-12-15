'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

type OnboardingStep = 'welcome' | 'patients' | 'appointments' | 'documents' | 'phone' | 'complete'

export default function PracticeOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())

  const steps = [
    { 
      id: 'welcome' as OnboardingStep, 
      title: 'Willkommen', 
      description: 'Erste Schritte mit Ihrer Praxis-Verwaltung',
      icon: CheckCircleIcon
    },
    { 
      id: 'patients' as OnboardingStep, 
      title: 'Patienten verwalten', 
      description: 'Erfahren Sie, wie Sie Patienten anlegen und verwalten',
      icon: UserGroupIcon
    },
    { 
      id: 'appointments' as OnboardingStep, 
      title: 'Termine planen', 
      description: 'Lernen Sie die Terminverwaltung kennen',
      icon: CalendarIcon
    },
    { 
      id: 'documents' as OnboardingStep, 
      title: 'Dokumente erstellen', 
      description: 'Befunde, Rezepte und Überweisungen digital erstellen',
      icon: DocumentTextIcon
    },
    { 
      id: 'phone' as OnboardingStep, 
      title: 'Telefon-Empfang', 
      description: 'Konfigurieren Sie den AI-Telefon-Empfang',
      icon: PhoneIcon
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
    const stepOrder: OnboardingStep[] = ['welcome', 'patients', 'appointments', 'documents', 'phone', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleSkip = () => {
    router.push('/practice')
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
                    Willkommen bei Ihrer Praxis-Verwaltung! In den nächsten Schritten zeigen wir Ihnen die wichtigsten Features.
                  </p>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Was Sie lernen werden:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Patienten verwalten</li>
                      <li>Termine planen</li>
                      <li>Dokumente erstellen</li>
                      <li>Telefon-Empfang konfigurieren</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 'patients' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Im Patienten-Management können Sie alle Patienten verwalten, Anamnesen einsehen und neue Patienten anlegen.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                    Nutzen Sie die Suche, um schnell Patienten zu finden. Neue Patienten können Sie über den „Neuer Patient“-Button anlegen.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'appointments' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Die Terminverwaltung hilft Ihnen dabei, alle Termine zu organisieren und Patienten automatisch zu erinnern.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Termine können automatisch per SMS oder E-Mail bestätigt werden. Dies reduziert No-Shows erheblich.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'documents' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Erstellen Sie digitale Befunde, Rezepte und Überweisungen. Alles DSGVO-konform und sicher.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Dokumente können direkt an Patienten versendet werden. E-Rezepte werden automatisch als QR-Code generiert.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'phone' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Der AI-Telefon-Empfang beantwortet Anrufe automatisch, vereinbart Termine und leitet Notfälle weiter.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Konfigurieren Sie Ihre Öffnungszeiten und Notfall-Routing, damit der AI-Assistent optimal funktioniert.
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
                const stepOrder: OnboardingStep[] = ['welcome', 'patients', 'appointments', 'documents', 'phone', 'complete']
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
                onClick={() => router.push('/practice')}
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

