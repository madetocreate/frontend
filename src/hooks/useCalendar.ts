/**
 * useCalendar Hook
 * Centralized calendar hook for all dashboards
 */

import { useState, useEffect, useCallback } from 'react'
import { calendarService, CalendarEvent, DaySummary } from '../services/calendarService'

interface UseCalendarOptions {
  accountId?: string
  autoLoad?: boolean
  days?: number
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const { autoLoad = true, days = 7 } = options
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const loadedEvents = await calendarService.getEvents(days)
      setEvents(loadedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [days])

  const loadDaySummary = useCallback(async (date: Date) => {
    try {
      const summary = await calendarService.getDaySummary(date)
      setDaySummary(summary)
    } catch (err) {
      console.error('Failed to load day summary:', err)
    }
  }, [])

  const scheduleFromNLP = useCallback(async (text: string, organizer: string = 'user') => {
    setLoading(true)
    setError(null)
    try {
      const event = await calendarService.scheduleFromNaturalLanguage(text, organizer)
      setEvents(prev => [...prev, event].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ))
      return event
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = useCallback(async (event: Partial<CalendarEvent>) => {
    setLoading(true)
    setError(null)
    try {
      const newEvent = await calendarService.createEvent(event)
      setEvents(prev => [...prev, newEvent].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ))
      return newEvent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    setLoading(true)
    setError(null)
    try {
      const updatedEvent = await calendarService.updateEvent(eventId, updates)
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e))
      return updatedEvent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteEvent = useCallback(async (eventId: string) => {
    setLoading(true)
    setError(null)
    try {
      await calendarService.deleteEvent(eventId)
      setEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.start_time.startsWith(dateStr))
  }, [events])

  const getUpcomingEvents = useCallback((count: number = 5) => {
    const now = new Date()
    return events
      .filter(e => new Date(e.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, count)
  }, [events])

  useEffect(() => {
    if (autoLoad) {
      loadEvents()
    }
  }, [autoLoad, loadEvents])

  useEffect(() => {
    if (selectedDate) {
      loadDaySummary(selectedDate)
    }
  }, [selectedDate, loadDaySummary])

  return {
    events,
    daySummary,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    loadEvents,
    loadDaySummary,
    scheduleFromNLP,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getUpcomingEvents,
    refresh: loadEvents
  }
}

