'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, SparklesIcon, BoltIcon, BeakerIcon, CheckIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export interface AIModel {
  id: string
  name: string
  description: string
  icon: 'sparkles' | 'bolt' | 'beaker'
  speed: 'fast' | 'medium' | 'slow'
  quality: 'standard' | 'high' | 'premium'
  contextWindow?: string
}

const MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Schnell & intelligent',
    icon: 'sparkles',
    speed: 'fast',
    quality: 'premium',
    contextWindow: '128K'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Schnell & effizient',
    icon: 'bolt',
    speed: 'fast',
    quality: 'high',
    contextWindow: '128K'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Kreativ & detailliert',
    icon: 'beaker',
    speed: 'medium',
    quality: 'premium',
    contextWindow: '128K'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Schnell & kostengünstig',
    icon: 'bolt',
    speed: 'fast',
    quality: 'standard',
    contextWindow: '16K'
  },
]

const MODEL_STORAGE_KEY = 'aklow.chat.selectedModel'

interface ModelSelectorProps {
  className?: string
  onModelChange?: (modelId: string) => void
}

export function ModelSelector({ className, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState('gpt-4o')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load saved model preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY)
      if (saved && MODELS.find(m => m.id === saved)) {
        setSelectedModelId(saved)
      }
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Dispatch model change event
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('aklow-model-changed', { detail: { modelId: selectedModelId } }))
  }, [selectedModelId])

  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0]

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId)
    localStorage.setItem(MODEL_STORAGE_KEY, modelId)
    onModelChange?.(modelId)
    setIsOpen(false)
  }

  const getIcon = (iconType: AIModel['icon']) => {
    switch (iconType) {
      case 'sparkles': return SparklesIcon
      case 'bolt': return BoltIcon
      case 'beaker': return BeakerIcon
      default: return SparklesIcon
    }
  }

  const SelectedIcon = getIcon(selectedModel.icon)

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          "bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)]",
          "border border-[var(--ak-color-border-fine)] hover:border-[var(--ak-color-border-subtle)]",
          "text-[var(--ak-color-text-primary)]",
          isOpen && "ring-2 ring-[var(--ak-color-accent-soft)]"
        )}
      >
        <SelectedIcon className="h-4 w-4 text-[var(--ak-color-accent)]" />
        <span>{selectedModel.name}</span>
        <ChevronDownIcon className={clsx(
          "h-3.5 w-3.5 text-[var(--ak-color-text-muted)] transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {MODELS.map((model) => {
              const Icon = getIcon(model.icon)
              const isSelected = model.id === selectedModelId
              
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={clsx(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                    isSelected 
                      ? "bg-[var(--ak-color-accent-soft)]" 
                      : "hover:bg-[var(--ak-color-bg-hover)]"
                  )}
                >
                  <div className={clsx(
                    "p-2 rounded-lg",
                    isSelected ? "bg-[var(--ak-color-accent)]" : "bg-[var(--ak-color-bg-surface-muted)]"
                  )}>
                    <Icon className={clsx(
                      "h-4 w-4",
                      isSelected ? "" : "text-[var(--ak-color-text-muted)]"
                    )}
                    style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "font-medium",
                        isSelected ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-primary)]"
                      )}>
                        {model.name}
                      </span>
                      {model.contextWindow && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)]">
                          {model.contextWindow}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--ak-color-text-muted)] mt-0.5">
                      {model.description}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <CheckIcon className="h-4 w-4 text-[var(--ak-color-accent)] flex-shrink-0 mt-1" />
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="border-t border-[var(--ak-color-border-subtle)] px-4 py-2 bg-[var(--ak-color-bg-surface-muted)]">
            <p className="text-[10px] text-[var(--ak-color-text-muted)]">
              Modell wird für neue Nachrichten in diesem Chat verwendet
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Hook um das aktuell ausgewählte Modell zu lesen
 */
export function useSelectedModel(): string {
  const [modelId, setModelId] = useState('gpt-4o')
  
  useEffect(() => {
    // Initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY)
      if (saved) setModelId(saved)
    }
    
    // Listen for changes
    const handleChange = (e: CustomEvent<{ modelId: string }>) => {
      setModelId(e.detail.modelId)
    }
    
    window.addEventListener('aklow-model-changed', handleChange as EventListener)
    return () => window.removeEventListener('aklow-model-changed', handleChange as EventListener)
  }, [])
  
  return modelId
}

