'use client'

import React from 'react'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { dispatchClearContext, dispatchPrefillChat, dispatchFocusChat, dispatchOpenModule } from '@/lib/events/dispatch'
import { XMarkIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface BotDeckProps {
  module: 'website_bot' | 'telephony_bot' | 'review_bot'
  view: string
  onClose?: () => void
}

export function BotDeck({ module, view, onClose }: BotDeckProps) {
  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      dispatchClearContext()
    }
  }

  // Bot names and badges
  const botConfig = {
    website_bot: {
      name: 'WebsiteBot',
      badge: 'BETA' as const,
      accent: 'var(--ak-accent-website)',
    },
    telephony_bot: {
      name: 'TelefonBot',
      badge: 'BETA' as const,
      accent: 'var(--ak-accent-phone)',
    },
    review_bot: {
      name: 'ReviewBot',
      badge: 'BETA' as const,
      accent: 'var(--ak-accent-reviews)', // Assuming this exists, fallback if not
    },
  }

  const config = botConfig[module] || { name: 'Bot', badge: 'BETA', accent: 'var(--ak-color-accent)' }

  // View labels
  const viewLabels: Record<string, string> = {
    overview: 'Aktionen',
    conversations: 'Übersicht',
    calls: 'Übersicht',
    reviews: 'Übersicht',
    setup: 'Einstellungen',
    settings: 'Einstellungen',
  }

  const subtitle = viewLabels[view] || view

  return (
    <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Bot Header Card with Glow */}
      <div className="relative group rounded-[var(--ak-radius-lg)] p-[1px] overflow-hidden">
        {/* Glow Effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--ak-color-accent-soft)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" 
          style={{ backgroundSize: '200% 100%' }} 
        />
        
        <CardShell className="relative !border-transparent h-full">
          <CardHeader
            title={config.name}
            subtitle={subtitle}
            meta={<AkBadge tone="neutral" size="sm" className="bg-[var(--ak-surface-2)]">{config.badge}</AkBadge>}
            actions={
              <AkIconButton
                variant="ghost"
                size="sm"
                onClick={handleClose}
                title="Schließen"
              >
                <XMarkIcon className="w-4 h-4" />
              </AkIconButton>
            }
          />
        </CardShell>
      </div>

      {/* Bot-specific content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        {module === 'website_bot' && <WebsiteBotContent view={view} />}
        {module === 'telephony_bot' && <TelephonyBotContent view={view} />}
        {module === 'review_bot' && <ReviewBotContent view={view} />}
      </div>
    </div>
  )
}

// Bot Action Tile Component (Enhanced)
interface BotActionTileProps {
  title: string
  description: string
  icon?: React.ReactNode
  onClick: () => void
  highlight?: boolean
}

function BotActionTile({ title, description, icon, onClick, highlight }: BotActionTileProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group w-full p-4 text-left rounded-[var(--ak-radius-lg)] border transition-all duration-300 relative overflow-hidden",
        highlight 
          ? "bg-[var(--ak-surface-1)] border-[var(--ak-color-accent)]/30 ak-shadow-soft hover:ak-shadow-md" 
          : "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] hover:border-[var(--ak-color-border-strong)]"
      )}
    >
      {/* Hover Light Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

      <div className="flex items-start gap-3 relative z-10">
        <div className={clsx(
          "flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
          highlight ? "bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]" : "bg-[var(--ak-surface-2)] text-[var(--ak-color-text-secondary)] group-hover:text-[var(--ak-color-text-primary)]"
        )}>
          {icon || <SparklesIcon className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={clsx(
              "text-sm font-semibold mb-1 transition-colors",
              highlight ? "text-[var(--ak-color-accent-strong)]" : "text-[var(--ak-color-text-primary)]"
            )}>
              {title}
            </h4>
            <ChevronRightIcon className="w-3 h-3 text-[var(--ak-color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </div>
          <p className="text-xs text-[var(--ak-color-text-secondary)] leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}

// Website Bot Content
function WebsiteBotContent({ view }: { view: string }) {
  if (view === 'overview') {
    return (
      <>
        <CardShell className="overflow-visible border-none shadow-none bg-transparent">
          <div className="mb-3 px-1">
            <h3 className="text-xs font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider">Empfohlen</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BotActionTile
              title="Conversion erhöhen"
              description="Schlage 5 konkrete Änderungen vor, um mehr Leads zu generieren."
              highlight={true}
              onClick={() => {
                dispatchPrefillChat('Schlage 5 konkrete Änderungen am WebsiteBot vor, um mehr Leads/Termine zu erzeugen.', 'website')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="Website scannen"
              description="Analysiere Struktur und Angebot für Bot-Optimierung."
              onClick={() => {
                dispatchPrefillChat('Analysiere unsere Website (Struktur, Angebot, FAQs) und schlage Verbesserungen für den WebsiteBot vor.', 'website')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="FAQ Update"
              description="Aktualisiere die Wissensbasis aus der Website."
              onClick={() => {
                dispatchPrefillChat('Erstelle/aktualisiere eine FAQ-Basis für den WebsiteBot aus unserer Website-Struktur. Liste fehlende Inhalte.', 'website')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="Qualitätsreport"
              description="Analyse schlechter Antworten und Fixes."
              onClick={() => {
                dispatchPrefillChat('Erstelle einen Report: Welche Nutzerfragen beantwortet der WebsiteBot schlecht und wie fixen wir das?', 'website')
                dispatchFocusChat()
              }}
            />
          </div>
        </CardShell>

        <CardShell>
          <CardHeader title="Nächste Schritte" />
          <CardBody>
            <ul className="space-y-3">
              {[
                { label: 'Snippet einbauen', status: 'done' },
                { label: 'Domain verifizieren', status: 'pending' },
                { label: 'Brand Voice definieren', status: 'pending' }
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--ak-surface-2)] transition-colors cursor-default">
                  <div className={clsx(
                    "w-5 h-5 rounded-full flex items-center justify-center border",
                    step.status === 'done' ? "bg-[var(--ak-semantic-success)] border-[var(--ak-semantic-success)]" : "border-[var(--ak-color-border-strong)] text-transparent"
                  )}>
                    {step.status === 'done' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={clsx("text-sm", step.status === 'done' ? "text-[var(--ak-color-text-secondary)] line-through" : "text-[var(--ak-color-text-primary)]")}>
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
          <CardFooter>
            <AkButton
              variant="primary"
              onClick={() => dispatchOpenModule('settings', 'integrations')}
              size="sm"
              className="flex-1 shadow-sm"
            >
              Integrationen öffnen
            </AkButton>
          </CardFooter>
        </CardShell>
      </>
    )
  }

  // ... (Other views remain similar structure, can enhance later)
  if (view === 'conversations') return <WebsiteBotConversations />
  if (view === 'setup') return <WebsiteBotSetup />
  
  return null
}

// Subcomponents for WebsiteBot to keep main file clean(er)
function WebsiteBotConversations() {
  return (
    <>
      <CardShell>
        <CardHeader title="KPIs" />
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <KPITile label="Gespräche (7d)" value="124" trend="+12%" />
            <KPITile label="Leads" value="8" trend="+2" />
            <KPITile label="Antwortquote" value="98%" />
          </div>
        </CardBody>
      </CardShell>

      <CardShell>
        <CardHeader title="Letzte Gespräche" />
        <CardBody padding="none">
          <div className="divide-y divide-[var(--ak-color-border-fine)]">
            {[
              { title: 'Frage zu Preisen', meta: 'vor 2h', status: 'offen' },
              { title: 'Terminanfrage', meta: 'vor 5h', status: 'beantwortet' },
              { title: 'Produktinformationen', meta: 'vor 1d', status: 'offen' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  dispatchPrefillChat('Fasse das letzte WebsiteBot-Gespräch zusammen und leite ToDos ab.', 'website')
                  dispatchFocusChat()
                }}
                className="w-full p-4 text-left hover:bg-[var(--ak-color-bg-hover)] transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="block text-sm font-medium text-[var(--ak-color-text-primary)] group-hover:text-[var(--ak-color-accent)] transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs text-[var(--ak-color-text-tertiary)]">{item.meta}</span>
                </div>
                <AkBadge tone={item.status === 'offen' ? 'warning' : 'success'} size="xs">
                  {item.status}
                </AkBadge>
              </button>
            ))}
          </div>
        </CardBody>
      </CardShell>
    </>
  )
}

function WebsiteBotSetup() {
  return (
    <CardShell>
      <CardHeader title="Installations‑Snippet" />
      <CardBody>
        <div className="bg-[var(--ak-surface-0)] border border-[var(--ak-color-border-subtle)] rounded-lg p-3 relative group">
          <pre className="text-xs text-[var(--ak-color-text-primary)] font-mono overflow-x-auto">
{`<script src="https://cdn.aklow.ai/widget.js" 
  data-id="ak_12345678" 
  async>
</script>`}
          </pre>
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AkButton size="sm" variant="secondary" onClick={() => {}}>Kopieren</AkButton>
          </div>
        </div>
      </CardBody>
    </CardShell>
  )
}

// Telephony Bot Content
function TelephonyBotContent({ view }: { view: string }) {
  if (view === 'overview') {
    return (
      <>
        <CardShell className="overflow-visible border-none shadow-none bg-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BotActionTile
              title="Call Script optimieren"
              description="Analysiere Skript für höhere Abschlussquote."
              highlight={true}
              onClick={() => {
                dispatchPrefillChat('Analysiere unser Telefon-Skript und schlage Verbesserungen für höhere Abschlussquote vor.', 'telephony')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="Qualitätsreport"
              description="Analyse von Missverständnissen und Drop-offs."
              onClick={() => {
                dispatchPrefillChat('Erstelle einen Report über typische Probleme in Telefonaten (Missverständnisse, Drop-offs) und Fixes.', 'telephony')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="FAQ erstellen"
              description="Antwortbibliothek für Einwände und Fragen."
              onClick={() => {
                dispatchPrefillChat('Erstelle eine knappe FAQ/Antwortbibliothek für den TelefonBot (Einwandbehandlung, Preise, Öffnungszeiten).', 'telephony')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="Eskalation"
              description="Regeln für Mensch-Übergabe definieren."
              onClick={() => {
                dispatchPrefillChat('Schlage Regeln vor, wann der TelefonBot an einen Menschen eskalieren soll.', 'telephony')
                dispatchFocusChat()
              }}
            />
          </div>
        </CardShell>

        <CardShell>
          <CardHeader title="Schnellzugriff" />
          <CardBody>
            <div className="flex gap-3">
              <AkButton
                variant="secondary"
                onClick={() => dispatchOpenModule('settings', 'integrations')}
                size="sm"
                className="flex-1"
              >
                Nummern verwalten
              </AkButton>
              <AkButton
                variant="secondary"
                onClick={() => dispatchOpenModule('inbox')}
                size="sm"
                className="flex-1"
              >
                Anrufliste
              </AkButton>
            </div>
          </CardBody>
        </CardShell>
      </>
    )
  }
  
  if (view === 'calls') return <TelephonyCallsList />
  if (view === 'settings') return <TelephonySettings /> // Placeholder

  return null
}

function TelephonyCallsList() {
  // Mock data for now, fetch logic is in original file
  return (
    <CardShell>
      <CardHeader title="Letzte Anrufe" />
      <CardBody padding="none">
        <div className="divide-y divide-[var(--ak-color-border-fine)]">
          {[
            { from: '+49 171 1234567', time: '14:30', duration: '2m 14s', status: 'completed' },
            { from: '+49 89 9876543', time: '12:15', duration: '0m 45s', status: 'missed' },
            { from: 'Unbekannt', time: '10:00', duration: '1m 20s', status: 'completed' },
          ].map((call, i) => (
            <button key={i} className="w-full p-4 text-left hover:bg-[var(--ak-color-bg-hover)] transition-colors flex items-center justify-between">
              <div>
                <span className="block text-sm font-medium text-[var(--ak-color-text-primary)]">{call.from}</span>
                <span className="text-xs text-[var(--ak-color-text-tertiary)]">{call.time} • {call.duration}</span>
              </div>
              <AkBadge tone={call.status === 'completed' ? 'success' : 'error'} size="xs">
                {call.status === 'completed' ? 'Erfolg' : 'Verpasst'}
              </AkBadge>
            </button>
          ))}
        </div>
      </CardBody>
    </CardShell>
  )
}

function TelephonySettings() {
  return (
    <CardShell>
      <CardHeader title="Einstellungen" />
      <CardBody>
        <p className="text-sm text-[var(--ak-color-text-secondary)]">Platzhalter für Einstellungen...</p>
      </CardBody>
    </CardShell>
  )
}


// Review Bot Content
function ReviewBotContent({ view }: { view: string }) {
  if (view === 'overview') {
    return (
      <>
        <CardShell className="overflow-visible border-none shadow-none bg-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BotActionTile
              title="Neue Bewertungen"
              description="Priorisiere offene Reviews für heute."
              highlight={true}
              onClick={() => {
                dispatchPrefillChat('Analysiere neue Bewertungen und priorisiere: Wo sollten wir heute antworten?', 'review')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="Antwort-Stil"
              description="Definiere Tonality und Guidelines."
              onClick={() => {
                dispatchPrefillChat('Definiere unseren Antwortstil für Reviews (Tonality + Do/Don\'t) als kurze Guidelines.', 'review')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="Templates"
              description="Erstelle Vorlagen für Positiv/Negativ."
              onClick={() => {
                dispatchPrefillChat('Erstelle 5 Antwort-Templates (positiv/neutral/negativ) passend zu unserer Marke.', 'review')
                dispatchFocusChat()
              }}
            />
            <BotActionTile
              title="Wochenreport"
              description="Stimmung und Kritikpunkte analysieren."
              onClick={() => {
                dispatchPrefillChat('Erstelle einen Wochenreport: Stimmung, häufige Kritik, konkrete Verbesserungen.', 'review')
                dispatchFocusChat()
              }}
            />
          </div>
        </CardShell>
        
        <CardShell>
          <CardHeader title="Integration" />
          <CardBody>
             <AkButton
                variant="primary"
                onClick={() => dispatchOpenModule('settings', 'integrations')}
                size="sm"
                className="w-full"
              >
                Google / Trustpilot verbinden
              </AkButton>
          </CardBody>
        </CardShell>
      </>
    )
  }
  
  if (view === 'reviews') return <ReviewMetrics /> // Using existing component logic
  if (view === 'settings') return <ReviewSettings />

  return null
}

function ReviewMetrics() {
  return (
    <CardShell>
      <CardHeader title="Review Status" />
      <CardBody>
        <div className="grid grid-cols-4 gap-2 text-center">
          <KPITile label="Neu" value="3" />
          <KPITile label="Entwürfe" value="1" />
          <KPITile label="Gesamt" value="142" />
          <KPITile label="Ø Sterne" value="4.8" />
        </div>
      </CardBody>
    </CardShell>
  )
}

function ReviewSettings() {
  return (
    <CardShell>
      <CardHeader title="Einstellungen" />
      <CardBody>
        <p className="text-sm text-[var(--ak-color-text-secondary)]">Platzhalter für Review Settings...</p>
      </CardBody>
    </CardShell>
  )
}

// KPI Tile Helper
function KPITile({ label, value, trend }: { label: string, value: string, trend?: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--ak-color-text-tertiary)] mb-1">{label}</p>
      <p className="text-lg font-semibold text-[var(--ak-color-text-primary)]">{value}</p>
      {trend && <span className="text-[10px] text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)] px-1.5 py-0.5 rounded-full">{trend}</span>}
    </div>
  )
}
