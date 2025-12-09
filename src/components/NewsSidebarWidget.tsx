'use client'

import { useEffect, useState } from 'react'
import { NewsfeedWidget } from '@/components/NewsfeedWidget'

export type NewsStory = {
  id: string
  image: string
  title: string
  description: string
  fullText?: string
  category: string
  badgeColor: 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery'
  source: string
  age: string
}

type NewsSidebarWidgetProps = {
  onStoryClick?: (story: NewsStory) => void
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'

// Mock-Daten für den Fall, dass API nicht verfügbar ist
const DEFAULT_STORIES: NewsStory[] = [
  {
    id: 'story_1',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Artificial_Intelligence_Concept_Art.webp',
    title: 'Open-Source-Modelle beschleunigen GenAI in Unternehmen',
    description: 'Neue Werkzeuge verkürzen die Zeit von PoC zu Produktion.',
    fullText: `Open-Source-Modelle wie Llama, Mistral und andere haben in den letzten Monaten erhebliche Fortschritte gemacht. Unternehmen erkennen zunehmend den Wert dieser Modelle, da sie mehr Kontrolle über ihre Daten und Prozesse bieten.

Die Integration von Open-Source-GenAI-Modellen in Unternehmensumgebungen wird durch neue Werkzeuge und Frameworks erheblich vereinfacht. Entwicklerteams können jetzt schneller von Proof-of-Concept zu produktiven Anwendungen übergehen.

Wichtige Vorteile:
- Datenhoheit: Unternehmen behalten die volle Kontrolle über sensible Informationen
- Kostenkontrolle: Keine Abhängigkeit von teuren API-Gebühren
- Anpassbarkeit: Modelle können spezifisch für Unternehmensanforderungen trainiert werden
- Compliance: Einfacherer Nachweis der Einhaltung von Datenschutzbestimmungen

Die Technologie entwickelt sich rasant weiter, und wir erwarten in den kommenden Monaten weitere Durchbrüche in der Effizienz und Leistungsfähigkeit dieser Modelle.`,
    category: 'AI',
    badgeColor: 'discovery',
    source: 'The Verge',
    age: 'vor 3 h',
  },
  {
    id: 'story_2',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Cloud_Computing_%286146486443%29.jpg',
    title: 'SaaS-Preise steigen 2026: Was Teams jetzt planen sollten',
    description: 'Analysten sehen mehr nutzungsbasierte Modelle und Bundles.',
    fullText: `Die SaaS-Branche steht vor einem Wendepunkt. Nach Jahren des Wachstums und der Expansion sehen sich Unternehmen mit steigenden Preisen konfrontiert. Analysten prognostizieren für 2026 eine Verschiebung hin zu nutzungsbasierten Preismodellen und umfassenden Software-Bundles.

Haupttrends:
- Nutzungsbasierte Abrechnung: Statt fester monatlicher Gebühren zahlen Kunden nur für tatsächlich genutzte Features
- All-in-One-Bundles: Anbieter kombinieren mehrere Tools zu attraktiven Paketen
- KI-Integration: Viele SaaS-Tools integrieren KI-Features als Premium-Add-on

Unternehmen sollten jetzt ihre SaaS-Strategie überprüfen und Budgets entsprechend anpassen. Die Zeit der "Flatrate für alles" scheint vorbei zu sein.`,
    category: 'SaaS',
    badgeColor: 'info',
    source: 'TechCrunch',
    age: 'vor 5 h',
  },
  {
    id: 'story_3',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Programming.jpg',
    title: 'VS Code erhält native AI-Coding-Hilfen',
    description: 'Lokale Modelle und Privacy-Controls kommen in die Stable-Version.',
    fullText: `Visual Studio Code, der beliebteste Code-Editor der Welt, erhält in der nächsten Stable-Version native KI-Unterstützung. Das bedeutet, dass Entwickler direkt im Editor von KI-gestützten Code-Vorschlägen profitieren können, ohne auf externe Erweiterungen angewiesen zu sein.

Neue Features:
- Lokale KI-Modelle: Code-Vervollständigung funktioniert auch offline
- Privacy-Controls: Entwickler können entscheiden, welche Daten an KI-Services gesendet werden
- Kontextbewusste Vorschläge: Die KI versteht den Projektkontext und schlägt passende Lösungen vor
- Multi-Model-Support: Unterstützung für verschiedene KI-Modelle (GPT, Claude, lokale Modelle)

Diese Entwicklung markiert einen wichtigen Schritt in der Integration von KI in den Entwickler-Workflow.`,
    category: 'Tech',
    badgeColor: 'success',
    source: 'GitHub Blog',
    age: 'vor 8 h',
  },
  {
    id: 'story_4',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Macro_circuit_board.JPG',
    title: 'Neue Chips für Edge‑KI versprechen 3× Effizienz',
    description: 'Start-ups setzen auf NPU‑Cluster am Rand.',
    fullText: `Edge-KI, also künstliche Intelligenz, die direkt auf Geräten am Netzwerkrand läuft, erlebt einen Durchbruch. Neue spezialisierte Chips versprechen eine dreifache Effizienzsteigerung gegenüber herkömmlichen Prozessoren.

Innovative Start-ups entwickeln NPU-Cluster (Neural Processing Units), die speziell für KI-Workloads optimiert sind. Diese Chips können komplexe KI-Modelle direkt auf Smartphones, IoT-Geräten und Edge-Servern ausführen, ohne auf Cloud-Services angewiesen zu sein.

Vorteile:
- Niedrige Latenz: Daten müssen nicht zur Cloud gesendet werden
- Datenschutz: Sensible Daten bleiben lokal
- Kostenersparnis: Keine Cloud-API-Gebühren
- Offline-Funktionalität: Funktioniert auch ohne Internetverbindung

Die Technologie könnte die Art und Weise revolutionieren, wie wir KI in alltäglichen Geräten einsetzen.`,
    category: 'Hardware',
    badgeColor: 'secondary',
    source: 'MIT Technology Review',
    age: 'vor 11 h',
  },
  {
    id: 'story_5',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg',
    title: 'CSS Grid wird zum Standard für komplexe Layouts',
    description: 'Moderne Web-Entwicklung setzt zunehmend auf Grid-basierte Designs.',
    fullText: `CSS Grid hat sich in den letzten Jahren als de-facto-Standard für komplexe Web-Layouts etabliert. Während Flexbox ideal für eindimensionale Layouts ist, bietet Grid eine mächtige Lösung für zweidimensionale Designs.

Moderne Web-Entwickler setzen zunehmend auf Grid-basierte Designs, die flexibler und wartbarer sind als traditionelle Float- oder Position-basierte Layouts. Die Technologie ermöglicht es, komplexe, responsive Designs mit weniger Code zu erstellen.

Best Practices:
- Grid für Layout-Struktur, Flexbox für Komponenten
- Subgrid für verschachtelte Grids
- Container Queries für noch flexiblere Responsive-Designs

Die Browser-Unterstützung ist mittlerweile universell, und die meisten modernen Frameworks integrieren Grid als Standard-Layout-Methode.`,
    category: 'Web',
    badgeColor: 'info',
    source: 'MDN Blog',
    age: 'vor 14 h',
  },
  {
    id: 'story_6',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg',
    title: 'TypeScript 5.5 bringt Performance-Verbesserungen',
    description: 'Neue Compiler-Optimierungen beschleunigen Build-Zeiten um bis zu 30%.',
    fullText: `TypeScript 5.5 wurde veröffentlicht und bringt erhebliche Performance-Verbesserungen mit sich. Die neuen Compiler-Optimierungen können Build-Zeiten um bis zu 30% reduzieren, was besonders bei großen Projekten spürbar ist.

Wichtigste Verbesserungen:
- Schnellere Typ-Überprüfung durch optimierte Algorithmen
- Verbesserte Inkrementelle Kompilierung
- Bessere Speichernutzung während des Build-Prozesses
- Neue Utility-Types für noch präzisere Typisierung

Für Entwickler bedeutet das weniger Wartezeit während der Entwicklung und schnellere Feedback-Zyklen. Die TypeScript-Community hat diese Verbesserungen mit Begeisterung aufgenommen.`,
    category: 'Tech',
    badgeColor: 'success',
    source: 'TypeScript Blog',
    age: 'vor 18 h',
  },
  {
    id: 'story_7',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    title: 'React 19: Neue Features für Server Components',
    description: 'Verbesserte Streaming-APIs und bessere Developer Experience.',
    fullText: `React 19 bringt erhebliche Verbesserungen für Server Components mit sich. Die neue Version fokussiert sich auf bessere Performance, verbesserte Streaming-APIs und eine deutlich verbesserte Developer Experience.

Hauptfeatures:
- Verbesserte Streaming-APIs für schnellere Initial Load Times
- Optimierte Server Component Rendering-Pipeline
- Bessere Integration mit Next.js und anderen Frameworks
- Neue Hooks für Server-Client-Interaktion

Die React-Community erwartet, dass diese Verbesserungen die Adoption von Server Components weiter vorantreiben werden. Entwickler können jetzt noch performantere und skalierbarere Anwendungen erstellen.`,
    category: 'Web',
    badgeColor: 'discovery',
    source: 'React Blog',
    age: 'vor 1 Tag',
  },
  {
    id: 'story_8',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Devops-toolchain.svg',
    title: 'DevOps-Trends 2026: Automatisierung im Fokus',
    description: 'KI-gestützte CI/CD-Pipelines werden zum neuen Standard.',
    fullText: `Die DevOps-Landschaft entwickelt sich rasant weiter. Für 2026 prognostizieren Experten einen starken Fokus auf Automatisierung und KI-gestützte Tools. CI/CD-Pipelines werden intelligenter und können selbstständig Probleme erkennen und beheben.

Trends für 2026:
- KI-gestützte CI/CD: Pipelines lernen aus Fehlern und optimieren sich selbst
- GitOps als Standard: Infrastruktur als Code wird zur Norm
- Security by Default: Sicherheit wird direkt in die Pipeline integriert
- Multi-Cloud-Strategien: Teams nutzen mehrere Cloud-Provider gleichzeitig

Unternehmen, die diese Trends frühzeitig aufgreifen, werden einen erheblichen Wettbewerbsvorteil haben. Die Automatisierung wird nicht nur Zeit sparen, sondern auch die Qualität und Zuverlässigkeit von Software-Releases verbessern.`,
    category: 'DevOps',
    badgeColor: 'warning',
    source: 'InfoWorld',
    age: 'vor 2 Tagen',
  },
]

export function NewsSidebarWidget({ onStoryClick }: NewsSidebarWidgetProps) {
  const [stories, setStories] = useState<NewsStory[]>(DEFAULT_STORIES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const resp = await fetch(`${API_BASE_URL}/api/newsmanager/feed`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        })
        if (!resp.ok) {
          // Bei 404, 401 oder anderen Fehlern: Fallback zu Mock-Daten
          if (resp.status === 404 || resp.status === 401 || resp.status >= 500) {
            console.warn(`News-Feed konnte nicht geladen werden (HTTP ${resp.status}), verwende Mock-Daten`)
            if (!cancelled) {
              setStories(DEFAULT_STORIES)
              setLoading(false)
            }
            return
          }
          // Bei anderen Fehlern auch Fallback
          console.warn(`News-Feed Fehler (HTTP ${resp.status}), verwende Mock-Daten`)
          if (!cancelled) {
            setStories(DEFAULT_STORIES)
            setLoading(false)
          }
          return
        }
        const data: unknown = await resp.json()
        
        // Versuche, die Daten zu konvertieren
        if (Array.isArray(data)) {
          // Wenn es ein Array von Stories ist
          const normalizeSource = (src: unknown): string => {
            if (!src) return 'Unbekannt'
            if (typeof src === 'string') return src
            if (typeof src === 'object') {
              const maybe = src as { name?: unknown; url?: unknown }
              if (typeof maybe.name === 'string' && maybe.name.trim()) return maybe.name
              if (typeof maybe.url === 'string' && maybe.url.trim()) return maybe.url
            }
            return 'Unbekannt'
          }

          const convertedStories: NewsStory[] = data.map((item: unknown) => {
            const story = item as {
              id: string
              image?: string
              imageUrl?: string
              title: string
              description?: string
              body?: string
              subtitle?: string
              category?: string
              type?: string
              badgeColor?: NewsStory['badgeColor']
              source?: unknown
              age?: unknown
            }
            return {
              id: story.id,
              image: story.image || story.imageUrl || DEFAULT_STORIES[0]!.image,
              title: story.title,
              description: story.description || story.body || story.subtitle || '',
              category: story.category || story.type || 'News',
              badgeColor: story.badgeColor || 'secondary',
              source: normalizeSource(story.source),
              age: typeof story.age === 'string' && story.age.trim() ? story.age : 'vor kurzem',
            }
          })
          if (!cancelled) {
            setStories(convertedStories.length > 0 ? convertedStories : DEFAULT_STORIES)
          }
        } else {
          // Fallback zu Mock-Daten
          if (!cancelled) {
            setStories(DEFAULT_STORIES)
          }
        }
      } catch (err: unknown) {
        console.error('NewsSidebarWidget error', err)
        if (!cancelled) {
          // Immer Mock-Daten verwenden bei Fehler
          setStories(DEFAULT_STORIES)
          setError(null) // Kein Fehler anzeigen, da wir Mock-Daten haben
          setLoading(false)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="ak-body px-3 py-3 text-slate-500">
        News-Feed wird geladen…
      </div>
    )
  }

  if (error) {
    return (
      <div className="ak-body rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
        {error}
      </div>
    )
  }

  const handleStoryClick = (id: string) => {
    const story = stories.find((s) => s.id === id)
    if (story && onStoryClick) {
      onStoryClick(story)
    }
  }

  return (
    <NewsfeedWidget
      stories={stories}
      onStoryClick={handleStoryClick}
    />
  )
}
