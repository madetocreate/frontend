'use client'

import { useState } from 'react'
import { Cog6ToothIcon, GlobeAltIcon, CreditCardIcon, BellIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { DashboardConfigurator } from './DashboardConfigurator'

export function HotelSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'dashboard' | 'integrations' | 'payment' | 'notifications'>('general')

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: Cog6ToothIcon },
    { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { id: 'integrations', label: 'Integrationen', icon: GlobeAltIcon },
    { id: 'payment', label: 'Zahlungen', icon: CreditCardIcon },
    { id: 'notifications', label: 'Benachrichtigungen', icon: BellIcon },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
        <p className="text-gray-600 mt-1">Konfigurieren Sie Ihr Hotel-System</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={activeTab === tab.id}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' ? (
        <DashboardConfigurator />
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Allgemeine Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel-Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Hotel Name"
                    aria-label="Hotel-Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sprache</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    aria-label="Sprache"
                  >
                    <option>Deutsch</option>
                    <option>Español</option>
                    <option>English</option>
                    <option>Català</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zeitzone</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    aria-label="Zeitzone"
                  >
                    <option>Europe/Madrid (CET)</option>
                    <option>Europe/Berlin (CET)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Integrationen</h3>
              <p className="text-gray-600">Verbinden Sie Ihre Booking-Plattformen</p>
              <div className="space-y-3">
                {[
                  { id: 'booking-com', name: 'Booking.com', icon: '🏨' },
                  { id: 'airbnb', name: 'Airbnb', icon: '🏡' },
                  { id: 'expedia', name: 'Expedia', icon: '✈️' },
                  { id: 'hrs', name: 'HRS', icon: '🌐' },
                  { id: 'hotels-com', name: 'Hotels.com', icon: '🏖️' },
                  { id: 'trivago', name: 'Trivago', icon: '🔍' },
                  { id: 'agoda', name: 'Agoda', icon: '🌏' },
                  { id: 'padel', name: 'Padel', icon: '🇪🇸', description: 'Spanien' },
                ].map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{platform.name}</div>
                        {platform.description && (
                          <div className="text-xs text-gray-500">{platform.description}</div>
                        )}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm shadow-sm hover:shadow-md">
                      Verbinden
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Zahlungsmethoden</h3>
              <div className="space-y-3">
                {['Kreditkarte', 'PayPal', 'SumUp', 'Bar'].map((method) => (
                  <label 
                    key={method} 
                    className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200"
                  >
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                      defaultChecked 
                    />
                    <span className="font-medium text-gray-900">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h3>
              <div className="space-y-3">
                {[
                  { id: 'new-reservation', label: 'Neue Reservierung', description: 'E-Mail bei neuen Buchungen' },
                  { id: 'check-in', label: 'Check-in Erinnerung', description: 'Erinnerung vor Check-in' },
                  { id: 'review', label: 'Review-Anfrage', description: 'Automatische Review-Anfrage nach Check-out' },
                ].map((setting) => (
                  <label 
                    key={setting.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="ml-4 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                      defaultChecked 
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
