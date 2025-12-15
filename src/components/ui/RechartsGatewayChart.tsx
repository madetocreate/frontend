'use client'

import { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

type GatewayMetricsChartProps = {
  hours?: number
  height?: number
  metric?: 'requests' | 'errors' | 'latency'
}

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
      name: label,
      value,
    })
  }
  
  return data
}

export function RechartsGatewayChart({ 
  hours = 24, 
  height = 250,
  metric = 'requests'
}: GatewayMetricsChartProps) {
  const data = useMemo(() => generateGatewayData(hours, metric), [hours, metric])
  const color = metric === 'errors' ? 'var(--ak-color-danger)' : 'var(--ak-color-accent)'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGateway" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
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
          stroke={color} 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorGateway)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

