'use client'
import { HotelOverview } from './HotelOverview'
import { HotelReservations } from './HotelReservations'
import { HotelRooms } from './HotelRooms'
import { HotelRestaurant } from './HotelRestaurant'
import { HotelEvents } from './HotelEvents'
import { HotelGuests } from './HotelGuests'
import { HotelRevenue } from './HotelRevenue'
import { HotelMarketing } from './HotelMarketing'
import { HotelReports } from './HotelReports'
import { HotelSettings } from './HotelSettings'

export type HotelView = 
  | 'overview' 
  | 'reservations' 
  | 'rooms' 
  | 'restaurant' 
  | 'events' 
  | 'guests' 
  | 'revenue' 
  | 'marketing' 
  | 'reports' 
  | 'settings'

type HotelDashboardProps = {
  view: HotelView
}

export function HotelDashboard({ view }: HotelDashboardProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {view === 'overview' && 'Hotel Übersicht'}
          {view === 'reservations' && 'Reservierungen'}
          {view === 'rooms' && 'Zimmerverwaltung'}
          {view === 'restaurant' && 'Restaurant & Bar'}
          {view === 'events' && 'Events & Feiern'}
          {view === 'guests' && 'Gäste'}
          {view === 'revenue' && 'Revenue Management'}
          {view === 'marketing' && 'Marketing & CRM'}
          {view === 'reports' && 'Berichte & Analytics'}
          {view === 'settings' && 'Einstellungen'}
        </h1>
      </header>
      <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        {view === 'overview' && <HotelOverview />}
        {view === 'reservations' && <HotelReservations />}
        {view === 'rooms' && <HotelRooms />}
        {view === 'restaurant' && <HotelRestaurant />}
        {view === 'events' && <HotelEvents />}
        {view === 'guests' && <HotelGuests />}
        {view === 'revenue' && <HotelRevenue />}
        {view === 'marketing' && <HotelMarketing />}
        {view === 'reports' && <HotelReports />}
        {view === 'settings' && <HotelSettings />}
      </main>
    </div>
  )
}

