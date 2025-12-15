'use client'

import { useState } from 'react'
import { CalendarIcon, UserGroupIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline'

export function GastronomieReservations() {
  const [reservations] = useState([
    { id: '1', time: '19:00', guests: 4, name: 'Schmidt', table: 'Tisch 5', status: 'confirmed', phone: '+34 123 456 789' },
    { id: '2', time: '19:30', guests: 2, name: 'Müller', table: 'Tisch 8', status: 'confirmed', phone: '+34 987 654 321' },
    { id: '3', time: '20:00', guests: 6, name: 'Weber', table: 'Tisch 12', status: 'pending', phone: '+34 555 123 456' },
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservierungen & Tische</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Tischreservierungen</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-xl hover:shadow-xl transition-all font-medium flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Neue Reservierung
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reservations.map((res) => (
          <div key={res.id} className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {res.time}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{res.name}</div>
                  <div className="text-sm text-gray-600">{res.phone}</div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {res.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <UserGroupIcon className="h-4 w-4" />
                {res.guests} Personen
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {res.table}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
