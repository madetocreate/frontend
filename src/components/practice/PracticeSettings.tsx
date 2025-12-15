'use client'

import { useState } from 'react'
import { Cog6ToothIcon, GlobeAltIcon, CreditCardIcon, BellIcon, Squares2X2Icon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { PracticeDashboardConfigurator } from './DashboardConfigurator'

export function PracticeSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'dashboard' | 'integrations' | 'billing' | 'notifications' | 'compliance'>('general')

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: Cog6ToothIcon },
    { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { id: 'integrations', label: 'Integrationen', icon: GlobeAltIcon },
    { id: 'billing', label: 'Abrechnung', icon: CreditCardIcon },
    { id: 'notifications', label: 'Benachrichtigungen', icon: BellIcon },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
        <p className="text-gray-600 mt-1">Konfigurieren Sie Ihre Praxis</p>
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
        <PracticeDashboardConfigurator />
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Allgemeine Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Praxis-Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Praxis Name"
                    aria-label="Praxis-Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fachrichtung</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    aria-label="Fachrichtung"
                  >
                    <option>Allgemeinmedizin</option>
                    <option>Innere Medizin</option>
                    <option>Chirurgie</option>
                    <option>Orthopädie</option>
                    <option>Dermatologie</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Integrationen</h3>
              <p className="text-gray-600">Verbinden Sie Ihre Praxis-Systeme</p>
              <div className="space-y-3">
                {['TIM', 'Medatixx', 'CompuGroup', 'Weitere'].map((system) => (
                  <div key={system} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <span className="font-medium text-gray-900">{system}</span>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm shadow-sm hover:shadow-md">
                      Verbinden
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Abrechnung</h3>
              <div className="space-y-3">
                {['KV-Abrechnung', 'Privat-Abrechnung', 'Selbstzahler'].map((method) => (
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
                  { id: 'new-appointment', label: 'Neuer Termin', description: 'Benachrichtigung bei neuen Terminen' },
                  { id: 'patient-reminder', label: 'Patienten-Erinnerung', description: 'Automatische Erinnerungen' },
                  { id: 'document-ready', label: 'Dokument bereit', description: 'Wenn Dokumente fertig sind' },
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

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Compliance & DSGVO</h3>
              <div className="space-y-3">
                {[
                  { id: 'dsgvo', label: 'DSGVO-konform', description: 'Alle Daten werden DSGVO-konform verarbeitet' },
                  { id: 'encryption', label: 'Verschlüsselung', description: 'Ende-zu-Ende Verschlüsselung aktiv' },
                  { id: 'audit-log', label: 'Audit-Log', description: 'Alle Zugriffe werden protokolliert' },
                ].map((setting) => (
                  <div 
                    key={setting.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-lg font-medium">Aktiv</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
