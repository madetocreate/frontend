'use client'

import { useState } from 'react'
import { Cog6ToothIcon, GlobeAltIcon, CreditCardIcon, BellIcon, Squares2X2Icon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { RealEstateDashboardConfigurator } from './DashboardConfigurator'

export function RealEstateSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'dashboard' | 'integrations' | 'payment' | 'notifications' | 'properties'>('general')

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: Cog6ToothIcon },
    { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { id: 'integrations', label: 'Integrationen', icon: GlobeAltIcon },
    { id: 'payment', label: 'Zahlungen', icon: CreditCardIcon },
    { id: 'notifications', label: 'Benachrichtigungen', icon: BellIcon },
    { id: 'properties', label: 'Immobilien', icon: BuildingOfficeIcon },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
        <p className="text-gray-600 mt-1">Konfigurieren Sie Ihre Immobilien-Verwaltung</p>
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
        <RealEstateDashboardConfigurator />
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Allgemeine Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maklerbüro-Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Maklerbüro Name"
                    aria-label="Maklerbüro-Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Stadt, Land"
                    aria-label="Standort"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Integrationen</h3>
              <p className="text-gray-600">Verbinden Sie Ihre Immobilien-Portale</p>
              <div className="space-y-3">
                {[
                  { id: 'immobilienscout24', name: 'Immobilienscout24', icon: '🏢', description: 'Deutschland' },
                  { id: 'idealista', name: 'Idealista', icon: '🇪🇸', description: 'Spanien' },
                  { id: 'immowelt', name: 'ImmoWelt', icon: '🌍', description: 'Deutschland' },
                  { id: 'ebay-kleinanzeigen', name: 'eBay Kleinanzeigen', icon: '📋', description: 'Deutschland' },
                  { id: 'wohnung-de', name: 'Wohnung.de', icon: '🏠', description: 'Deutschland' },
                  { id: 'immonet', name: 'Immonet', icon: '🏘️', description: 'Deutschland' },
                  { id: 'fotocasa', name: 'Fotocasa', icon: '📸', description: 'Spanien' },
                  { id: 'habitaclia', name: 'Habitaclia', icon: '🏛️', description: 'Spanien' },
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
                {['Überweisung', 'SEPA-Lastschrift', 'Kreditkarte'].map((method) => (
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
                  { id: 'new-lead', label: 'Neuer Lead', description: 'Benachrichtigung bei neuen Leads' },
                  { id: 'viewing-reminder', label: 'Besichtigungs-Erinnerung', description: 'Erinnerung vor Besichtigungen' },
                  { id: 'contract-ready', label: 'Vertrag bereit', description: 'Wenn Verträge fertig sind' },
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

          {activeTab === 'properties' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Immobilien-Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standard-Immobilientyp</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    aria-label="Standard-Immobilientyp"
                  >
                    <option>Wohnung</option>
                    <option>Haus</option>
                    <option>Gewerbe</option>
                    <option>Grundstück</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Automatische Exposé-Generierung</label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                      defaultChecked 
                    />
                    <span className="text-sm text-gray-700">Automatisch Exposés generieren bei neuen Immobilien</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
