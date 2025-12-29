'use client'

import { useMemo } from 'react'
import { SimpleChart } from './SimpleChart'

type EngagementChartProps = {
  days?: number
  height?: number
}

// Generate mock data for engagement chart
function generateEngagementData(days: number = 7) {
  const today = new Date()
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic engagement data with some variation
    const baseValue = 120 + Math.sin(i * 0.5) * 30
    const randomVariation = (Math.random() - 0.5) * 20
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

export function EngagementChart({ days = 7, height = 250 }: EngagementChartProps) {
  const data = useMemo(() => generateEngagementData(days), [days])

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

