'use client'
import { PracticeOverview } from './PracticeOverview'
import { PracticePatients } from './PracticePatients'
import { PracticeAppointments } from './PracticeAppointments'
import { PracticeDocuments } from './PracticeDocuments'
import { PracticeStatistics } from './PracticeStatistics'
import { PracticePhoneReception } from './PracticePhoneReception'
import { PracticeForms } from './PracticeForms'
import { PracticeBilling } from './PracticeBilling'
import { PracticeCompliance } from './PracticeCompliance'
import { PracticeSettings } from './PracticeSettings'

export type PracticeView = 
  | 'overview' 
  | 'patients' 
  | 'appointments' 
  | 'documents' 
  | 'statistics' 
  | 'phone' 
  | 'forms' 
  | 'billing' 
  | 'compliance'
  | 'settings'

type PracticeDashboardProps = {
  view: PracticeView
  enabledViews?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PracticeDashboard({ view, enabledViews }: PracticeDashboardProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {view === 'overview' && 'Praxis Übersicht'}
          {view === 'patients' && 'Patienten'}
          {view === 'appointments' && 'Termine'}
          {view === 'documents' && 'Dokumente'}
          {view === 'statistics' && 'Statistiken'}
          {view === 'phone' && 'Telefon-Empfang'}
          {view === 'forms' && 'Formulare'}
          {view === 'billing' && 'Abrechnung'}
          {view === 'compliance' && 'Compliance & Datenschutz'}
          {view === 'settings' && 'Einstellungen'}
        </h1>
      </header>
      <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        {view === 'overview' && <PracticeOverview />}
        {view === 'patients' && <PracticePatients />}
        {view === 'appointments' && <PracticeAppointments />}
        {view === 'documents' && <PracticeDocuments />}
        {view === 'statistics' && <PracticeStatistics />}
        {view === 'phone' && <PracticePhoneReception />}
        {view === 'forms' && <PracticeForms />}
        {view === 'billing' && <PracticeBilling />}
        {view === 'compliance' && <PracticeCompliance />}
        {view === 'settings' && <PracticeSettings />}
      </main>
    </div>
  )
}

