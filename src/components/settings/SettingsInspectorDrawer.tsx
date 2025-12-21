'use client'

import React from 'react'
import { 
  DrawerHeader, 
  DrawerCard, 
  ActionGroup, 
  ActionButton, 
  DrawerSectionTitle
} from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { 
  XMarkIcon, 
  BookOpenIcon, 
  SparklesIcon, 
  ShieldExclamationIcon, 
  LightBulbIcon, 
  BeakerIcon, 
  CheckCircleIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline'
import { SettingsView } from './SettingsSidebarWidget'

type SettingsInspectorDrawerProps = {
  view: SettingsView
  mode?: 'simple' | 'expert'
  onClose: () => void
}

const SETTINGS_VIEW_METADATA: Record<SettingsView, {
  title: string;
  description: string;
  recommendedDefaults: { label: string; value: string | boolean }[];
  dangerZone?: string;
}> = {
  general: {
    title: 'Allgemeine Einstellungen',
    description: 'Verwalte grundlegende App-Einstellungen wie Sprache, Zeitzone und Standardansichten.',
    recommendedDefaults: [
      { label: 'Standard-Sprache', value: 'Deutsch' },
      { label: 'Dark Mode', value: true },
      { label: 'Auto-Speichern', value: true },
    ],
  },
  account: {
    title: 'Mein Account',
    description: 'Verwalte deine persönlichen Daten, Login-Informationen und Profil-Einstellungen.',
    recommendedDefaults: [
      { label: 'Zwei-Faktor-Authentifizierung', value: true },
      { label: 'E-Mail-Benachrichtigungen', value: true },
    ],
  },
  ai: {
    title: 'KI & Modelle',
    description: 'Konfiguriere die KI-Modelle, die für Analysen und Vorschläge verwendet werden, sowie deren Verhalten.',
    recommendedDefaults: [
      { label: 'Standard-Modell', value: 'GPT-4o' },
      { label: 'Kreativitäts-Level', value: 'Mittel' },
      { label: 'Auto-Vervollständigung', value: true },
    ],
  },
  agents: {
    title: 'Agenten & Tools',
    description: 'Verwalte deine autonomen Agenten und die Tools, auf die sie zugreifen können.',
    recommendedDefaults: [
      { label: 'Standard-Agent', value: 'Support-Bot' },
      { label: 'Zugriff auf Kalender', value: true },
    ],
  },
  security: {
    title: 'Sicherheit & Policies',
    description: 'Definiere Sicherheitsrichtlinien, Zugriffsrechte und überwache die Systemintegrität.',
    recommendedDefaults: [
      { label: 'Passwort-Komplexität', value: 'Hoch' },
      { label: 'Sitzungs-Timeout', value: '30 Min' },
      { label: 'PII-Erkennung', value: true },
    ],
    dangerZone: 'Änderungen hier können weitreichende Auswirkungen auf die Datensicherheit haben. Sei vorsichtig!',
  },
  database: {
    title: 'Datenbank & Speicher',
    description: 'Verwalte Datenbankverbindungen, Speicherorte und Datenaufbewahrungsrichtlinien.',
    recommendedDefaults: [
      { label: 'Backup-Intervall', value: 'Täglich' },
      { label: 'Datenverschlüsselung', value: 'AES-256' },
    ],
    dangerZone: 'Fehlkonfigurationen können zu Datenverlust oder -inkonsistenzen führen. Nur für erfahrene Benutzer!',
  },
  users: {
    title: 'Benutzer & Rollen',
    description: 'Verwalte Benutzerkonten, weise Rollen zu und konfiguriere Berechtigungen.',
    recommendedDefaults: [
      { label: 'Neue Benutzer-Rolle', value: 'Mitarbeiter' },
      { label: 'Gastzugang', value: false },
    ],
  },
  billing: {
    title: 'Abrechnung',
    description: 'Verwalte deine Abonnements, Zahlungsmethoden und sieh dir Rechnungen an.',
    recommendedDefaults: [
      { label: 'Monatliche Abrechnung', value: true },
      { label: 'Rechnungs-E-Mail', value: 'admin@example.com' },
    ],
  },
  onboarding: {
    title: 'Onboarding',
    description: 'Geführter Einstieg und Abschlussstatus deiner Einrichtung.',
    recommendedDefaults: [
      { label: 'Willkommens-Tour', value: true },
      { label: 'Checkliste anzeigen', value: true },
    ],
  },
  integrations: {
    title: 'Integrationen',
    description: 'Verbinde Aklow mit externen Diensten und Anwendungen.',
    recommendedDefaults: [
      { label: 'Slack-Integration', value: true },
      { label: 'Google Workspace', value: true },
    ],
  },
  marketplace: {
    title: 'Marktplatz',
    description: 'Entdecke und installiere neue Agenten, Tools und Erweiterungen für Aklow.',
    recommendedDefaults: [
      { label: 'Auto-Update', value: true },
      { label: 'Beta-Programme', value: false },
    ],
  },
  memory: {
    title: 'Speicher',
    description: 'Verwalte die Langzeit-Erinnerungen der KI und deren Zugriffsrechte.',
    recommendedDefaults: [
      { label: 'Speicher-Limit', value: '10 GB' },
      { label: 'Auto-Archivierung', value: true },
    ],
  },
}

export function SettingsInspectorDrawer({ view, mode = 'simple', onClose }: SettingsInspectorDrawerProps) {
  const metadata = SETTINGS_VIEW_METADATA[view]

  if (!metadata) return null

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
      <DrawerHeader 
        title={metadata.title} 
        subtitle="Einstellungen verwalten"
        status={{ label: 'Lokal', tone: 'muted' }}
        onClose={onClose}
        trailing={
          <AkIconButton size="sm" variant="ghost" aria-label="Dokumentation">
            <BookOpenIcon className="h-4 w-4" />
          </AkIconButton>
        }
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 ak-scrollbar">
        {/* Überblick Card */}
        <DrawerCard>
          <DrawerSectionTitle>Überblick</DrawerSectionTitle>
          <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
            {metadata.description}
          </p>
        </DrawerCard>

        {/* Empfohlene Defaults Card */}
        <DrawerCard>
          <DrawerSectionTitle>Empfohlene Defaults</DrawerSectionTitle>
          <div className="space-y-3">
            {metadata.recommendedDefaults.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-[var(--ak-color-text-secondary)]">{item.label}</span>
                {typeof item.value === 'boolean' ? (
                  <AkBadge tone={item.value ? 'success' : 'muted'} size="sm">
                    {item.value ? 'Aktiviert' : 'Deaktiviert'}
                  </AkBadge>
                ) : (
                  <span className="font-medium text-[var(--ak-color-text-primary)]">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </DrawerCard>

        {/* KI-Aktionen Card */}
        <DrawerCard>
          <DrawerSectionTitle>KI-Assistent Aktionen</DrawerSectionTitle>
          <div className="space-y-4">
            <ActionGroup label="Verstehen">
              <ActionButton icon={<LightBulbIcon className="h-3.5 w-3.5" />} label="Erklären" shortcut="E" />
              <ActionButton icon={<SparklesIcon className="h-3.5 w-3.5" />} label="Best Practices" shortcut="B" />
            </ActionGroup>

            <ActionGroup label="Prüfen">
              <ActionButton icon={<ShieldExclamationIcon className="h-3.5 w-3.5" />} label="Risiko-Check" shortcut="R" />
              <ActionButton icon={<BeakerIcon className="h-3.5 w-3.5" />} label="Konfig scannen" shortcut="K" />
            </ActionGroup>

            <ActionGroup label="Handeln">
              <ActionButton icon={<CheckCircleIcon className="h-3.5 w-3.5" />} label="Policy anwenden" shortcut="P" />
              <ActionButton icon={<ArrowDownTrayIcon className="h-3.5 w-3.5" />} label="Settings Export" shortcut="X" />
            </ActionGroup>
          </div>
        </DrawerCard>

        {/* Änderungen Card */}
        <DrawerCard>
          <DrawerSectionTitle>Änderungen</DrawerSectionTitle>
          <p className="text-xs text-[var(--ak-color-text-muted)] italic px-1">
            Noch keine Änderungen für diese Ansicht aufgezeichnet.
          </p>
        </DrawerCard>

        {/* Danger Zone Card */}
        {mode === 'expert' && metadata.dangerZone && (
          <DrawerCard className="border-[var(--ak-color-border-danger)]/30 bg-[var(--ak-color-bg-danger)]/5">
            <DrawerSectionTitle className="text-red-600">Gefahrenzone</DrawerSectionTitle>
            <div className="flex items-start gap-3">
              <ShieldExclamationIcon className="h-5 w-5 text-red-600 shrink-0" />
              <div className="space-y-3">
                <p className="text-xs text-red-600 leading-relaxed font-medium">
                  {metadata.dangerZone}
                </p>
                <ActionButton 
                  label="Einstellungen zurücksetzen" 
                  variant="danger"
                  icon={<XMarkIcon className="h-3.5 w-3.5" />} 
                />
              </div>
            </div>
          </DrawerCard>
        )}
      </div>
    </div>
  )
}
