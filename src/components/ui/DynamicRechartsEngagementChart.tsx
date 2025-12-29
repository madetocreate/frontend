'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

export const DynamicRechartsEngagementChart = dynamic(
  () => import('./RechartsEngagementChart').then((mod) => ({ default: mod.RechartsEngagementChart })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] flex items-center justify-center">
        <Skeleton variant="rectangular" height={200} width="100%" />
      </div>
    ),
  }
)

