/**
 * Formatiert einen Zeitstempel als relative Zeit (z.B. "vor 5 Min", "Gestern")
 */
export function formatTimeAgo(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Min`
  if (diffHours < 24) return `vor ${diffHours} Std`
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

/**
 * Formatiert einen Zeitstempel als kurze relative Zeit (z.B. "5m", "2h", "3d")
 */
export function formatTimeAgoShort(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'jetzt'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

/**
 * Formatiert ein Datum als lesbares Datum (z.B. "25. Dez 2024")
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('de-DE', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Formatiert ein Datum mit Uhrzeit (z.B. "25. Dez, 14:30")
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('de-DE', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatiert nur die Uhrzeit (z.B. "14:32")
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

