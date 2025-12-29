'use client'

import { ReactNode, useMemo } from 'react'
import { AkOverlay } from './AkOverlay'

interface AkModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'bottom'
  showCloseButton?: boolean
}

export function AkModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  showCloseButton = true
}: AkModalProps) {
  const maxWidth = useMemo(() => {
    // Tailwind-Äquivalente: md ~ 28rem, lg ~ 32rem, 2xl ~ 42rem, 4xl ~ 56rem, 7xl ~ 80rem
    const map: Record<NonNullable<AkModalProps['size']>, string> = {
      sm: '28rem',
      md: '32rem',
      lg: '42rem',
      xl: '56rem',
      full: '80rem',
    }
    return map[size]
  }, [size])

  return (
    <AkOverlay
      isOpen={isOpen}
      onClose={onClose}
      variant="modal"
      position={position}
      title={title}
      showCloseButton={showCloseButton}
      closeOnEscape={true}
      closeOnBackdrop={true}
      maxWidth={maxWidth}
    >
      {children}
    </AkOverlay>
  )
}

