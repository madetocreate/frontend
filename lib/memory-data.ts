export type MemorySpaceId = 'business-profile' | 'business-knowledge' | 'personal' | 'chats'

export type MemorySourceType = 'profil' | 'business' | 'privat' | 'chat'

export interface MemorySpace {
  id: MemorySpaceId
  name: string
  description: string
}

export interface MemoryEntry {
  id: string
  spaceId: MemorySpaceId
  title: string
  summary: string
  content: string
  createdAt: string
  updatedAt: string
  sourceType: MemorySourceType
  sourceLabel: string
}

const memorySpaces: MemorySpace[] = [
  {
    id: 'business-profile',
    name: 'Business-Profil',
    description: 'Kerninfos zu dir, deiner Firma, Positionierung, Angeboten und Zielgruppen.',
  },
  {
    id: 'business-knowledge',
    name: 'Business-Wissen',
    description: 'Strategie, Prozesse, Playbooks und wiederverwendbares Fachwissen.',
  },
  {
    id: 'personal',
    name: 'Privates Memory',
    description: 'Persönliche Präferenzen, Stil, Biografie und alles, was nur du sehen sollst.',
  },
  {
    id: 'chats',
    name: 'Chat-Konversationen',
    description: 'Wichtige Ausschnitte aus Gesprächen, die als Kontext wiederverwendet werden.',
  },
]

const memoryEntries: MemoryEntry[] = [
  {
    id: 'bp-001',
    spaceId: 'business-profile',
    title: 'Kurzprofil des Unternehmens',
    summary: 'Kurzbeschreibung des Unternehmens, Fokus auf AI-gestützte Produktivität und Automatisierung.',
    content:
      'Das Unternehmen fokussiert sich auf AI-gestützte Produktivität, Automatisierung von Wissensarbeit und den Aufbau eigener AI-Assistenzprodukte. Zielkunden sind Solo-Entrepreneure und kleine Teams, die komplexe Arbeitsabläufe automatisieren wollen, ohne eine eigene Tech-Abteilung zu haben.',
    createdAt: '2025-01-10 09:15',
    updatedAt: '2025-01-12 14:32',
    sourceType: 'profil',
    sourceLabel: 'System-Setup',
  },
  {
    id: 'bk-001',
    spaceId: 'business-knowledge',
    title: 'Standard-Discovery-Call',
    summary: 'Strukturierter Ablauf für Discovery-Calls mit neuen Kunden inkl. Kernfragen.',
    content:
      'Discovery-Call-Struktur: 1) Kontext und Ziele des Kunden verstehen, 2) Bestehende Tools und Datenlage, 3) Engpässe im Tagesgeschäft, 4) Erfolgskriterien definieren, 5) Nächste Schritte vereinbaren. Fokus liegt auf konkreten Arbeitsabläufen, nicht auf abstrakten Wünschen.',
    createdAt: '2025-01-15 11:02',
    updatedAt: '2025-01-15 11:02',
    sourceType: 'business',
    sourceLabel: 'Manuell erfasst',
  },
  {
    id: 'pr-001',
    spaceId: 'personal',
    title: 'Schreibstil',
    summary: 'Bevorzugter Schreibstil: direkt, klar, ohne unnötigen Jargon, gerne mit Beispielen.',
    content:
      'Der gewünschte Schreibstil ist direkt, klar und praxisorientiert. Keine übertrieben formellen Anreden, keine unnötigen Buzzwords. Beispiele und Schritt-für-Schritt-Erklärungen sind willkommen, solange sie nicht künstlich aufgebläht sind.',
    createdAt: '2025-01-08 16:40',
    updatedAt: '2025-01-09 08:12',
    sourceType: 'privat',
    sourceLabel: 'Profil-Einstellungen',
  },
  {
    id: 'ch-001',
    spaceId: 'chats',
    title: 'Streaming-Setup für Chat',
    summary: 'Konfiguration des Streaming-Endpunkts und des Frontend-Verhaltens im Chat.',
    content:
      'Streaming-Setup: NEXT_PUBLIC_CHAT_STREAM_URL zeigt auf /chat/stream des Backends. Das Frontend liest den Response-Body als Stream und parst SSE-artige Events, um Token fortlaufend anzuzeigen. Fallback ist ein normaler HTTP-Request auf /chat.',
    createdAt: '2025-01-18 10:05',
    updatedAt: '2025-01-18 10:05',
    sourceType: 'chat',
    sourceLabel: 'Chat-Konfiguration',
  },
]

export function getMemorySpaces(): MemorySpace[] {
  return memorySpaces
}

export function getMemorySpace(id: string): MemorySpace | undefined {
  return memorySpaces.find((space) => space.id === id)
}

export function getSpaceMemories(spaceId: string): MemoryEntry[] {
  return memoryEntries.filter((memory) => memory.spaceId === spaceId)
}

export function getMemory(spaceId: string, memoryId: string): MemoryEntry | undefined {
  return memoryEntries.find((memory) => memory.spaceId === spaceId && memory.id === memoryId)
}
