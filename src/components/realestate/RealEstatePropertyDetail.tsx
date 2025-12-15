'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react'
import { 
  MapPinIcon, 
  Squares2X2Icon, 
  PhotoIcon,
  DocumentTextIcon,
  ShareIcon,
  PencilIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

interface PropertyPhoto {
  id: string
  url: string
  thumbnail: string
  description?: string
  isPrimary?: boolean
}

interface Property {
  id: string
  title: string
  address: string
  city: string
  zipCode: string
  type: 'Wohnung' | 'Haus' | 'Gewerbe' | 'Grundstück'
  status: 'Aktiv' | 'Vermietet' | 'Verkauft' | 'Reserviert'
  price: number
  priceType: 'Kauf' | 'Miete'
  rooms?: number
  bedrooms?: number
  bathrooms?: number
  area: number
  livingArea?: number
  plotArea?: number
  yearBuilt?: number
  energyRating?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  description: string
  features: string[]
  photos: PropertyPhoto[]
  floorPlan?: string
  virtualTour?: string
  coordinates?: { lat: number; lng: number }
  contact?: {
    name: string
    phone: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface RealEstatePropertyDetailProps {
  property: Property
  onClose: () => void
  onEdit?: (property: Property) => void
}

export function RealEstatePropertyDetail({ property, onClose, onEdit }: RealEstatePropertyDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'details' | 'location' | 'expose'>('overview')

  const primaryPhoto = useMemo(() => 
    property.photos.find(p => p.isPrimary) || property.photos[0],
    [property.photos]
  )

  const handlePreviousPhoto = () => {
    setSelectedPhotoIndex(prev => 
      prev === 0 ? property.photos.length - 1 : prev - 1
    )
  }

  const handleNextPhoto = () => {
    setSelectedPhotoIndex(prev => 
      prev === property.photos.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative h-96 bg-gradient-to-br from-blue-600 to-purple-600">
            {primaryPhoto && (
              <img
                src={primaryPhoto.url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Header Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setShowPhotoModal(true)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                aria-label="Fotos anzeigen"
              >
                <PhotoIcon className="h-5 w-5 text-gray-900" />
              </button>
              <button
                onClick={() => onEdit?.(property)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                aria-label="Bearbeiten"
              >
                <PencilIcon className="h-5 w-5 text-gray-900" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                aria-label="Schließen"
              >
                <XMarkIcon className="h-5 w-5 text-gray-900" />
              </button>
            </div>

            {/* Property Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPinIcon className="h-5 w-5" />
                    <span>{property.address}, {property.zipCode} {property.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {new Intl.NumberFormat('de-DE', { 
                      style: 'currency', 
                      currency: 'EUR',
                      maximumFractionDigits: 0 
                    }).format(property.price)}
                  </div>
                  <div className="text-sm text-white/80">{property.priceType === 'Kauf' ? 'Kaufpreis' : 'Kaltmiete'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex gap-1 px-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Übersicht', icon: Squares2X2Icon },
                { id: 'photos', label: 'Fotos', icon: PhotoIcon },
                { id: 'details', label: 'Details', icon: DocumentTextIcon },
                { id: 'location', label: 'Lage', icon: MapPinIcon },
                { id: 'expose', label: 'Exposé', icon: DocumentTextIcon },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.rooms && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-600">{property.rooms}</div>
                      <div className="text-sm text-gray-600">Zimmer</div>
                    </div>
                  )}
                  {property.area && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-600">{property.area}</div>
                      <div className="text-sm text-gray-600">m²</div>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Schlafzimmer</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-orange-600">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Badezimmer</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Beschreibung</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>

                {/* Features */}
                {property.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ausstattung</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {property.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Kontakt aufnehmen
                  </button>
                  <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <ShareIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <SparklesIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {property.photos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        setSelectedPhotoIndex(idx)
                        setShowPhotoModal(true)
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={photo.thumbnail || photo.url}
                        alt={photo.description || `Foto ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {photo.isPrimary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Hauptfoto
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Grunddaten</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Typ</span>
                        <span className="font-medium">{property.type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Status</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          property.status === 'Aktiv' ? 'bg-green-100 text-green-800' :
                          property.status === 'Vermietet' ? 'bg-blue-100 text-blue-800' :
                          property.status === 'Verkauft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      {property.yearBuilt && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Baujahr</span>
                          <span className="font-medium">{property.yearBuilt}</span>
                        </div>
                      )}
                      {property.energyRating && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Energieausweis</span>
                          <span className="font-medium">{property.energyRating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Flächen</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Wohnfläche</span>
                        <span className="font-medium">{property.area} m²</span>
                      </div>
                      {property.livingArea && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Wohnfläche</span>
                          <span className="font-medium">{property.livingArea} m²</span>
                        </div>
                      )}
                      {property.plotArea && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Grundstücksfläche</span>
                          <span className="font-medium">{property.plotArea} m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Karte wird hier angezeigt</p>
                    <p className="text-sm mt-1">{property.address}, {property.city}</p>
                  </div>
                </div>
                {property.coordinates && (
                  <div className="text-sm text-gray-600">
                    Koordinaten: {property.coordinates.lat}, {property.coordinates.lng}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'expose' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Exposé</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    PDF herunterladen
                  </button>
                </div>
                <div className="prose max-w-none">
                  <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                      <p className="text-gray-600">{property.address}, {property.zipCode} {property.city}</p>
                    </div>
                    {primaryPhoto && (
                      <img
                        src={primaryPhoto.url}
                        alt={property.title}
                        className="w-full h-96 object-cover rounded-lg mb-6"
                      />
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {property.rooms && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{property.rooms}</div>
                          <div className="text-sm text-gray-600">Zimmer</div>
                        </div>
                      )}
                      {property.area && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{property.area}</div>
                          <div className="text-sm text-gray-600">m²</div>
                        </div>
                      )}
                      {property.bedrooms && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                          <div className="text-sm text-gray-600">Schlafzimmer</div>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                          <div className="text-sm text-gray-600">Badezimmer</div>
                        </div>
                      )}
                    </div>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">Beschreibung</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {property.description}
                      </p>
                    </div>
                    {property.features.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Ausstattung</h2>
                        <ul className="grid grid-cols-2 gap-2">
                          {property.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="pt-6 border-t border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt</h2>
                      {property.contact ? (
                        <div className="space-y-2">
                          <p className="text-gray-700">{property.contact.name}</p>
                          <p className="text-gray-700">{property.contact.phone}</p>
                          <p className="text-gray-700">{property.contact.email}</p>
                        </div>
                      ) : (
                        <p className="text-gray-600">Kontaktinformationen verfügbar</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setShowPhotoModal(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePreviousPhoto()
            }}
            className="absolute left-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            aria-label="Vorheriges Foto"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNextPhoto()
            }}
            className="absolute right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            aria-label="Nächstes Foto"
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
          <img
            src={property.photos[selectedPhotoIndex]?.url}
            alt={property.photos[selectedPhotoIndex]?.description || `Foto ${selectedPhotoIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedPhotoIndex + 1} / {property.photos.length}
          </div>
        </div>
      )}
    </div>
  )
}
