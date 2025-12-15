'use client'

import { useState } from 'react'
import { 
  Cog6ToothIcon,
  BellIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export function ReviewProfiSettings() {
  const [autoRespond, setAutoRespond] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [responseTemplate, setResponseTemplate] = useState('Vielen Dank für Ihre Bewertung!')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
        <p className="text-gray-600 mt-1">Konfigurieren Sie Review Profi</p>
      </div>

      {/* Auto-Response */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Automatische Antworten</h3>
              <p className="text-sm text-gray-600">KI-generierte Antworten auf Bewertungen</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRespond}
              onChange={(e) => setAutoRespond(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {autoRespond && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antwort-Vorlage
            </label>
            <textarea
              value={responseTemplate}
              onChange={(e) => setResponseTemplate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              placeholder="Ihre Standard-Antwort-Vorlage..."
            />
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <BellIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Benachrichtigungen</h3>
              <p className="text-sm text-gray-600">E-Mail-Benachrichtigungen für neue Bewertungen</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
          Review Profi Features
        </h3>
        <div className="space-y-3">
          {[
            'KI-generierte Antworten',
            'Sentiment-Analyse',
            'Automatische Einladungen',
            'Multi-Plattform-Management',
            'Detaillierte Analytics',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              <span className="text-gray-900 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
