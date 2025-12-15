'use client'

import { useState, useMemo } from 'react'
import { 
  CurrencyEuroIcon,
  ShoppingCartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TableCellsIcon,
  SparklesIcon,
  ChartBarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

interface OverviewStats {
  todayRevenue: number
  todayOrders: number
  activeTables: number
  totalReservations: number
  avgOrderValue: number
  revenueChange: number
  ordersChange: number
  topSellingItems: Array<{ name: string; count: number; revenue: number }>
  upcomingReservations: Array<{ time: string; guests: number; name: string; table: string }>
}

export function GastronomieOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  // TODO: Load from backend
  const stats = useMemo<OverviewStats>(() => ({
    todayRevenue: 12450.80,
    todayOrders: 87,
    activeTables: 12,
    totalReservations: 24,
    avgOrderValue: 143.12,
    revenueChange: 12.5,
    ordersChange: 8.3,
    topSellingItems: [
      { name: 'Paella Valenciana', count: 23, revenue: 1150.00 },
      { name: 'Sangria (1L)', count: 18, revenue: 540.00 },
      { name: 'Gambas al Ajillo', count: 15, revenue: 675.00 },
      { name: 'Tortilla Española', count: 12, revenue: 360.00 },
    ],
    upcomingReservations: [
      { time: '19:00', guests: 4, name: 'Schmidt', table: 'Tisch 5' },
      { time: '19:30', guests: 2, name: 'Müller', table: 'Tisch 8' },
      { time: '20:00', guests: 6, name: 'Weber', table: 'Tisch 12' },
      { time: '20:30', guests: 3, name: 'Fischer', table: 'Tisch 3' },
    ]
  }), [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Gastronomie Übersicht</h2>
          <p className="text-[var(--ak-color-text-secondary)] mt-1">Ihr Restaurant & Bar Dashboard</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                selectedPeriod === period
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'apple-glass-enhanced border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] hover:shadow-[var(--ak-shadow-md)]'
              }`}
            >
              {period === 'today' ? 'Heute' : period === 'week' ? 'Woche' : 'Monat'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <CurrencyEuroIcon className="h-6 w-6 text-white" />
            </div>
            {stats.revenueChange > 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">
            {formatCurrency(stats.todayRevenue)}
          </div>
          <div className="text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Umsatz heute</div>
          <div className={`text-xs font-semibold ${stats.revenueChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}% vs. gestern
          </div>
        </div>

        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <ShoppingCartIcon className="h-6 w-6 text-white" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">
            {stats.todayOrders}
          </div>
          <div className="text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Bestellungen heute</div>
          <div className="text-xs font-semibold text-emerald-600">
            +{stats.ordersChange}% vs. gestern
          </div>
        </div>

        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
              <TableCellsIcon className="h-6 w-6 text-white" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">
            {stats.activeTables}
          </div>
          <div className="text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Aktive Tische</div>
          <div className="text-xs font-semibold text-emerald-600">
            {stats.totalReservations} Reservierungen
          </div>
        </div>

        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">
            {formatCurrency(stats.avgOrderValue)}
          </div>
          <div className="text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">Ø Bestellwert</div>
          <div className="text-xs font-semibold text-emerald-600">
            +5.2% vs. Vorwoche
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="apple-glass-enhanced rounded-3xl p-6">
          <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)] mb-6 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-orange-600" />
            Bestseller heute
          </h3>
          <div className="space-y-4">
            {stats.topSellingItems.map((item, index) => (
              <div
                key={index}
                className="p-4 apple-glass-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] hover:border-orange-300/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-[var(--ak-color-text-primary)]">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--ak-color-text-primary)]">{item.count}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--ak-color-text-secondary)]">Umsatz</span>
                  <span className="text-sm font-bold text-orange-600">{formatCurrency(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="apple-glass-enhanced rounded-3xl p-6">
          <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)] mb-6 flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-blue-600" />
            Kommende Reservierungen
          </h3>
          <div className="space-y-4">
            {stats.upcomingReservations.map((reservation, index) => (
              <div
                key={index}
                className="p-4 apple-glass-enhanced rounded-2xl border border-blue-200/50 hover:border-blue-300/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {reservation.time}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--ak-color-text-primary)]">{reservation.name}</div>
                      <div className="text-xs text-[var(--ak-color-text-secondary)]">{reservation.guests} Personen</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                    {reservation.table}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="apple-glass-enhanced rounded-3xl p-6">
        <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)] mb-6 flex items-center gap-2">
          <BeakerIcon className="h-6 w-6 text-purple-600" />
          Schnellaktionen
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold">
            Neue Bestellung
          </button>
          <button className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold">
            Reservierung
          </button>
          <button className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold">
            Inventar prüfen
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold">
            Bar öffnen
          </button>
        </div>
      </div>
    </div>
  )
}
