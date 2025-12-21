'use client'
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { 
  SparklesIcon, 
  PhotoIcon, 
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ExposeData {
  id: string
  title: string
  description?: string
  features?: string[]
  photos?: { id: string; url: string; thumbnail?: string }[]
}

interface ExposeGeneratorProps {
  onClose?: () => void
  onComplete?: (expose: ExposeData) => void
}

export function RealEstateExposeGenerator({ onClose, onComplete }: ExposeGeneratorProps) {
  const [step, setStep] = useState<'upload' | 'analyze' | 'generate' | 'review' | 'complete'>('upload')
  const [photos, setPhotos] = useState<File[]>([])
  const [propertyData, setPropertyData] = useState({
    address: '',
    type: 'Wohnung' as 'Wohnung' | 'Haus' | 'Gewerbe' | 'Grundstück',
    rooms: '',
    area: '',
    price: '',
    description: ''
  })
  const [generatedExpose, setGeneratedExpose] = useState<ExposeData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files)
      setPhotos(prev => [...prev, ...newPhotos])
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyzePhotos = async () => {
    setStep('analyze')
    setIsGenerating(true)
    
    // Simuliere AI-Analyse
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // AI würde hier die Fotos analysieren und Daten extrahieren
    setPropertyData(prev => ({
      ...prev,
      description: 'AI-generierte Beschreibung basierend auf Fotos...'
    }))
    
    setIsGenerating(false)
    setStep('generate')
  }

  const handleGenerateExpose = async () => {
    setIsGenerating(true)
    
    // Simuliere Exposé-Generierung
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const expose: ExposeData = {
      id: 'expose-preview',
      title: `${propertyData.type} in ${propertyData.address}`,
      description: propertyData.description,
      features: ['Moderne Küche', 'Balkon', 'Parkplatz', 'Aufzug'],
      photos: photos.map((_, i) => ({
        id: `photo-${i}`,
        url: URL.createObjectURL(photos[i]),
        thumbnail: URL.createObjectURL(photos[i])
      }))
    }
    
    setGeneratedExpose(expose)
    setIsGenerating(false)
    setStep('review')
  }

  const handleComplete = () => {
    if (generatedExpose) {
      onComplete?.(generatedExpose)
    }
    setStep('complete')
    setTimeout(() => {
      onClose?.()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI Exposé-Generator</h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Schließen"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[
                { id: 'upload', label: 'Fotos hochladen' },
                { id: 'analyze', label: 'AI-Analyse' },
                { id: 'generate', label: 'Exposé erstellen' },
                { id: 'review', label: 'Überprüfen' },
              ].map((s, idx) => {
                const stepIndex = ['upload', 'analyze', 'generate', 'review'].indexOf(step)
                const isActive = idx <= stepIndex
                const isCurrent = s.id === step
                
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-sm ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fotos hochladen</h3>
                  <p className="text-gray-600 mb-4">
                    Laden Sie Fotos der Immobilie hoch. Die AI analysiert diese automatisch und erstellt eine Beschreibung.
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Fotos auswählen
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG bis zu 10MB</p>
                </div>

                {/* Uploaded Photos */}
                {photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Hochgeladene Fotos ({photos.length})
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Foto entfernen"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                          {idx === 0 && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                              Hauptfoto
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Property Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={propertyData.address}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Musterstraße 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                    <select
                      value={propertyData.type}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, type: e.target.value as 'Wohnung' | 'Haus' | 'Gewerbe' | 'Grundstück' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Wohnung</option>
                      <option>Haus</option>
                      <option>Gewerbe</option>
                      <option>Grundstück</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zimmer</label>
                    <input
                      type="number"
                      value={propertyData.rooms}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, rooms: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fläche (m²)</label>
                    <input
                      type="number"
                      value={propertyData.area}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="85"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyzePhotos}
                  disabled={photos.length === 0 || !propertyData.address}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Fotos analysieren & Weiter
                </button>
              </div>
            )}

            {step === 'analyze' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI analysiert Fotos...</h3>
                <p className="text-gray-600">
                  Die AI erkennt Räume, Ausstattung und Features automatisch
                </p>
              </div>
            )}

            {step === 'generate' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Beschreibung bearbeiten</h3>
                  <p className="text-gray-600 mb-4">
                    Die AI hat eine Beschreibung generiert. Sie können diese anpassen.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                  <textarea
                    value={propertyData.description}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="AI-generierte Beschreibung..."
                  />
                </div>

                <button
                  onClick={handleGenerateExpose}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isGenerating ? 'Exposé wird erstellt...' : 'Exposé erstellen'}
                </button>
              </div>
            )}

            {step === 'review' && generatedExpose && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Exposé-Vorschau</h3>
                  <p className="text-gray-600 mb-4">
                    Überprüfen Sie das generierte Exposé und passen Sie es bei Bedarf an.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{generatedExpose.title}</h4>
                  <p className="text-gray-700 mb-4">{generatedExpose.description}</p>
                  
                  {generatedExpose.features && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Features:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {generatedExpose.features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedExpose.photos && generatedExpose.photos.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Fotos ({generatedExpose.photos.length})</h5>
                      <div className="grid grid-cols-4 gap-2">
                        {generatedExpose.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo.url}
                            alt={`Foto ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleComplete}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Exposé speichern
                  </button>
                  <button
                    onClick={() => setStep('generate')}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center py-12">
                <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Exposé erstellt!</h3>
                <p className="text-gray-600">
                  Das Exposé wurde erfolgreich generiert und gespeichert.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
