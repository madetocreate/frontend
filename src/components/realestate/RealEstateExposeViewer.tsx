'use client'
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { 
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  XMarkIcon,
  MapPinIcon,
  Squares2X2Icon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline'

interface Expose {
  id: string
  propertyId: string
  title: string
  address: string
  city: string
  zipCode: string
  type: 'Wohnung' | 'Haus' | 'Gewerbe' | 'Grundstück'
  price: number
  priceType: 'Kauf' | 'Miete'
  rooms?: number
  bedrooms?: number
  bathrooms?: number
  area: number
  description: string
  features: string[]
  photos: Array<{
    id: string
    url: string
    description?: string
  }>
  contact: {
    name: string
    phone: string
    email: string
  }
  createdAt: string
  pdfUrl?: string
}

interface RealEstateExposeViewerProps {
  expose: Expose
  onClose?: () => void
}

export function RealEstateExposeViewer({ expose, onClose }: RealEstateExposeViewerProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  const handleDownloadPDF = () => {
    // TODO: Generate and download PDF
    console.log('Download PDF:', expose.id)
  }

  const handleShare = () => {
    // TODO: Share expose
    if (navigator.share) {
      navigator.share({
        title: expose.title,
        text: expose.description,
        url: window.location.href
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{expose.title}</h1>
        <p className="text-gray-600">{expose.address}, {expose.zipCode} {expose.city}</p>
      </div>

      {/* Screen Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{expose.title}</h1>
            <p className="text-sm text-gray-600">{expose.address}, {expose.city}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="PDF herunterladen"
              title="PDF herunterladen"
            >
              <ArrowDownTrayIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Teilen"
              title="Teilen"
            >
              <ShareIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Drucken"
              title="Drucken"
            >
              <PrinterIcon className="h-5 w-5 text-gray-600" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Schließen"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 print:p-0">
        {/* Hero Section */}
        <div className="mb-8">
          {expose.photos.length > 0 && (
            <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
              <img
                src={expose.photos[selectedPhotoIndex]?.url}
                alt={expose.title}
                className="w-full h-full object-cover"
              />
              {expose.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {expose.photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === selectedPhotoIndex ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                      aria-label={`Foto ${idx + 1} anzeigen`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Key Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {expose.rooms && (
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Squares2X2Icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{expose.rooms}</div>
                <div className="text-sm text-gray-600">Zimmer</div>
              </div>
            )}
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Square3Stack3DIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{expose.area}</div>
              <div className="text-sm text-gray-600">m²</div>
            </div>
            {expose.bedrooms && (
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Squares2X2Icon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{expose.bedrooms}</div>
                <div className="text-sm text-gray-600">Schlafzimmer</div>
              </div>
            )}
            {expose.bathrooms && (
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <Squares2X2Icon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{expose.bathrooms}</div>
                <div className="text-sm text-gray-600">Badezimmer</div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {new Intl.NumberFormat('de-DE', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0 
              }).format(expose.price)}
            </div>
            <div className="text-lg text-gray-600">
              {expose.priceType === 'Kauf' ? 'Kaufpreis' : 'Kaltmiete pro Monat'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Beschreibung</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {expose.description}
            </p>
          </div>
        </div>

        {/* Features */}
        {expose.features.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ausstattung</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {expose.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {expose.photos.length > 1 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fotogalerie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {expose.photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={photo.url}
                    alt={photo.description || `Foto ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {idx === selectedPhotoIndex && (
                    <div className="absolute inset-0 border-4 border-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lage</h2>
          <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">{expose.address}</p>
              <p className="text-sm">{expose.zipCode} {expose.city}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Name</div>
              <div className="text-lg font-semibold text-gray-900">{expose.contact.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Telefon</div>
              <div className="text-lg font-semibold text-gray-900">{expose.contact.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">E-Mail</div>
              <div className="text-lg font-semibold text-gray-900">{expose.contact.email}</div>
            </div>
          </div>
          <button className="mt-6 w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Kontakt aufnehmen
          </button>
        </div>
      </div>
    </div>
  )
}
