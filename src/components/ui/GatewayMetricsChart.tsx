'use client'

import { useMemo } from 'react'
import { SimpleChart } from './SimpleChart'

type GatewayMetricsChartProps = {
  hours?: number
  height?: number
  metric?: 'requests' | 'errors' | 'latency'
}

// Generate mock data for gateway metrics
function generateGatewayData(hours: number = 24, metric: string = 'requests') {
  const data = []
  const now = new Date()
  
  for (let i = hours - 1; i >= 0; i--) {
    const time = new Date(now)
    time.setHours(time.getHours() - i)
    
    let baseValue = 0
    if (metric === 'requests') {
      baseValue = 150 + Math.sin(i * 0.3) * 50
    } else if (metric === 'errors') {
      baseValue = 5 + Math.sin(i * 0.2) * 3
    } else if (metric === 'latency') {
      baseValue = 120 + Math.sin(i * 0.4) * 40
    }
    
    const randomVariation = (Math.random() - 0.5) * (baseValue * 0.1)
    const value = Math.max(0, Math.round(baseValue + randomVariation))
    
    const hour = time.getHours()
    const label = `${hour.toString().padStart(2, '0')}:00`
    
    data.push({
      label,
      value,
      color: metric === 'errors' ? 'var(--ak-color-danger)' : 'var(--ak-color-accent)',
    })
  }
  
  return data
}

export function GatewayMetricsChart({ 
  hours = 24, 
  height = 250,
  metric = 'requests'
}: GatewayMetricsChartProps) {
  const data = useMemo(() => generateGatewayData(hours, metric), [hours, metric])

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

