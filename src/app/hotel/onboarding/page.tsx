'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  CalendarIcon,
  HomeIcon,
  CakeIcon,
  CurrencyEuroIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

type OnboardingStep = 'welcome' | 'reservations' | 'rooms' | 'restaurant' | 'revenue' | 'guests' | 'complete'

export default function HotelOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())

  const steps = [
    { 
      id: 'welcome' as OnboardingStep, 
      title: 'Willkommen', 
      description: 'Erste Schritte mit Ihrer Hotel-Verwaltung',
      icon: CheckCircleIcon
    },
    { 
      id: 'reservations' as OnboardingStep, 
      title: 'Reservierungen', 
      description: 'Erfahren Sie, wie Sie Reservierungen verwalten',
      icon: CalendarIcon
    },
    { 
      id: 'rooms' as OnboardingStep, 
      title: 'Zimmerverwaltung', 
      description: 'Lernen Sie die Zimmer-Verwaltung kennen',
      icon: HomeIcon
    },
    { 
      id: 'restaurant' as OnboardingStep, 
      title: 'Restaurant & Bar', 
      description: 'Tischreservierungen und Bestellungen verwalten',
      icon: CakeIcon
    },
    { 
      id: 'revenue' as OnboardingStep, 
      title: 'Revenue Management', 
      description: 'Optimieren Sie Ihre Preise und Auslastung',
      icon: CurrencyEuroIcon
    },
    { 
      id: 'guests' as OnboardingStep, 
      title: 'Gästekommunikation', 
      description: 'Kommunizieren Sie mit Ihren Gästen',
      icon: UserGroupIcon
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
    const stepOrder: OnboardingStep[] = ['welcome', 'reservations', 'rooms', 'restaurant', 'revenue', 'guests', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleSkip = () => {
    router.push('/hotel')
  }

  const currentStepData = steps.find(s => s.id === currentStep)!

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
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
                    isCompleted ? 'bg-green-500' : isCurrent ? 'bg-orange-500' : 'bg-gray-200'
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
            <div className="p-4 bg-orange-50 rounded-lg">
              <currentStepData.icon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-gray-600 mb-6">{currentStepData.description}</p>

              {currentStep === 'welcome' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Willkommen bei Ihrer Hotel-Verwaltung! In den nächsten Schritten zeigen wir Ihnen die wichtigsten Features.
                  </p>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Was Sie lernen werden:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Reservierungen verwalten</li>
                      <li>Zimmer-Status verwalten</li>
                      <li>Restaurant-Reservierungen</li>
                      <li>Revenue optimieren</li>
                      <li>Gästekommunikation</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 'reservations' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Im Reservierungs-Management können Sie alle Buchungen verwalten, Check-ins durchführen und mit Booking-Plattformen synchronisieren.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Nutzen Sie die Keyboard Shortcuts (⌘2 für Reservierungen, ⌘N für neue Reservierung) für schnelle Navigation.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'rooms' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Die Zimmerverwaltung zeigt Ihnen den Status aller Zimmer auf einen Blick. Housekeeping kann direkt Status aktualisieren.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Die visuelle Zimmer-Map macht es einfach, auf einen Blick zu sehen, welche Zimmer sauber, besetzt oder in Wartung sind.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'restaurant' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Verwalten Sie Tischreservierungen, Bestellungen und Menüs. Alles in Echtzeit synchronisiert.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Der Tisch-Plan zeigt live den Status aller Tische. Bestellungen werden automatisch an die Küche weitergeleitet.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'revenue' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Optimieren Sie Ihre Preise basierend auf Auslastung, Wetter und Events. Das System schlägt automatisch optimale Preise vor.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Nutzen Sie die Forecasting-Funktion, um die erwartete Auslastung zu sehen und Preise entsprechend anzupassen.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 'guests' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Der AI Concierge beantwortet Gästefragen 24/7 in mehreren Sprachen. Sie können jederzeit eingreifen.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tipp:</h3>
                    <p className="text-sm text-gray-700">
                      Automatische E-Mails vor Ankunft, während des Aufenthalts und nach Abreise erhöhen die Gästezufriedenheit erheblich.
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
                const stepOrder: OnboardingStep[] = ['welcome', 'reservations', 'rooms', 'restaurant', 'revenue', 'guests', 'complete']
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
                onClick={() => router.push('/hotel')}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                Zum Dashboard
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => handleStepComplete(currentStep)}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
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

