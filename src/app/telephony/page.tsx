'use client'

import { TelephonyDashboard } from '@/components/telephony/TelephonyDashboard'
import { TelephonyView } from '@/components/telephony/TelephonySidebarWidget'

export default function TelephonyPage() {
  // Default to overview view
  const view: TelephonyView = 'overview'

  return (
    <div className="h-screen w-screen overflow-hidden">
      <TelephonyDashboard view={view} />
    </div>
  )
}

