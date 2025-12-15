'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

type WizardStep = 'welcome' | 'hotel-info' | 'rooms' | 'integrations' | 'team' | 'complete'

export default function HotelWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [hotelData, setHotelData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    stars: '',
    totalRooms: '',
    integrations: [] as string[],
    teamMembers: []
  })

  const steps = [
    { id: 'welcome', label: 'Willkommen' },
    { id: 'hotel-info', label: 'Hotel-Info' },
    { id: 'rooms', label: 'Zimmer' },
    { id: 'integrations', label: 'Integrationen' },
    { id: 'team', label: 'Team' },
    { id: 'complete', label: 'Fertig' },
  ]

  const handleNext = () => {
    const stepOrder: WizardStep[] = ['welcome', 'hotel-info', 'rooms', 'integrations', 'team', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleComplete = () => {
    // TODO: Save to backend
    router.push('/hotel')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
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
                      isCompleted ? 'bg-green-500' : isCurrent ? 'bg-orange-500' : 'bg-gray-200'
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
              <h2 className="text-2xl font-bold mb-4">Willkommen beim Hotel-Setup</h2>
              <p className="text-gray-600 mb-6">
                Wir helfen Ihnen dabei, Ihr Hotel oder Restaurant in wenigen Schritten einzurichten.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                  <h3 className="font-semibold mb-2">Was wir einrichten:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Hotel-Informationen</li>
                    <li>Zimmer-Verwaltung</li>
                    <li>Integrationen (Booking.com, Airbnb, etc.)</li>
                    <li>Team-Mitglieder</li>
                    <li>Erste Konfiguration</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'hotel-info' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Hotel-Informationen</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel-Name *
                  </label>
                  <input
                    type="text"
                    value={hotelData.name}
                    onChange={(e) => setHotelData({ ...hotelData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="z.B. Hotel Sonnenstrand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={hotelData.address}
                    onChange={(e) => setHotelData({ ...hotelData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Calle Example 123, 07000 Palma, Mallorca"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={hotelData.phone}
                      onChange={(e) => setHotelData({ ...hotelData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      value={hotelData.email}
                      onChange={(e) => setHotelData({ ...hotelData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sterne
                    </label>
                    <select
                      value={hotelData.stars}
                      onChange={(e) => setHotelData({ ...hotelData, stars: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Auswählen</option>
                      <option value="1">1 Stern</option>
                      <option value="2">2 Sterne</option>
                      <option value="3">3 Sterne</option>
                      <option value="4">4 Sterne</option>
                      <option value="5">5 Sterne</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anzahl Zimmer
                    </label>
                    <input
                      type="number"
                      value={hotelData.totalRooms}
                      onChange={(e) => setHotelData({ ...hotelData, totalRooms: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'rooms' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Zimmer-Kategorien</h2>
              <p className="text-gray-600 mb-6">
                Erstellen Sie Ihre Zimmer-Kategorien (optional, kann später nachgeholt werden)
              </p>
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
                Zimmer-Verwaltung wird hier angezeigt
              </div>
            </div>
          )}

          {currentStep === 'integrations' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Integrationen</h2>
              <p className="text-gray-600 mb-6">
                Verbinden Sie Ihre Booking-Plattformen (optional, kann später nachgeholt werden)
              </p>
              <div className="space-y-3">
                {['Booking.com', 'Airbnb', 'Expedia', 'HRS', 'Hotels.com', 'Agoda'].map((integration) => (
                  <label key={integration} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={hotelData.integrations.includes(integration)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setHotelData({ ...hotelData, integrations: [...hotelData.integrations, integration] })
                        } else {
                          setHotelData({ ...hotelData, integrations: hotelData.integrations.filter(i => i !== integration) })
                        }
                      }}
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
                Ihr Hotel ist jetzt eingerichtet. Sie können jederzeit weitere Einstellungen vornehmen.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          {currentStep !== 'welcome' && (
            <button
              onClick={() => {
                const stepOrder: WizardStep[] = ['welcome', 'hotel-info', 'rooms', 'integrations', 'team', 'complete']
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
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Zum Dashboard
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
