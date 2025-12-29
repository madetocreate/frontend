'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

export const DynamicMermaidDiagram = dynamic(
  () => import('./MermaidDiagram').then((mod) => mod.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="my-4 rounded-xl border border-white/10 bg-[var(--ak-color-graphite-surface)]/95 p-8 flex items-center justify-center">
        <Skeleton variant="rectangular" height={200} width="100%" />
      </div>
    ),
  }
)

