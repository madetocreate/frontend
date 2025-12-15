'use client'

import { useState, useMemo } from 'react'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: 'Immobilienscout24' | 'Idealista' | 'Website' | 'Social Media' | 'Referral'
  status: 'New' | 'Contacted' | 'Qualified' | 'Viewing Scheduled' | 'Offer' | 'Closed' | 'Lost'
  propertyInterest?: string
  preferences: {
    type: ('Wohnung' | 'Haus' | 'Gewerbe')[]
    minRooms?: number
    maxRooms?: number
    maxPrice?: number
    locations: string[]
  }
  notes: string
  createdAt: string
  lastContact?: string
  matchScore?: number
}

export function RealEstateLeads() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'qualified' | 'viewing'>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // TODO: Load from backend
  const leads = useMemo<Lead[]>(() => [
    {
      id: '1',
      name: 'Max Mustermann',
      email: 'max@example.com',
      phone: '+49 171 1234567',
      source: 'Immobilienscout24',
      status: 'Qualified',
      propertyInterest: 'Moderne 3-Zimmer-Wohnung',
      preferences: {
        type: ['Wohnung'],
        minRooms: 3,
        maxRooms: 4,
        maxPrice: 1500,
        locations: ['Musterstadt']
      },
      notes: 'Interessiert an modernen Wohnungen mit Balkon',
      createdAt: '2024-01-20',
      lastContact: '2024-01-22',
      matchScore: 95
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      email: 'anna@example.com',
      phone: '+49 171 2345678',
      source: 'Website',
      status: 'New',
      preferences: {
        type: ['Haus'],
        minRooms: 4,
        maxRooms: 6,
        maxPrice: 2500,
        locations: ['Musterstadt', 'Berlin']
      },
      notes: 'Suche Haus mit Garten für Familie',
      createdAt: '2024-01-21',
      matchScore: 88
    },
    {
      id: '3',
      name: 'Peter Weber',
      email: 'peter@example.com',
      phone: '+49 171 3456789',
      source: 'Idealista',
      status: 'Viewing Scheduled',
      propertyInterest: 'Einfamilienhaus mit Garten',
      preferences: {
        type: ['Haus'],
        minRooms: 5,
        maxRooms: 7,
        maxPrice: 3000,
        locations: ['Musterstadt']
      },
      notes: 'Besichtigung am 25.01.2024 um 14:00 Uhr',
      createdAt: '2024-01-18',
      lastContact: '2024-01-20',
      matchScore: 92
    }
  ], [])

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.phone.includes(searchQuery)
      
      if (filter === 'new') return matchesSearch && lead.status === 'New'
      if (filter === 'contacted') return matchesSearch && lead.status === 'Contacted'
      if (filter === 'qualified') return matchesSearch && lead.status === 'Qualified'
      if (filter === 'viewing') return matchesSearch && lead.status === 'Viewing Scheduled'
      return matchesSearch
    })
  }, [leads, searchQuery, filter])

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    qualified: leads.filter(l => l.status === 'Qualified').length,
    viewing: leads.filter(l => l.status === 'Viewing Scheduled').length,
    conversionRate: 15.5
  }), [leads])

  const getStatusColor = (status: Lead['status']) => {
    const colors: Record<Lead['status'], string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Viewing Scheduled': 'bg-purple-100 text-purple-800',
      'Offer': 'bg-orange-100 text-orange-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Lost': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: Lead['status']) => {
    const labels: Record<Lead['status'], string> = {
      'New': 'Neu',
      'Contacted': 'Kontaktiert',
      'Qualified': 'Qualifiziert',
      'Viewing Scheduled': 'Besichtigung geplant',
      'Offer': 'Angebot',
      'Closed': 'Abgeschlossen',
      'Lost': 'Verloren'
    }
    return labels[status] || status
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Immobilien-Leads</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <SparklesIcon className="h-5 w-5" />
            AI Matching
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-5 w-5" />
            Neuer Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-600">Neu</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
          <div className="text-sm text-gray-600">Qualifiziert</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.viewing}</div>
          <div className="text-sm text-gray-600">Besichtigungen</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.conversionRate}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Leads suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'new', 'contacted', 'qualified', 'viewing'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'new' ? 'Neu' : f === 'contacted' ? 'Kontaktiert' : f === 'qualified' ? 'Qualifiziert' : 'Besichtigung'}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Leads gefunden</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Erstellen Sie Ihren ersten Lead.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-6 hover:bg-gray-50/50 transition-all cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <EnvelopeIcon className="h-4 w-4" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {lead.propertyInterest && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">Interesse: {lead.propertyInterest}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded-lg ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-lg">
                        {lead.source}
                      </span>
                      {lead.matchScore && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg">
                          {lead.matchScore}% Match
                        </span>
                      )}
                      {lead.preferences.type.length > 0 && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-lg">
                          {lead.preferences.type.join(', ')}
                        </span>
                      )}
                    </div>

                    {lead.notes && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{lead.notes}</p>
                    )}
                  </div>

                  <div className="ml-4 text-right">
                    {lead.lastContact && (
                      <div className="text-xs text-gray-500 mb-2">
                        Letzter Kontakt: {new Date(lead.lastContact).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Erstellt: {new Date(lead.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{selectedLead.name}</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">E-Mail</label>
                <div className="text-gray-900">{selectedLead.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Telefon</label>
                <div className="text-gray-900">{selectedLead.phone}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Quelle</label>
                <div className="text-gray-900">{selectedLead.source}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div>
                  <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(selectedLead.status)}`}>
                    {getStatusLabel(selectedLead.status)}
                  </span>
                </div>
              </div>
              {selectedLead.propertyInterest && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Immobilien-Interesse</label>
                  <div className="text-gray-900">{selectedLead.propertyInterest}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Präferenzen</label>
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-gray-700">
                    Typ: {selectedLead.preferences.type.join(', ')}
                  </div>
                  {selectedLead.preferences.minRooms && selectedLead.preferences.maxRooms && (
                    <div className="text-sm text-gray-700">
                      Zimmer: {selectedLead.preferences.minRooms}-{selectedLead.preferences.maxRooms}
                    </div>
                  )}
                  {selectedLead.preferences.maxPrice && (
                    <div className="text-sm text-gray-700">
                      Max. Preis: {new Intl.NumberFormat('de-DE', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      }).format(selectedLead.preferences.maxPrice)}
                    </div>
                  )}
                  <div className="text-sm text-gray-700">
                    Standorte: {selectedLead.preferences.locations.join(', ')}
                  </div>
                </div>
              </div>
              {selectedLead.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notizen</label>
                  <div className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedLead.notes}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Kontaktieren
                </button>
                <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Immobilien vorschlagen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

