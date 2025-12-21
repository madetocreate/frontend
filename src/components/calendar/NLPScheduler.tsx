'use client'

import { useState } from 'react'
import { 
  SparklesIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { calendarService, CalendarEvent } from '../../services/calendarService'
import { useTranslation } from '../../i18n'

interface NLPSchedulerProps {
  onClose: () => void
  onSuccess?: (event: CalendarEvent) => void
  defaultText?: string
}

export function NLPScheduler({ onClose, onSuccess, defaultText = '' }: NLPSchedulerProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState(defaultText)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedEvent, setSuggestedEvent] = useState<CalendarEvent | null>(null)

  const handleSubmit = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError(null)

    try {
      const event = await calendarService.scheduleFromNaturalLanguage(input)
      setSuggestedEvent(event)
      
      if (onSuccess) {
        onSuccess(event)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Planen des Termins')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (suggestedEvent && onSuccess) {
      onSuccess(suggestedEvent)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{t('calendar.aiScheduling')}</h3>
              <p className="text-sm text-gray-600">{t('calendar.describeAppointment')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {!suggestedEvent ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('calendar.appointmentDescription')}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`${t('calendar.example1')} oder ${t('calendar.example2')}`}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit()
                  }
                }}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-200/50">
              <div className="flex items-start gap-2">
                <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-2">Beispiele:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• &quot;Termin mit Max morgen um 14 Uhr&quot;</li>
                    <li>• &quot;30 Minuten für Projekt-Review nächsten Montag&quot;</li>
                    <li>• &quot;Meeting mit Team nächste Woche Dienstag um 10 Uhr in Raum 5&quot;</li>
                    <li>• &quot;Wichtiger Call mit Kunde heute Nachmittag um 15:30&quot;</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/30"
              >
                {loading ? t('calendar.scheduling') : t('calendar.createAppointment')}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('calendar.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">{t('calendar.appointmentCreated')}</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/50">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">{t('calendar.titleLabel')}</div>
                  <div className="font-semibold text-gray-900">{suggestedEvent.title}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('calendar.start')}</div>
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(suggestedEvent.start_time).toLocaleString('de-DE')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('calendar.end')}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(suggestedEvent.end_time).toLocaleString('de-DE')}
                    </div>
                  </div>
                </div>
                {suggestedEvent.location && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('calendar.location')}</div>
                    <div className="text-sm text-gray-900">{suggestedEvent.location}</div>
                  </div>
                )}
                {suggestedEvent.attendees.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('calendar.attendees')}</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedEvent.attendees.map((attendee, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white rounded-lg text-xs">
                          {attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                {t('calendar.confirm')}
              </button>
              <button
                onClick={() => setSuggestedEvent(null)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('calendar.edit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

