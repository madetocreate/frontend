'use client'

import { useMemo } from 'react'
import clsx from 'clsx'

type ChartDataPoint = {
  label: string
  value: number
  color?: string
}

type SimpleChartProps = {
  data: ChartDataPoint[]
  type?: 'line' | 'bar' | 'area'
  height?: number
  showGrid?: boolean
  className?: string
}

export function SimpleChart({
  data,
  type = 'line',
  height = 200,
  showGrid = true,
  className,
}: SimpleChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  const minValue = useMemo(() => Math.min(...data.map(d => d.value), 0), [data])
  const range = maxValue - minValue || 1

  // Generate gradient colors - use stable ID based on data
  const gradientId = useMemo(() => {
    const dataHash = data.map(d => `${d.label}-${d.value}`).join('-')
    return `gradient-${dataHash.replace(/[^a-z0-9]/gi, '').substring(0, 9)}`
  }, [data])

  return (
    <div className={clsx('relative', className)} style={{ height: `${height}px` }}>
      <svg width="100%" height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--ak-color-accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--ak-color-accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {showGrid && (
          <g className="text-[var(--ak-color-text-muted)]">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - (ratio * height)
              const value = minValue + (range * (1 - ratio))
              return (
                <g key={ratio}>
                  <line
                    x1="0"
                    y1={y}
                    x2="100%"
                    y2={y}
                    stroke="var(--ak-color-border-subtle)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x="0"
                    y={y - 4}
                    fontSize="10"
                    fill="var(--ak-color-text-muted)"
                    className="font-mono"
                  >
                    {value.toFixed(0)}
                  </text>
                </g>
              )
            })}
          </g>
        )}

        {/* Chart Area */}
        {type === 'line' && (
          <>
            {/* Area Fill */}
            <path
              d={`M 0 ${height} ${data.map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100
                const y = height - ((d.value - minValue) / range) * height
                return `L ${x}% ${y}`
              }).join(' ')} L 100% ${height} Z`}
              fill={`url(#${gradientId})`}
              className="transition-all duration-300"
            />
            {/* Line */}
            <path
              d={`M ${data.map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100
                const y = height - ((d.value - minValue) / range) * height
                return `${x}% ${y}`
              }).join(' L ')}`}
              fill="none"
              stroke="var(--ak-color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
            {/* Data Points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1 || 1)) * 100
              const y = height - ((d.value - minValue) / range) * height
              return (
                <circle
                  key={i}
                  cx={`${x}%`}
                  cy={y}
                  r="4"
                  fill="var(--ak-color-accent)"
                  stroke="var(--ak-color-bg-surface)"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:r-6"
                />
              )
            })}
          </>
        )}

        {type === 'bar' && (
          <g>
            {data.map((d, i) => {
              const barWidth = 100 / data.length
              const barHeight = ((d.value - minValue) / range) * height
              const x = (i * barWidth)
              const color = d.color || 'var(--ak-color-accent)'
              return (
                <g key={i}>
                  <rect
                    x={`${x}%`}
                    y={height - barHeight}
                    width={`${barWidth * 0.7}%`}
                    height={barHeight}
                    fill={color}
                    rx="4"
                    className="transition-all duration-300 hover:opacity-80"
                    style={{ transform: 'translateX(15%)' }}
                  />
                </g>
              )
            })}
          </g>
        )}

        {/* X-Axis Labels */}
        <g className="text-[var(--ak-color-text-secondary)]">
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100
            return (
              <text
                key={i}
                x={`${x}%`}
                y={height - 4}
                fontSize="10"
                textAnchor="middle"
                fill="var(--ak-color-text-muted)"
                className="font-medium"
              >
                {d.label}
              </text>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

