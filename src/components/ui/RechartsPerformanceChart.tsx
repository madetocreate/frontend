'use client'

import { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

type PerformanceChartProps = {
  days?: number
  height?: number
  metric?: 'calls' | 'duration' | 'success'
}

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
      baseValue = 120 + Math.sin(i * 0.3) * 20
    } else if (metric === 'success') {
      baseValue = 92 + Math.sin(i * 0.2) * 5
    }
    
    const randomVariation = (Math.random() - 0.5) * (baseValue * 0.1)
    const value = Math.max(0, Math.round(baseValue + randomVariation))
    
    const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' })
    const dayNumber = date.getDate()
    
    data.push({
      name: `${dayName} ${dayNumber}`,
      value,
    })
  }
  
  return data
}

export function RechartsPerformanceChart({ 
  days = 7, 
  height = 200,
  metric = 'calls'
}: PerformanceChartProps) {
  const data = useMemo(() => generatePerformanceData(days, metric), [days, metric])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--ak-color-accent)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--ak-color-accent)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--ak-color-border-subtle)" opacity={0.3} />
        <XAxis 
          dataKey="name" 
          stroke="var(--ak-color-text-muted)"
          style={{ fontSize: '11px' }}
        />
        <YAxis 
          stroke="var(--ak-color-text-muted)"
          style={{ fontSize: '11px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--ak-color-border-subtle)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
          }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="var(--ak-color-accent)" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorPerformance)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

