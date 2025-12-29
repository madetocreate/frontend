'use client'

import { useMemo } from 'react'
import { SimpleChart } from './SimpleChart'

type PerformanceChartProps = {
  days?: number
  height?: number
  metric?: 'calls' | 'duration' | 'success'
}

// Generate mock data for performance chart
function generatePerformanceData(days: number = 7, metric: string = 'calls') {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    let baseValue = 0
    if (metric === 'calls') {
      baseValue = 100 + Math.sin(i * 0.5) * 30
    } else if (metric === 'duration') {
      baseValue = 120 + Math.sin(i * 0.3) * 20 // in seconds
    } else if (metric === 'success') {
      baseValue = 92 + Math.sin(i * 0.2) * 5 // percentage
    }
    
    const randomVariation = (Math.random() - 0.5) * (baseValue * 0.1)
    const value = Math.max(0, Math.round(baseValue + randomVariation))
    
    const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' })
    const dayNumber = date.getDate()
    
    data.push({
      label: `${dayName} ${dayNumber}`,
      value,
    })
  }
  
  return data
}

export function PerformanceChart({ 
  days = 7, 
  height = 200,
  metric = 'calls'
}: PerformanceChartProps) {
  const data = useMemo(() => generatePerformanceData(days, metric), [days, metric])

  return (
    <div className="w-full">
      <SimpleChart
        data={data}
        type="line"
        height={height}
        showGrid={true}
      />
    </div>
  )
}

