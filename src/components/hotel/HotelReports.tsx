'use client'

import { useState, useCallback } from 'react'
import { ChartBarIcon, DocumentArrowDownIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface Report {
  id: string
  name: string
  description: string
}

export function HotelReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)

  const reports: Report[] = [
    { id: 'daily', name: 'Tagesabschluss', description: 'Revenue, Occupancy, Check-ins/outs' },
    { id: 'weekly', name: 'Wochenbericht', description: 'Wöchentliche Zusammenfassung' },
    { id: 'monthly', name: 'Monatsbericht', description: 'Vollständiger Monatsbericht' },
    { id: 'revenue', name: 'Revenue-Analyse', description: 'Detaillierte Revenue-Analyse' },
    { id: 'guests', name: 'Gäste-Statistik', description: 'Gästedaten und Trends' },
  ]

  const handleGenerate = useCallback(async (reportId: string) => {
    setGenerating(reportId)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Generate report:', reportId)
      // TODO: Download report
    } catch (err) {
      console.error('Generate error:', err)
    } finally {
      setGenerating(null)
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Berichte & Analytics</h2>
          <p className="text-gray-600 mt-1">Erstellen Sie Berichte und analysieren Sie Daten</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedReport(report.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedReport(report.id)
              }
            }}
            aria-label={`${report.name} öffnen`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="font-semibold text-gray-900">{report.name}</div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <button 
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={generating === report.id}
              onClick={(e) => {
                e.stopPropagation()
                handleGenerate(report.id)
              }}
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              {generating === report.id ? 'Wird generiert...' : 'Generieren'}
            </button>
          </div>
        ))}
      </div>

      {/* Analytics Placeholder */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
        <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Analytics-Dashboard wird hier angezeigt</p>
            <p className="text-sm mt-2 text-gray-400">Charts, Trends, Vergleiche</p>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setSelectedReport(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-detail-title"
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 id="report-detail-title" className="text-xl font-bold text-gray-900">
                  {reports.find(r => r.id === selectedReport)?.name}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Modal schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                {reports.find(r => r.id === selectedReport)?.description}
              </p>
              <button 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={generating === selectedReport}
                onClick={() => handleGenerate(selectedReport)}
              >
                {generating === selectedReport ? 'Wird generiert...' : 'Bericht generieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
