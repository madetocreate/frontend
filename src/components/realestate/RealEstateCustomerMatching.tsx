'use client'

import { useState, useMemo } from 'react'
import { 
  UserGroupIcon, 
  SparklesIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  preferences: {
    type: ('Wohnung' | 'Haus' | 'Gewerbe' | 'Grundstück')[]
    minRooms?: number
    maxRooms?: number
    minArea?: number
    maxArea?: number
    maxPrice?: number
    locations: string[]
  }
  searchHistory: string[]
  savedProperties: string[]
  matchScore?: number
}

interface Property {
  id: string
  title: string
  type: 'Wohnung' | 'Haus' | 'Gewerbe' | 'Grundstück'
  rooms?: number
  area: number
  price: number
  city: string
  status: 'Aktiv' | 'Vermietet' | 'Verkauft' | 'Reserviert'
}

interface RealEstateCustomerMatchingProps {
  property: Property
  onClose?: () => void
}

export function RealEstateCustomerMatching({ property, onClose }: RealEstateCustomerMatchingProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // TODO: Load from backend
  const customers = useMemo<Customer[]>(() => [
    {
      id: '1',
      name: 'Max Mustermann',
      email: 'max@example.com',
      phone: '+49 171 1234567',
      preferences: {
        type: ['Wohnung', 'Haus'],
        minRooms: 3,
        maxRooms: 5,
        minArea: 80,
        maxArea: 150,
        maxPrice: 1500,
        locations: ['Musterstadt', 'Berlin']
      },
      searchHistory: ['3-Zimmer-Wohnung', 'Haus mit Garten'],
      savedProperties: ['prop-1', 'prop-2'],
      matchScore: 95
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      email: 'anna@example.com',
      phone: '+49 171 2345678',
      preferences: {
        type: ['Wohnung'],
        minRooms: 2,
        maxRooms: 3,
        minArea: 60,
        maxArea: 100,
        maxPrice: 1200,
        locations: ['Musterstadt']
      },
      searchHistory: ['2-Zimmer-Wohnung'],
      savedProperties: ['prop-3'],
      matchScore: 88
    },
    {
      id: '3',
      name: 'Peter Weber',
      email: 'peter@example.com',
      phone: '+49 171 3456789',
      preferences: {
        type: ['Gewerbe'],
        minArea: 100,
        maxArea: 300,
        maxPrice: 3000,
        locations: ['Musterstadt', 'Hamburg']
      },
      searchHistory: ['Gewerbeimmobilie'],
      savedProperties: [],
      matchScore: 75
    }
  ], [])

  const calculateMatchScore = (customer: Customer, property: Property): number => {
    let score = 0
    let factors = 0

    // Type match
    if (customer.preferences.type.includes(property.type)) {
      score += 30
    }
    factors++

    // Rooms match
    if (property.rooms) {
      if (customer.preferences.minRooms && customer.preferences.maxRooms) {
        if (property.rooms >= customer.preferences.minRooms && 
            property.rooms <= customer.preferences.maxRooms) {
          score += 25
        } else if (property.rooms >= customer.preferences.minRooms - 1 && 
                   property.rooms <= customer.preferences.maxRooms + 1) {
          score += 15
        }
      }
      factors++
    }

    // Area match
    if (customer.preferences.minArea && customer.preferences.maxArea) {
      if (property.area >= customer.preferences.minArea && 
          property.area <= customer.preferences.maxArea) {
        score += 25
      } else if (property.area >= customer.preferences.minArea - 10 && 
                 property.area <= customer.preferences.maxArea + 10) {
        score += 15
      }
    }
    factors++

    // Price match
    if (customer.preferences.maxPrice) {
      if (property.price <= customer.preferences.maxPrice) {
        score += 20
      } else if (property.price <= customer.preferences.maxPrice * 1.1) {
        score += 10
      }
    }
    factors++

    // Location match
    if (customer.preferences.locations.some(loc => 
      property.city.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 20
    }
    factors++

    return Math.round(score / factors)
  }

  const matchedCustomers = useMemo(() => {
    return customers
      .map(customer => ({
        ...customer,
        matchScore: calculateMatchScore(customer, property)
      }))
      .filter(customer => 
        customer.matchScore >= 70 && // Nur relevante Matches
        (searchQuery === '' || 
         customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }, [customers, property, searchQuery])

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen p-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <SparklesIcon className="h-6 w-6" />
                <div>
                  <h2 className="text-2xl font-bold">AI Kunden-Matching</h2>
                  <p className="text-white/80 text-sm mt-1">
                    Passende Kunden für: {property.title}
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  aria-label="Schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kunden suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Matched Customers */}
          <div className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {matchedCustomers.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Keine passenden Kunden gefunden
                </h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Keine Kunden mit passenden Präferenzen.'}
                </p>
              </div>
            ) : (
              matchedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="h-4 w-4" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Typ</div>
                          <div className="text-sm font-medium">
                            {customer.preferences.type.join(', ')}
                          </div>
                        </div>
                        {customer.preferences.minRooms && customer.preferences.maxRooms && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Zimmer</div>
                            <div className="text-sm font-medium">
                              {customer.preferences.minRooms}-{customer.preferences.maxRooms}
                            </div>
                          </div>
                        )}
                        {customer.preferences.maxPrice && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Max. Preis</div>
                            <div className="text-sm font-medium">
                              {new Intl.NumberFormat('de-DE', { 
                                style: 'currency', 
                                currency: 'EUR',
                                maximumFractionDigits: 0 
                              }).format(customer.preferences.maxPrice)}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Gespeichert</div>
                          <div className="text-sm font-medium">
                            {customer.savedProperties.length} Immobilien
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="ml-4 text-right">
                      <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getMatchColor(customer.matchScore || 0)}`}>
                        {customer.matchScore}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Match</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {matchedCustomers.length} passende Kunden gefunden
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // TODO: Send to all matched customers
                    console.log('Sending to all matched customers')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  An alle senden
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Schließen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircleIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">E-Mail</label>
                <div className="text-gray-900">{selectedCustomer.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Telefon</label>
                <div className="text-gray-900">{selectedCustomer.phone}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Präferenzen</label>
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-gray-700">
                    Typ: {selectedCustomer.preferences.type.join(', ')}
                  </div>
                  {selectedCustomer.preferences.minRooms && selectedCustomer.preferences.maxRooms && (
                    <div className="text-sm text-gray-700">
                      Zimmer: {selectedCustomer.preferences.minRooms}-{selectedCustomer.preferences.maxRooms}
                    </div>
                  )}
                  {selectedCustomer.preferences.maxPrice && (
                    <div className="text-sm text-gray-700">
                      Max. Preis: {new Intl.NumberFormat('de-DE', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      }).format(selectedCustomer.preferences.maxPrice)}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Immobilie senden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
