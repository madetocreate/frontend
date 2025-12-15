'use client'

import { MegaphoneIcon } from '@heroicons/react/24/outline'

export function GastronomieMarketing() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marketing & CRM</h2>
        <p className="text-gray-600 mt-1">Kundenbeziehungen und Marketing-Kampagnen</p>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
            <MegaphoneIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Marketing-Kampagnen</h3>
            <p className="text-sm text-gray-600">Verwalten Sie Ihre Marketing-Aktivitäten</p>
          </div>
        </div>
      </div>
    </div>
  )
}
