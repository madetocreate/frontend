'use client'

import { useMemo, useRef } from 'react'
import { useProjects, addProjectFiles } from '@/lib/projectsStore'
import { AkButton } from '@/components/ui/AkButton'
import { AkListRow } from '@/components/ui/AkListRow'
import { XMarkIcon, PhotoIcon, DocumentIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface ProjectFilesOverlayProps {
  projectId: string
  onClose: () => void
}

export function ProjectFilesOverlay({ projectId, onClose }: ProjectFilesOverlayProps) {
  const { projects } = useProjects()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId)
  }, [projects, projectId])

  const files = useMemo(() => {
    return Array.isArray(project?.files) ? project.files : []
  }, [project])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || [])
    if (fileList.length === 0) return

    const newFiles = fileList.map(file => ({
      documentId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}-${Math.random()}`,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      createdAt: Date.now()
    }))

    await addProjectFiles(projectId, newFiles)
    
    // Reset input
    if (e.target) e.target.value = ''
  }

  const handleAddPhotos = () => {
    photoInputRef.current?.click()
  }

  const handleAddFiles = () => {
    fileInputRef.current?.click()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[var(--ak-color-bg-app)]/80 backdrop-blur-sm" />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[80vh] bg-[var(--ak-color-bg-surface)] rounded-2xl shadow-2xl border border-[var(--ak-color-border-subtle)] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--ak-color-border-fine)]">
            <h2 className="text-xl font-semibold text-[var(--ak-color-text-primary)]">
              Projektdateien
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--ak-color-text-muted)]" />
            </button>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto ak-scrollbar p-6">
            {files.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[var(--ak-color-text-muted)] mb-4">
                  Noch keine Dateien in diesem Projekt
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {files.map((file) => (
                  <AkListRow
                    key={file.documentId}
                    accent="graphite"
                    leading={<PaperClipIcon className="w-4 h-4 text-[var(--ak-color-text-muted)]" />}
                    title={
                      <div>
                        <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                          {file.filename}
                        </div>
                        {file.mimeType && (
                          <div className="text-xs text-[var(--ak-color-text-muted)] mt-0.5">
                            {file.mimeType}
                          </div>
                        )}
                      </div>
                    }
                    trailing={
                      file.size ? (
                        <span className="text-xs text-[var(--ak-color-text-muted)]">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      ) : null
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 p-6 border-t border-[var(--ak-color-border-fine)]">
            {/* Hidden Inputs */}
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={photoInputRef} 
              onChange={handleFileChange} 
            />

            <AkButton
              variant="secondary"
              size="sm"
              onClick={handleAddPhotos}
              leftIcon={<PhotoIcon className="w-4 h-4" />}
            >
              Fotos hinzufügen
            </AkButton>
            <AkButton
              variant="secondary"
              size="sm"
              onClick={handleAddFiles}
              leftIcon={<DocumentIcon className="w-4 h-4" />}
            >
              Dateien hinzufügen
            </AkButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
