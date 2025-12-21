'use client'

import { GastronomieOverview } from './GastronomieOverview'
import { GastronomieReservations } from './GastronomieReservations'
import { GastronomieMenu } from './GastronomieMenu'
import { GastronomieOrders } from './GastronomieOrders'
import { GastronomieInventory } from './GastronomieInventory'
import { GastronomieStaff } from './GastronomieStaff'
import { GastronomieBar } from './GastronomieBar'
import { GastronomieAnalytics } from './GastronomieAnalytics'
import { GastronomieMarketing } from './GastronomieMarketing'
import { GastronomieSettings } from './GastronomieSettings'

export type GastronomieView = 
  | 'overview' 
  | 'reservations' 
  | 'menu' 
  | 'orders' 
  | 'inventory' 
  | 'staff' 
  | 'bar' 
  | 'analytics' 
  | 'marketing' 
  | 'settings'

type GastronomieDashboardProps = {
  view: GastronomieView
  enabledViews?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GastronomieDashboard({ view, enabledViews }: GastronomieDashboardProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {view === 'overview' && 'Gastronomie Übersicht'}
          {view === 'reservations' && 'Reservierungen & Tische'}
          {view === 'menu' && 'Speisekarte'}
          {view === 'orders' && 'Bestellungen'}
          {view === 'inventory' && 'Inventar & Lager'}
          {view === 'staff' && 'Personal & Schichten'}
          {view === 'bar' && 'Bar & Getränke'}
          {view === 'analytics' && 'Analytics & Berichte'}
          {view === 'marketing' && 'Marketing & CRM'}
          {view === 'settings' && 'Einstellungen'}
        </h1>
      </header>
      <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        {view === 'overview' && <GastronomieOverview />}
        {view === 'reservations' && <GastronomieReservations />}
        {view === 'menu' && <GastronomieMenu />}
        {view === 'orders' && <GastronomieOrders />}
        {view === 'inventory' && <GastronomieInventory />}
        {view === 'staff' && <GastronomieStaff />}
        {view === 'bar' && <GastronomieBar />}
        {view === 'analytics' && <GastronomieAnalytics />}
        {view === 'marketing' && <GastronomieMarketing />}
        {view === 'settings' && <GastronomieSettings />}
      </main>
    </div>
  )
}
