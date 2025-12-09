'use client'

import type { QuickActionPayload } from '@/lib/quickActionsBus'

type PromptMap = Record<string, string>

const DETAILED_PROMPTS: PromptMap = {
  'marketing.campaign.newsletter':
    'Plane eine Newsletter-Kampagne mit mehreren E-Mails, klaren Betreffzeilen, Kernbotschaften und Call-to-Actions. Stelle zuerst kurz ein paar Rückfragen zu Produkt, Zielgruppe und Zeitraum.',
  'marketing.campaign.promo':
    'Entwirf eine kurzfristige Aktionskampagne mit klarer Angebotsstruktur, Laufzeit und Kanälen. Stelle kurz Rückfragen und schlage dann eine Kampagnenstruktur mit Nachrichten und groben Terminen vor.',
  'marketing.campaign.social':
    'Plane eine Social-Media-Serie mit mehreren Post-Ideen, Hooks und Call-to-Actions für die wichtigsten Kanäle. Frage kurz nach Zielgruppe und Tonalität.',
  'marketing.campaign.audit':
    'Analysiere bestehende Marketingtexte, Newsletter oder Landingpages. Erkenne Stärken, Schwächen und formuliere konkrete Optimierungsvorschläge.',

  'automation.leads.followup':
    'Baue einen Lead-Follow-up-Workflow. Kläre kurz typische Journey, Kanäle und Reaktionszeiten und schlage dann einen gestuften Ablauf mit Triggern und Nachrichten vor.',
  'automation.support.triage':
    'Entwirf eine Triage für Support-Anfragen mit sinnvollen Kategorien, Prioritäten und Zuständigkeiten. Beschreibe einen Routing-Workflow in klaren Schritten.',
  'automation.reminders':
    'Definiere einen Reminder-Prozess für Aufgaben oder Kundenkontakte. Frage nach Rhythmus und Kanälen und schlage eine einfache Struktur mit konkreten Beispielen vor.',
  'automation.pipeline':
    'Hilf, eine Sales-Pipeline zu strukturieren. Definiere sinnvolle Phasen mit Ein- und Ausstiegskriterien und schlage automatische Aufgaben pro Phase vor.',

  'memory.search.customer':
    'Stelle alle relevanten Informationen zu einer Person oder Firma strukturiert zusammen (Stammdaten, Historie, wichtige Notizen) und leite mögliche nächste Schritte ab.',
  'memory.search.conversations':
    'Fasse mehrere Gespräche zu einem Thema zusammen. Hebe wichtige Entscheidungen, offene Punkte und Risiken hervor und schlage konkrete nächste Schritte vor.',
  'memory.search.docs':
    'Durchsuche vorhandene Dokumente gedanklich nach Antworten auf eine Frage. Nenne die wichtigsten Stellen und fasse sie klar zusammen.',
  'memory.search.insights':
    'Suche in vorhandenen Daten nach Mustern und Chancen. Formuliere Insights, Hypothesen und mögliche Experimente oder Aktionen.',

  'generic.brainstorm':
    'Starte ein fokussiertes Brainstorming. Sammle erst viele Ideen, gruppiere sie in Cluster und hilf dann beim Priorisieren.',
  'generic.plan':
    'Erstelle einen Schritt-für-Schritt-Plan. Kläre kurz das Ziel und Rahmenbedingungen und liefere dann einen nummerierten Plan mit konkreten nächsten Aktionen.',
  'generic.review':
    'Gib konstruktives Feedback zu Inhalt, Struktur und Wirkung. Erkenne Stärken und Schwächen und schlage konkrete Verbesserungen vor.',
  'generic.summarize':
    'Fasse längere Inhalte kompakt zusammen. Hebe Kernpunkte, Entscheidungen und To-dos hervor und schlage eine sinnvolle nächste Aktion vor.'
}

function normalizeSource(source?: string): string {
  if (!source) return 'generic'
  if (source.startsWith('marketing')) return 'marketing'
  if (source.startsWith('automation')) return 'automation'
  if (source.startsWith('memory')) return 'memory'
  return source
}

export function buildQuickActionPrompt(payload: QuickActionPayload): string {
  const id = payload.id ?? ''
  const source = normalizeSource(payload.source)

  const specific = id ? DETAILED_PROMPTS[id] : undefined
  if (specific) {
    return specific
  }

  if (source === 'marketing') {
    return `Du bist ein Marketing-Assistent. Die Schnellaktion "${id || 'marketing'}" wurde ausgelöst. Interpretiere sie im Marketing-Kontext, stelle ein bis zwei Rückfragen und schlage dann eine konkrete Kampagne mit nächsten Schritten vor.`
  }

  if (source === 'automation') {
    return `Du bist ein Automatisierungs-Assistent. Die Schnellaktion "${id || 'automation'}" wurde ausgelöst. Identifiziere den zugrunde liegenden Prozess, stelle Rückfragen falls nötig und entwirf einen klaren Workflow in nummerierten Schritten.`
  }

  if (source === 'memory') {
    return `Du bist ein Wissens- und Memory-Assistent. Die Schnellaktion "${id || 'memory'}" wurde ausgelöst. Nutze vorhandenes Wissen, fasse relevante Informationen strukturiert zusammen und leite daraus konkrete Handlungsempfehlungen ab.`
  }

  return `Du bist ein hilfreicher Business-Assistent. Eine generische Schnellaktion "${id || 'generic'}" wurde ausgelöst. Interpretiere den Kontext selbstständig, stelle Rückfragen falls Informationen fehlen und schlage einen sinnvollen nächsten Schritt vor.`
}
