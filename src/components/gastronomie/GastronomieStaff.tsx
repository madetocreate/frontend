'use client'

import { useState } from 'react'
import { UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'

export function GastronomieStaff() {
  const [staff] = useState([
    { id: '1', name: 'Maria Garcia', role: 'Kellnerin', shift: '18:00 - 23:00', status: 'active' },
    { id: '2', name: 'Juan Martinez', role: 'Koch', shift: '17:00 - 22:00', status: 'active' },
    { id: '3', name: 'Ana Lopez', role: 'Barkeeper', shift: '19:00 - 01:00', status: 'scheduled' },
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal & Schichten</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihr Team</p>
        </div>
      </div>

      <div className="space-y-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">{member.role}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4" />
                  {member.shift}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {member.status === 'active' ? 'Aktiv' : 'Geplant'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
