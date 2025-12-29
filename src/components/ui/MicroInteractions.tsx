'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// Hover Lift Effect
export function HoverLift({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Hover Glow Effect
export function HoverGlow({ children, color = 'blue' }: { children: ReactNode; color?: string }) {
  const glowClasses: Record<string, string> = {
    blue: 'from-blue-500/0 to-blue-500/0',
    purple: 'from-purple-500/0 to-purple-500/0',
    green: 'from-green-500/0 to-green-500/0',
    orange: 'from-orange-500/0 to-orange-500/0',
    pink: 'from-pink-500/0 to-pink-500/0',
    indigo: 'from-indigo-500/0 to-indigo-500/0',
  }

  const glowClass = glowClasses[color] || glowClasses.blue

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${glowClass} blur-xl`}
        whileHover={{ 
          backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
          opacity: [0, 0.3, 0.3]
        }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  )
}

// Ripple Effect Button
export function RippleButton({ 
  children, 
  onClick, 
  className = '' 
}: { 
  children: ReactNode
  onClick?: () => void
  className?: string 
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.span
        className="absolute inset-0 bg-[var(--ak-color-bg-surface)]/20"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      {children}
    </motion.button>
  )
}

// Magnetic Button (follows cursor)
export function MagneticButton({ 
  children, 
  onClick,
  className = '' 
}: { 
  children: ReactNode
  onClick?: () => void
  className?: string 
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        e.currentTarget.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
      }}
    >
      {children}
    </motion.button>
  )
}

// Shake Animation (for errors)
export function Shake({ children, trigger }: { children: ReactNode; trigger: boolean }) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      } : {}}
    >
      {children}
    </motion.div>
  )
}

// Pulse Animation (for notifications)
export function Pulse({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Bounce Animation (for new items)
export function Bounce({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 500,
        damping: 15 
      }}
    >
      {children}
    </motion.div>
  )
}

// Copy Feedback Animation
export function CopyFeedback({ 
  children, 
  copied, 
  className = '' 
}: { 
  children: ReactNode
  copied: boolean
  className?: string 
}) {
  return (
    <motion.div className={`relative ${className}`}>
      {children}
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap"
        >
          ✓ Kopiert!
        </motion.div>
      )}
    </motion.div>
  )
}

// Hover Rotate Icon
export function HoverRotateIcon({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ rotate: 15 }}
      whileTap={{ rotate: -15 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

