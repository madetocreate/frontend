'use client'

import { useState } from 'react'
import { ShoppingCartIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export function GastronomieOrders() {
  const [orders] = useState([
    { id: '1', table: 'Tisch 5', items: 3, total: 87.50, status: 'preparing', time: '18:45' },
    { id: '2', table: 'Tisch 8', items: 2, total: 45.00, status: 'ready', time: '19:00' },
    { id: '3', table: 'Tisch 12', items: 4, total: 120.00, status: 'served', time: '19:15' },
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bestellungen</h2>
          <p className="text-gray-600 mt-1">Aktive und abgeschlossene Bestellungen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {order.table}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{order.items} Items</div>
                  <div className="text-sm text-gray-600">{order.time}</div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                order.status === 'served' ? 'bg-emerald-100 text-emerald-700' :
                order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {order.status === 'served' ? 'Serviert' : order.status === 'ready' ? 'Fertig' : 'In Vorbereitung'}
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(order.total)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
