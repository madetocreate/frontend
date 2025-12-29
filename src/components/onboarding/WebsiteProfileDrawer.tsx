'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2 } from 'lucide-react'
import type { WebsiteScanResult } from './OnboardingResultCard'

interface WebsiteProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialData: WebsiteScanResult['fields']
  onSave: (data: WebsiteScanResult['fields']) => Promise<void>
}

export function WebsiteProfileDrawer({ isOpen, onClose, initialData, onSave }: WebsiteProfileDrawerProps) {
  const [formData, setFormData] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const fields = [
    { key: 'company_name', label: 'Firmenname', placeholder: 'z.B. Acme GmbH' },
    { key: 'website', label: 'Website', placeholder: 'https://acme.de' },
    { key: 'industry', label: 'Branche', placeholder: 'z.B. Software, E-Commerce, Beratung' },
    { key: 'value_proposition', label: 'Kernversprechen', placeholder: 'Was macht euch besonders?', multiline: true },
    { key: 'target_audience', label: 'Zielgruppe', placeholder: 'z.B. KMU, Startups, Enterprise' },
    { key: 'products_services', label: 'Hauptleistungen', placeholder: 'Eure wichtigsten Produkte/Services', multiline: true },
    { key: 'keywords', label: 'Keywords', placeholder: 'Wichtige Begriffe, kommagetrennt' },
  ] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md ak-bg-surface border-l ak-border-default z-50 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b ak-border-default ak-bg-surface">
              <div>
                <h2 className="text-lg font-bold ak-text-primary">Profil bearbeiten</h2>
                <p className="text-xs ak-text-secondary">Passe die erkannten Informationen an</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:ak-bg-surface-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium ak-text-secondary mb-1">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      value={formData[field.key as keyof typeof formData] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl ak-bg-surface-2 ak-border-default border ak-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key as keyof typeof formData] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-xl ak-bg-surface-2 ak-border-default border ak-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ak-border-default ak-bg-surface">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium ak-text-secondary hover:ak-text-primary transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium style={{ color: 'var(--ak-text-primary-dark)' }} bg-[var(--ak-color-accent)] hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Speichern
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

