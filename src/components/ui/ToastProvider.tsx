'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  requestId?: string
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, requestId?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000, requestId?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration, requestId }])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const isDev = process.env.NODE_ENV === 'development'
  const styles = {
    success: { bg: 'bg-[var(--ak-semantic-success)]', icon: CheckCircle2 },
    error: { bg: 'bg-[var(--ak-semantic-danger)]', icon: AlertCircle },
    warning: { bg: 'bg-[var(--ak-semantic-warning)]', icon: AlertCircle },
    info: { bg: 'bg-[var(--ak-semantic-info)]', icon: Info },
  }[toast.type]

  const Icon = styles.icon

  return (
    <div className={`${styles.bg} text-[var(--ak-color-text-inverted)] p-4 rounded-lg shadow-lg flex items-start gap-3 min-w-[300px]`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-medium">{toast.message}</div>
        {isDev && toast.requestId && (
          <div className="text-[10px] opacity-70 mt-1 font-mono break-all">
            ID: {toast.requestId}
          </div>
        )}
      </div>
      <button onClick={onClose} className="opacity-80 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

