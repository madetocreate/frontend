/**
 * Calendar Service
 * Centralized calendar management service for all dashboards
 */

export interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  description?: string
  location?: string
  attendees: string[]
  organizer?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'confirmed' | 'tentative' | 'cancelled' | 'completed'
  source?: string
  metadata?: Record<string, unknown>
  recurrence?: string
  reminders: number[]
}

export interface DaySummary {
  date: string
  total_events: number
  total_duration_minutes: number
  utilization_percent: number
  events: CalendarEvent[]
  focus_time_available: number
}

export interface TimeSlot {
  start: string
  end: string
  duration_minutes: number
}

class CalendarService {
  private baseUrl = '/api/v1/calendar'
  // DEPRECATED: accountId should be passed as parameter to methods
  // For now, methods that need accountId should accept it as parameter
  // This avoids hardcoded defaults
  private getAccountId(): string {
    // Try to get from localStorage (set by auth flow)
    if (typeof window !== 'undefined') {
      const tenantId = localStorage.getItem('tenant_id')
      if (tenantId) return tenantId
    }
    throw new Error('accountId/tenantId is required. User must be authenticated.')
  }

  /**
   * Schedule event from natural language
   */
  async scheduleFromNaturalLanguage(text: string, organizer: string = 'user'): Promise<CalendarEvent> {
    const response = await fetch(`${this.baseUrl}/schedule/natural-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        organizer,
        account_id: this.getAccountId()
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to schedule: ${response.statusText}`)
    }

    const data = await response.json()
    return data.event
  }

  /**
   * Get upcoming events
   */
  async getEvents(days: number = 7): Promise<CalendarEvent[]> {
    const response = await fetch(`${this.baseUrl}/events?account_id=${this.getAccountId()}&days=${days}`)

    if (!response.ok) {
      throw new Error(`Failed to load events: ${response.statusText}`)
    }

    const data = await response.json()
    return data.events || []
  }

  /**
   * Get day summary
   */
  async getDaySummary(date: Date): Promise<DaySummary> {
    const dateStr = date.toISOString().split('T')[0]
    const response = await fetch(`${this.baseUrl}/day/${dateStr}?account_id=${this.getAccountId()}`)

    if (!response.ok) {
      throw new Error(`Failed to load day summary: ${response.statusText}`)
    }

    const data = await response.json()
    return data.summary
  }

  /**
   * Suggest optimal time
   */
  async suggestOptimalTime(
    durationMinutes: number,
    preferredDate?: Date,
    preferredTime?: string
  ): Promise<TimeSlot | null> {
    const params = new URLSearchParams({
      duration_minutes: durationMinutes.toString(),
        account_id: this.getAccountId()
    })

    if (preferredDate) {
      params.append('preferred_date', preferredDate.toISOString().split('T')[0])
    }
    if (preferredTime) {
      params.append('preferred_time', preferredTime)
    }

    const response = await fetch(`${this.baseUrl}/slots/suggest?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to suggest time: ${response.statusText}`)
    }

    const data = await response.json()
    return data.success ? data.slot : null
  }

  /**
   * Create event
   */
  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(`${this.baseUrl}/events?account_id=${this.getAccountId()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`)
    }

    const data = await response.json()
    return data.event
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}?account_id=${this.getAccountId()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`)
    }

    const data = await response.json()
    return data.event
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}?account_id=${this.getAccountId()}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`)
    }
  }

  /**
   * Check conflicts
   */
  async checkConflicts(startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
        account_id: this.getAccountId()
    })

    const response = await fetch(`${this.baseUrl}/conflicts?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to check conflicts: ${response.statusText}`)
    }

    const data = await response.json()
    return data.conflicts || []
  }
}

export const calendarService = new CalendarService()

