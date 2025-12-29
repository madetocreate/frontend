'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from './Skeleton'

const ChartPlaceholder = () => <Skeleton variant="rectangular" height={300} width="100%" />

export const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), {
  ssr: false,
  loading: ChartPlaceholder,
})

export const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), {
  ssr: false,
})

export const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
  ssr: false,
})

export const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
  ssr: false,
})

export const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
  ssr: false,
})

export const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), {
  ssr: false,
})

export const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), {
  ssr: false,
  loading: () => <Skeleton variant="circular" height={200} width={200} />,
})

export const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), {
  ssr: false,
})

export const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), {
  ssr: false,
})

export const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), {
  ssr: false,
})

