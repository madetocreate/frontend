'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

type WizardStep = 'welcome' | 'practice-info' | 'integration' | 'team' | 'complete'

export default function PracticeWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [practiceData, setPracticeData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    specialization: '',
    taxId: '',
    integration: '',
    teamMembers: []
  })

  const steps = [
    { id: 'welcome', label: 'Willkommen' },
    { id: 'practice-info', label: 'Praxis-Info' },
    { id: 'integration', label: 'Integrationen' },
    { id: 'team', label: 'Team' },
    { id: 'complete', label: 'Fertig' },
  ]

  const handleNext = () => {
    const stepOrder: WizardStep[] = ['welcome', 'practice-info', 'integration', 'team', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleComplete = () => {
    // TODO: Save to backend
    router.push('/practice')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => {
              const stepIndex = steps.findIndex(s => s.id === currentStep)
              const isCompleted = idx < stepIndex
              const isCurrent = idx === stepIndex
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <span className="text-white font-semibold">{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {currentStep === 'welcome' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Willkommen beim Praxis-Setup</h2>
              <p className="text-gray-600 mb-6">
                Wir helfen Ihnen dabei, Ihre Praxis in wenigen Schritten einzurichten.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Was wir einrichten:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Praxis-Informationen</li>
                    <li>Integrationen (Kalender, Abrechnung, etc.)</li>
                    <li>Team-Mitglieder</li>
                    <li>Erste Konfiguration</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'practice-info' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Praxis-Informationen</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Praxis-Name *
                  </label>
                  <input
                    type="text"
                    value={practiceData.name}
                    onChange={(e) => setPracticeData({ ...practiceData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Praxis Dr. Mustermann"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={practiceData.address}
                    onChange={(e) => setPracticeData({ ...practiceData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Musterstraße 123, 12345 Musterstadt"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={practiceData.phone}
                      onChange={(e) => setPracticeData({ ...practiceData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      value={practiceData.email}
                      onChange={(e) => setPracticeData({ ...practiceData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fachrichtung
                  </label>
                  <input
                    type="text"
                    value={practiceData.specialization}
                    onChange={(e) => setPracticeData({ ...practiceData, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Allgemeinmedizin, Kardiologie"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'integration' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Integrationen</h2>
              <p className="text-gray-600 mb-6">
                Verbinden Sie Ihre bestehenden Systeme (optional, kann später nachgeholt werden)
              </p>
              <div className="space-y-3">
                {['Google Calendar', 'Praxismanagement-System', 'Labor-System', 'Abrechnungssystem'].map((integration) => (
                  <label key={integration} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={practiceData.integration === integration}
                      onChange={() => setPracticeData({ ...practiceData, integration })}
                    />
                    <span>{integration}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'team' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Team</h2>
              <p className="text-gray-600 mb-6">
                Fügen Sie Team-Mitglieder hinzu (optional, kann später nachgeholt werden)
              </p>
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
                Team-Verwaltung wird hier angezeigt
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Setup abgeschlossen!</h2>
              <p className="text-gray-600 mb-6">
                Ihre Praxis ist jetzt eingerichtet. Sie können jederzeit weitere Einstellungen vornehmen.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          {currentStep !== 'welcome' && (
            <button
              onClick={() => {
                const stepOrder: WizardStep[] = ['welcome', 'practice-info', 'integration', 'team', 'complete']
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
          <div className="ml-auto">
            {currentStep === 'complete' ? (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Zum Dashboard
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Weiter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

