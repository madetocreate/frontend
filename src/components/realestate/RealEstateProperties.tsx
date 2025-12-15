'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon, 
  MapPinIcon,
  PhotoIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline'
import { RealEstatePropertyDetail } from './RealEstatePropertyDetail'
import { RealEstateExposeGenerator } from './RealEstateExposeGenerator'
import { RealEstateCustomerMatching } from './RealEstateCustomerMatching'

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
  photos: Array<{
    id: string
    url: string
    thumbnail: string
    description?: string
    isPrimary?: boolean
  }>
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

export function RealEstateProperties() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'rented' | 'sold'>('all')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showExposeGenerator, setShowExposeGenerator] = useState(false)
  const [showCustomerMatching, setShowCustomerMatching] = useState(false)

  // TODO: Load from backend
  const properties = useMemo<Property[]>(() => [
    {
      id: '1',
      title: 'Moderne 3-Zimmer-Wohnung',
      address: 'Musterstraße 1',
      city: 'Musterstadt',
      zipCode: '12345',
      type: 'Wohnung',
      status: 'Aktiv',
      price: 1200,
      priceType: 'Miete',
      rooms: 3,
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      livingArea: 85,
      yearBuilt: 2020,
      energyRating: 'A',
      description: 'Helle und moderne 3-Zimmer-Wohnung in ruhiger Lage. Die Wohnung verfügt über eine moderne Einbauküche, ein großzügiges Wohnzimmer mit Balkon und zwei Schlafzimmer. Parkplatz vorhanden.',
      features: ['Balkon', 'Einbauküche', 'Parkplatz', 'Aufzug', 'Fußbodenheizung'],
      photos: [
        { id: '1', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200', description: 'Wohnzimmer', isPrimary: true },
        { id: '2', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200', description: 'Küche' },
        { id: '3', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200', description: 'Schlafzimmer' },
      ],
      contact: {
        name: 'Max Mustermann',
        phone: '+49 171 1234567',
        email: 'max@example.com'
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      title: 'Einfamilienhaus mit Garten',
      address: 'Beispielweg 5',
      city: 'Musterstadt',
      zipCode: '12345',
      type: 'Haus',
      status: 'Vermietet',
      price: 1800,
      priceType: 'Miete',
      rooms: 5,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      livingArea: 150,
      plotArea: 400,
      yearBuilt: 2015,
      energyRating: 'B',
      description: 'Schönes Einfamilienhaus mit großem Garten in ruhiger Wohnlage. Das Haus verfügt über eine moderne Ausstattung, eine Einliegerwohnung und eine Garage.',
      features: ['Garten', 'Garage', 'Einliegerwohnung', 'Terrasse', 'Keller'],
      photos: [
        { id: '1', url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', thumbnail: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200', description: 'Außenansicht', isPrimary: true },
        { id: '2', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200', description: 'Wohnzimmer' },
      ],
      contact: {
        name: 'Anna Schmidt',
        phone: '+49 171 2345678',
        email: 'anna@example.com'
      },
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      title: 'Gewerbeimmobilie im Zentrum',
      address: 'Testallee 10',
      city: 'Musterstadt',
      zipCode: '12345',
      type: 'Gewerbe',
      status: 'Aktiv',
      price: 2500,
      priceType: 'Miete',
      area: 200,
      yearBuilt: 2010,
      energyRating: 'C',
      description: 'Moderne Gewerbeimmobilie in zentraler Lage. Ideal für Büros, Praxen oder Einzelhandel. Gute Verkehrsanbindung und Parkplätze vorhanden.',
      features: ['Zentrale Lage', 'Parkplätze', 'Aufzug', 'Klimaanlage', 'Fensterfront'],
      photos: [
        { id: '1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200', description: 'Büroräume', isPrimary: true },
      ],
      contact: {
        name: 'Peter Weber',
        phone: '+49 171 3456789',
        email: 'peter@example.com'
      },
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19'
    }
  ], [])

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (filter === 'active') return matchesSearch && p.status === 'Aktiv'
      if (filter === 'rented') return matchesSearch && p.status === 'Vermietet'
      if (filter === 'sold') return matchesSearch && p.status === 'Verkauft'
      return matchesSearch
    })
  }, [properties, searchQuery, filter])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Immobilien</h2>
          <p className="text-gray-600 mt-1">{properties.length} Immobilien gesamt</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowExposeGenerator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            aria-label="Exposé generieren"
          >
            <SparklesIcon className="h-5 w-5" />
            AI Exposé
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            aria-label="Neue Immobilie erstellen"
          >
            <PlusIcon className="h-5 w-5" />
            Neue Immobilie
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Immobilien suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            aria-label="Immobilien durchsuchen"
          />
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter">
          {(['all', 'active', 'rented', 'sold'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'Alle' : f === 'active' ? 'Aktiv' : f === 'rented' ? 'Vermietet' : 'Verkauft'}
            </button>
          ))}
        </div>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Immobilien gefunden</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Fügen Sie Ihre erste Immobilie hinzu.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const primaryPhoto = property.photos.find(p => p.isPrimary) || property.photos[0]
            
            return (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group"
                onClick={() => setSelectedProperty(property)}
                role="button"
                tabIndex={0}
                aria-label={`Immobilie ${property.title} öffnen`}
              >
                {/* Photo */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto.thumbnail || primaryPhoto.url}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-lg font-medium ${
                      property.status === 'Aktiv' ? 'bg-green-500 text-white' :
                      property.status === 'Vermietet' ? 'bg-blue-500 text-white' :
                      property.status === 'Verkauft' ? 'bg-gray-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  {property.photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
                      {property.photos.length} Fotos
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {property.rooms && (
                      <div className="flex items-center gap-1">
                        <Squares2X2Icon className="h-4 w-4" />
                        <span>{property.rooms} Zimmer</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Square3Stack3DIcon className="h-4 w-4" />
                      <span>{property.area} m²</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('de-DE', { 
                          style: 'currency', 
                          currency: 'EUR',
                          maximumFractionDigits: 0 
                        }).format(property.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {property.priceType === 'Kauf' ? 'Kaufpreis' : 'Kaltmiete'}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProperty(property)
                          setShowCustomerMatching(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Kunden-Matching"
                        title="Passende Kunden finden"
                      >
                        <UserGroupIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Open expose
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Exposé anzeigen"
                        title="Exposé anzeigen"
                      >
                        <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && !showCustomerMatching && (
        <RealEstatePropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={(property) => {
            // TODO: Open edit modal
            console.log('Edit property:', property)
          }}
        />
      )}

      {/* Exposé Generator */}
      {showExposeGenerator && (
        <RealEstateExposeGenerator
          onClose={() => setShowExposeGenerator(false)}
          onComplete={(expose) => {
            console.log('Exposé erstellt:', expose)
            setShowExposeGenerator(false)
          }}
        />
      )}

      {/* Customer Matching */}
      {showCustomerMatching && selectedProperty && (
        <RealEstateCustomerMatching
          property={selectedProperty}
          onClose={() => {
            setShowCustomerMatching(false)
            setSelectedProperty(null)
          }}
        />
      )}
    </div>
  )
}
