'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

export const DynamicRechartsPerformanceChart = dynamic(
  () => import('./RechartsPerformanceChart').then((mod) => ({ default: mod.RechartsPerformanceChart })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] flex items-center justify-center">
        <Skeleton variant="rectangular" height={200} width="100%" />
      </div>
    ),
  }
)

