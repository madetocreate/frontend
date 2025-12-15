'use client'

import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Document {
  id: string
  type: 'befund' | 'rezept' | 'überweisung' | 'arztbrief'
  patient: string
  date: string
  status: 'draft' | 'sent' | 'archived'
}

export function PracticeDocuments() {
  const mockDocuments: Document[] = [
    { id: '1', type: 'befund', patient: 'Max Mustermann', date: '2024-01-15', status: 'sent' },
    { id: '2', type: 'rezept', patient: 'Anna Schmidt', date: '2024-01-14', status: 'draft' },
    { id: '3', type: 'überweisung', patient: 'Peter Weber', date: '2024-01-13', status: 'sent' },
  ]

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'befund': 'Befund',
      'rezept': 'Rezept',
      'überweisung': 'Überweisung',
      'arztbrief': 'Arztbrief'
    }
    return labels[type] || type
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dokumente</h2>
          <p className="text-gray-600 mt-1">Befunde, Rezepte, Überweisungen</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <PlusIcon className="h-5 w-5" />
          Neues Dokument
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {mockDocuments.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="font-semibold text-gray-900">{getTypeLabel(doc.type)}</div>
                    <div className="text-sm text-gray-600">{doc.patient}</div>
                    <div className="text-xs text-gray-500 mt-1">{doc.date}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  doc.status === 'sent' ? 'bg-green-100 text-green-800' :
                  doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status === 'sent' ? 'Versendet' : doc.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

