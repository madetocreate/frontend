'use client'

import { motion, useMotionValue, useSpring, HTMLMotionProps } from 'framer-motion'
import { useRef, MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode
  isActive?: boolean
}

export function MagneticButton({ 
  children, 
  className, 
  onClick, 
  isActive, 
  onMouseMove,
  onMouseLeave,
  ...props 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for smooth "magnetic" return
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    // Call original handler if provided
    onMouseMove?.(e)

    if (!ref.current) return
    
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    
    // Calculate distance from center
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    
    // Move element towards mouse (Magnet effect)
    x.set(middleX * 0.25)
    y.set(middleY * 0.25)
  }

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    // Call original handler
    onMouseLeave?.(e)
    
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className={cn(className)}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      animate={{ scale: isActive ? 1.05 : 1 }}
      whileHover={{ scale: 1.2 }} 
      whileTap={{ scale: 0.9 }}   
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
