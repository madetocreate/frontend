'use client'

import { motion, useMotionValue, useSpring, HTMLMotionProps, useReducedMotion } from 'framer-motion'
import { useRef, MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode
  isActive?: boolean
  magnetStrength?: number
}

export function MagneticButton({ 
  children, 
  className, 
  onClick, 
  isActive, 
  onMouseMove,
  onMouseLeave,
  magnetStrength = 0.15, // Reduced from implicit higher value
  ...props 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const shouldReduceMotion = useReducedMotion()
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for smooth "magnetic" return - made slightly stiffer/faster for "quiet" feel
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    // Call original handler if provided
    onMouseMove?.(e)

    if (shouldReduceMotion) return
    if (!ref.current) return
    
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    
    // Calculate distance from center
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    
    // Move element towards mouse (Magnet effect)
    x.set(middleX * magnetStrength)
    y.set(middleY * magnetStrength)
  }

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    // Call original handler
    onMouseLeave?.(e)
    
    x.set(0)
    y.set(0)
  }

  // Define animations based on reduced motion preference
  const animations = shouldReduceMotion ? {
    animate: { scale: isActive ? 1.02 : 1 },
    whileHover: { scale: 1 },
    whileTap: { scale: 0.98 }
  } : {
    animate: { scale: isActive ? 1.02 : 1 },
    whileHover: { scale: 1.02 }, 
    whileTap: { scale: 0.97 },
    style: { x: springX, y: springY }
  }

  return (
    <motion.button
      ref={ref}
      className={cn(className)}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...animations}
      {...props}
    >
      {children}
    </motion.button>
  )
}
