'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

export const DynamicTelephonyLogs = dynamic(
  () => import('./telephony/TelephonyLogs').then((mod) => mod.TelephonyLogs),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="rectangular" height={400} width="100%" />
      </div>
    ),
  }
)

