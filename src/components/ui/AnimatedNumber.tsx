'use client'

import { useEffect, useState, useId } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  className?: string
  decimals?: number
  suffix?: string
  duration?: number
}

export function AnimatedNumber({ 
  value, 
  className = '', 
  decimals = 0,
  suffix = '',
  duration = 1000 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = easeOut * value
      
      setDisplayValue(current)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [value, duration])

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString('de-DE')

  return (
    <span className={className}>
      {formatted}{suffix}
    </span>
  )
}

// Sparkline Component for mini charts
interface SparklineProps {
  data: number[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = 'var(--ak-semantic-info)', height = 30 }: SparklineProps) {
  const gid = useId()
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="w-full" style={{ height }} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={points}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  )
}

// Live Pulse Indicator
export function LivePulse({ label, color = 'green' }: { label?: string; color?: string }) {
  const colorClasses = {
    green: 'bg-[var(--ak-semantic-success)]',
    blue: 'bg-[var(--ak-semantic-info)]',
    orange: 'bg-[var(--ak-semantic-warning)]',
    red: 'bg-[var(--ak-semantic-danger)]'
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.green} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-3 w-3 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.green}`} />
      </span>
      {label && <span className="text-sm font-medium text-[var(--ak-color-text-secondary)]">{label}</span>}
    </div>
  )
}

// Progress Ring
interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
}

export function ProgressRing({ value, size = 80, strokeWidth = 6, color = 'var(--ak-semantic-info)' }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--ak-color-border-subtle)]"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[var(--ak-color-text-primary)]">
          {Math.round(value)}%
        </span>
      </div>
    </div>
  )
}

