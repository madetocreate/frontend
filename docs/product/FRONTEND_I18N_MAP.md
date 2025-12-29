# Frontend i18n Mapping & Setup

## Unterstützte Sprachen

- **de** (Deutsch) - Default
- **en** (English) - Fallback
- **es** (Español)
- **fr** (Français) - **NEU**
- **it** (Italiano) - **NEU**

## i18n Setup

### Library
- **i18next** ^23.16.8
- **react-i18next** ^15.7.4

### Konfiguration
- **Datei**: `src/i18n/config.ts`
- **Fallback**: `en` → `de`
- **Default Language**: `de`
- **Sprach-Speicherung**: `localStorage.getItem('language')` (wird aus config geladen)

### Dateistruktur
```
src/i18n/
├── config.ts          # i18next Konfiguration
├── index.ts           # Exports (useTranslation, i18n)
└── locales/
    ├── de.json        # Deutsch
    ├── en.json        # English
    ├── es.json        # Español
    ├── fr.json        # Français
    └── it.json        # Italiano
```

### Verwendung in Komponenten
```tsx
import { useTranslation } from '../../i18n'

function MyComponent() {
  const { t } = useTranslation()
  return <div>{t('common.save')}</div>
}
```

## Aktuelle Translation Keys

### Common (common.*)
- close, cancel, save, delete, edit, add, remove, confirm
- yes, no, loading, error, success, warning, info

### Calendar (calendar.*)
- title, aiScheduling, describeAppointment, examples
- createAppointment, cancel, today, day, week, month, agenda
- newEvent, noAppointments, utilization, focusTime
- [vollständig in allen 5 Sprachen]

### Dashboard (dashboard.*)
- configure, configureDescription, availableWidgets
- dashboardPreview, addWidgets, disabledWidgets
- layouts, widgets, actions, save, reset, saveAndClose
- [vollständig in allen 5 Sprachen]

### Onboarding (onboarding.*)
- welcome, welcomeDescription, configureDashboard
- settings, complete, step, of, skip, next, finish
- [vollständig in allen 5 Sprachen]

### Marketplace (marketplace.*)
- title, searchPlaceholder, premiumDashboards
- popularAddons, allProducts, searchResults, noResults
- buy, open, installed, rating, reviews, category
- [vollständig in allen 5 Sprachen]

## Bekannte Hardcoded Strings (TODO)

### ChatShell.tsx
- "Speichern", "Gespeichert", "Bearbeiten", "Kopieren"
- "Erneut senden", "Vorlesen stoppen", "Schlecht"
- "Schnellaktionen", "Neu generieren", "Vorlesen"
- "Stoppen", "Nach unten springen", "Hinweis schließen"
- "Menü öffnen", "Mikrofon", "Senden", "Überlegt..."
- "Gedankengang anzeigen"

### ChatWorkspaceShell.tsx
- "Add-ons", "Dashboards", "Wizards & Onboardings"
- "Einstellungen", "Benachrichtigungen"
- "Dashboard anzeigen", "Panel einklappen"
- "Größe ändern", "Schließen", "Verkleinern", "Vergrößern"

### NewsGreetingWidget.tsx
- "Persönliche News werden geladen…"
- "Noch keine Empfehlungen – starte ein Gespräch, damit ich deine Interessen besser kennenlerne."

### GastronomieSidebarWidget.tsx
- "Übersicht", "Reservierungen", "Speisekarte", "Bestellungen"
- "Inventar", "Personal", "Bar", "Analytics", "Marketing", "Einstellungen"

### PracticeSidebarWidget.tsx
- "Übersicht", "Patienten", "Termine", "Dokumente", "Statistiken"
- "Telefon-Empfang", "Formulare", "Abrechnung", "Compliance", "Einstellungen"

### Settings (verschiedene Dateien)
- "Umgebung", "Version", "Lokalisierung", "Sprache", "Zeitzone"
- "Erscheinungsbild", "Design", "Benachrichtigungen"
- "Rechnungen", "Zahlungsmethode", "Kreditkarte"
- "Temperature", "Features", "Streaming aktivieren"

## Glossar (konsistent verwenden)

### Marke
- **Aklow** (immer so geschrieben)

### Kernbegriffe
- **Anwendungen**
  - EN: Use cases
  - ES: Aplicaciones
  - FR: Cas d'usage
  - IT: Casi d'uso

- **Fundament**
  - EN: Foundation
  - ES: Fundamento
  - FR: Fondations
  - IT: Fondamenta

- **Intelligenter Posteingang**
  - EN: Smart inbox
  - ES: Bandeja de entrada inteligente
  - FR: Boîte de réception intelligente
  - IT: Posta in arrivo intelligente

- **Website & Telefon Assistent**
  - EN: Website & phone assistant
  - ES: Asistente web y telefónico
  - FR: Assistant web et téléphone
  - IT: Assistente web e telefono

- **Dokumente & Ordnung**
  - EN: Documents & order
  - ES: Documentos y orden
  - FR: Documents & organisation
  - IT: Documenti & ordine

- **Kunden & Vorgänge**
  - EN: Customers & cases
  - ES: Clientes y casos
  - FR: Clients & dossiers
  - IT: Clienti & pratiche

- **Bewertungen**
  - EN: Reviews
  - ES: Reseñas
  - FR: Avis
  - IT: Recensioni

- **3 Minuten KI-Potenzial-Check**
  - EN: 3-minute AI potential check
  - ES: Chequeo de potencial de IA en 3 minutos
  - FR: Check du potentiel IA en 3 minutes
  - IT: Check del potenziale IA in 3 minuti

## Tonalität

Alle Sprachen nutzen **informelle Du-Form**:
- DE: du
- EN: you
- ES: tú (keine Mischung mit "usted")
- FR: tu (keine Mischung mit "vous")
- IT: tu (keine Mischung mit "Lei")



## Action Engine V2 Hinweis

Die Action Engine V2 arbeitet sprachagnostisch; Ausgaben werden nicht auf eine bestimmte Sprache festgelegt und können je nach Kontext lokalisiert werden.
