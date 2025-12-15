'use client'

import { useState, useMemo } from 'react'
import { 
  DocumentTextIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { RealEstateExposeViewer } from './RealEstateExposeViewer'
import { RealEstateExposeGenerator } from './RealEstateExposeGenerator'

interface Expose {
  id: string
  propertyId: string
  propertyTitle: string
  title: string
  createdAt: string
  updatedAt: string
  status: 'Draft' | 'Published' | 'Archived'
  views: number
  downloads: number
}

export function RealEstateDocuments() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  const [selectedExpose, setSelectedExpose] = useState<Expose | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)

  // TODO: Load from backend
  const exposes = useMemo<Expose[]>(() => [
    {
      id: '1',
      propertyId: 'prop-1',
      propertyTitle: 'Moderne 3-Zimmer-Wohnung',
      title: 'Exposé: Moderne 3-Zimmer-Wohnung in Musterstadt',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      status: 'Published',
      views: 342,
      downloads: 28
    },
    {
      id: '2',
      propertyId: 'prop-2',
      propertyTitle: 'Einfamilienhaus mit Garten',
      title: 'Exposé: Einfamilienhaus mit Garten',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      status: 'Published',
      views: 289,
      downloads: 19
    },
    {
      id: '3',
      propertyId: 'prop-3',
      propertyTitle: 'Gewerbeimmobilie im Zentrum',
      title: 'Exposé: Gewerbeimmobilie (Entwurf)',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19',
      status: 'Draft',
      views: 0,
      downloads: 0
    }
  ], [])

  const filteredExposes = useMemo(() => {
    return exposes.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           e.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (filter === 'draft') return matchesSearch && e.status === 'Draft'
      if (filter === 'published') return matchesSearch && e.status === 'Published'
      if (filter === 'archived') return matchesSearch && e.status === 'Archived'
      return matchesSearch
    })
  }, [exposes, searchQuery, filter])

  const stats = useMemo(() => ({
    total: exposes.length,
    published: exposes.filter(e => e.status === 'Published').length,
    draft: exposes.filter(e => e.status === 'Draft').length,
    totalViews: exposes.reduce((sum, e) => sum + e.views, 0),
    totalDownloads: exposes.reduce((sum, e) => sum + e.downloads, 0)
  }), [exposes])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exposés</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Immobilien-Exposés</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SparklesIcon className="h-5 w-5" />
          AI Exposé erstellen
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-sm text-gray-600">Veröffentlicht</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          <div className="text-sm text-gray-600">Entwürfe</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
          <div className="text-sm text-gray-600">Aufrufe</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.totalDownloads}</div>
          <div className="text-sm text-gray-600">Downloads</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Exposés suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'draft', 'published', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'draft' ? 'Entwürfe' : f === 'published' ? 'Veröffentlicht' : 'Archiviert'}
            </button>
          ))}
        </div>
      </div>

      {/* Exposes List */}
      {filteredExposes.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Exposés gefunden</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Erstellen Sie Ihr erstes Exposé.'}
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Exposé erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExposes.map((expose) => (
            <div
              key={expose.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{expose.title}</h3>
                    <p className="text-sm text-gray-600">{expose.propertyTitle}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-lg ${
                    expose.status === 'Published' ? 'bg-green-100 text-green-800' :
                    expose.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {expose.status === 'Published' ? 'Veröffentlicht' : 
                     expose.status === 'Draft' ? 'Entwurf' : 'Archiviert'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{expose.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>{expose.downloads}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(expose.updatedAt).toLocaleDateString('de-DE')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedExpose(expose)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Anzeigen
                  </button>
                  <button
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Bearbeiten"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Löschen"
                  >
                    <TrashIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expose Viewer */}
      {selectedExpose && (
        <RealEstateExposeViewer
          expose={{
            id: selectedExpose.id,
            propertyId: selectedExpose.propertyId,
            title: selectedExpose.title,
            address: 'Musterstraße 1',
            city: 'Musterstadt',
            zipCode: '12345',
            type: 'Wohnung',
            price: 1200,
            priceType: 'Miete',
            rooms: 3,
            bedrooms: 2,
            bathrooms: 1,
            area: 85,
            description: 'Helle und moderne 3-Zimmer-Wohnung in ruhiger Lage...',
            features: ['Balkon', 'Einbauküche', 'Parkplatz', 'Aufzug'],
            photos: [
              { id: '1', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', description: 'Wohnzimmer' }
            ],
            contact: {
              name: 'Max Mustermann',
              phone: '+49 171 1234567',
              email: 'max@example.com'
            },
            createdAt: selectedExpose.createdAt
          }}
          onClose={() => setSelectedExpose(null)}
        />
      )}

      {/* Expose Generator */}
      {showGenerator && (
        <RealEstateExposeGenerator
          onClose={() => setShowGenerator(false)}
          onComplete={(expose) => {
            console.log('Exposé erstellt:', expose)
            setShowGenerator(false)
          }}
        />
      )}
    </div>
  )
}
