# Sidebar Scaffold Status

## Übersicht

Dieses Dokument beschreibt den aktuellen Status des Sidebar-Gerüsts nach der Vereinheitlichung aller Sidebar-Module.

## Ziele erreicht

### ✅ Rail-Reihenfolge korrigiert
Die Module-Reihenfolge in der Icon-Rail wurde korrigiert:
1. Chat
2. Posteingang
3. Heute (Tasks)
4. Schnellaktionen
5. Verlauf (Timeline)
6. Einstellungen (unten)

### ✅ Gemeinsame Layout-Komponenten

#### SidebarModuleLayout
- **Datei**: `src/components/ui/SidebarModuleLayout.tsx`
- **Status**: Existiert bereits, wird von allen Hauptmodulen genutzt
- **Features**: 
  - Einheitliches Header/Body/Footer Layout
  - Scrollbarer Content-Bereich
  - Unterstützung für Primary Actions, Actions, Search
  - Footer mit ak-sidebar-cap--bottom

#### SidebarHeader
- **Datei**: `src/components/ui/SidebarHeader.tsx`
- **Status**: Existiert bereits, wird über SidebarModuleLayout genutzt
- **Features**:
  - Title + optional Subtitle
  - Search-Toggle
  - Command Palette Button
  - Inspector Button
  - Primary Action Button
  - Zusätzliche Actions (ReactNode)

#### SidebarFooter
- **Datei**: `src/components/ui/SidebarFooter.tsx`
- **Status**: Existiert bereits, kann über SidebarModuleLayout footer-Prop genutzt werden

#### SidebarSectionCard
- **Datei**: `src/components/ui/SidebarSectionCard.tsx`
- **Status**: Existiert bereits, wird für konsistente Section-Container genutzt

## Modul-Status

### ✅ Chat (ChatSidebarContent)
- **Datei**: `src/components/chat/ChatSidebarContent.tsx`
- **Status**: Migriert auf SidebarModuleLayout
- **Änderungen**:
  - QuickActionsSection entfernt (jetzt eigenes Modul)
  - Nutzt SidebarModuleLayout mit Header/Footer
  - Footer: "Chat ohne Memory" Button
- **Layout**: Header (Title + PrimaryAction "Neuer Chat") → Body (Projekte + Threads) → Footer

### ✅ Posteingang (InboxDrawerWidget)
- **Datei**: `src/components/InboxDrawerWidget.tsx`
- **Status**: Migriert auf SidebarModuleLayout
- **Änderungen**:
  - Nutzt SidebarModuleLayout mit Header/Footer
  - Filter-Bereich bleibt innerhalb des scrollbaren Body (kann später sticky gemacht werden)
  - Footer: "Neu" Button für Compose
- **Layout**: Header (Title + Actions: Mark all read, Refresh) → Filter-Bereich → Body (Inbox Items) → Footer

### ✅ Heute (TasksSidebarWidget)
- **Datei**: `src/components/TasksSidebarWidget.tsx`
- **Status**: Nutzt bereits SidebarModuleLayout
- **Layout**: Header (Title + Subtitle) → Body (Action Rows) → Footer ("Zum Posteingang" Button)

### ✅ Schnellaktionen (QuickActionsSidebarWidget)
- **Datei**: `src/components/QuickActionsSidebarWidget.tsx`
- **Status**: Nutzt bereits SidebarModuleLayout
- **Layout**: Header (Title + Subtitle) → Body (Segment Control + QuickActionsSection) → Footer (Info-Text)

### ✅ Verlauf (TimelineSidebarWidget)
- **Datei**: `src/components/TimelineSidebarWidget.tsx`
- **Status**: Nutzt bereits SidebarModuleLayout
- **Layout**: Header (Title + Subtitle) → Body (Timeline Entries) → kein Footer

### ⚠️ Einstellungen (SettingsSidebarWidget)
- **Datei**: `src/components/settings/SettingsSidebarWidget.tsx`
- **Status**: Nutzt noch nicht SidebarModuleLayout
- **Grund**: Optional für Gerüst-Phase, kann später migriert werden
- **Aktuell**: Nutzt SidebarHeader + SidebarFooter direkt, hat eigenes Scroll-Container

## CSS-Klassen & Utilities

### ak-sidebar-cap
- **Verwendung**: Header und Footer verwenden `ak-sidebar-cap--top` bzw. `ak-sidebar-cap--bottom`
- **Definiert in**: `src/app/ak-scaffold.css`
- **Effekt**: Glassmorphism-Effekt mit Backdrop-Filter

### ak-divider-right
- **Verwendung**: Sidebar-Panel hat `ak-divider-right` für Divider zur Main Area
- **Definiert in**: `src/app/ak-scaffold.css`

### ak-rail
- **Verwendung**: Icon-Rail auf der linken Seite
- **Definiert in**: `src/app/ak-scaffold.css`

## Struktur-Übersicht

```
ChatWorkspaceShell
├── Icon-Rail (64px)
│   ├── Chat
│   ├── Posteingang
│   ├── Heute
│   ├── Schnellaktionen
│   ├── Verlauf
│   └── Einstellungen (unten)
│
└── Sidebar-Panel (280px, optional)
    └── SidebarModuleLayout (pro aktivem Modul)
        ├── SidebarHeader
        │   ├── Title (+ optional Subtitle)
        │   ├── PrimaryAction (optional)
        │   ├── Actions (optional)
        │   ├── Search Button
        │   ├── Command Palette Button
        │   └── Inspector Button
        ├── Body (scrollbar)
        │   └── Modul-spezifischer Content
        └── Footer (optional, sticky)
            └── PrimaryAction oder Custom Content
```

## TODOs für "Beauty Pass" (späterer Schritt)

### Layout-Verfeinerungen
- [ ] Filter-Bereich in InboxDrawerWidget sticky machen (aktuell innerhalb scrollbarem Body)
- [ ] SettingsSidebarWidget auf SidebarModuleLayout migrieren (optional)
- [ ] Virtuoso-Höhe in InboxDrawerWidget dynamisch berechnen (aktuell feste 600px)
- [ ] Padding/Margin-Konsistenz prüfen (negativ-Margins für Alignment)

### Visuelle Verbesserungen
- [ ] Active/Hover States in Rail vereinheitlichen (aktuell ak-rail-btn--active)
- [ ] Tooltip-Positionierung optimieren
- [ ] Scrollbar-Styling vereinheitlichen (ak-scrollbar)
- [ ] Glassmorphism-Effekte in ak-sidebar-cap verfeinern

### Funktionalität
- [ ] Test-Button in InboxDrawerWidget entfernen (nur Dev-Mode, aber trotzdem prüfen)
- [ ] Keyboard-Navigation optimieren
- [ ] Drag & Drop Feedback verbessern

## Wiederverwendbare Komponenten

### Bereits vorhanden
- ✅ `SidebarModuleLayout` - Zentrale Layout-Komponente
- ✅ `SidebarHeader` - Einheitlicher Header
- ✅ `SidebarFooter` - Footer-Komponente (wird über SidebarModuleLayout genutzt)
- ✅ `SidebarSectionCard` - Section-Container für modulare Inhalte
- ✅ `QuickActionsSection` - Quick Actions Liste (nutzt ACTION_REGISTRY)
- ✅ `ActionRow` - Einzelne Action-Row für Sidebar

### Wird genutzt von
- ChatSidebarContent
- InboxDrawerWidget
- TasksSidebarWidget
- QuickActionsSidebarWidget
- TimelineSidebarWidget

## Konsistenz-Checkliste

- ✅ Alle Hauptmodule nutzen SidebarModuleLayout
- ✅ Header-Struktur ist konsistent (Title + optional Subtitle + Actions)
- ✅ Footer ist optional und konsistent (wenn vorhanden)
- ✅ Scroll-Verhalten ist konsistent (overflow-y-auto mit ak-scrollbar)
- ✅ Rail-Reihenfolge stimmt
- ✅ Kein QuickActions-Band direkt unter Chat-Header (entfernt)
- ✅ Module-Routing funktioniert (activeModuleToken-basiert)

## Notizen

- QuickActionsSection wurde aus ChatSidebarContent entfernt, da Schnellaktionen jetzt ein eigenes Modul sind
- InboxDrawerWidget hat einen Filter-Bereich, der aktuell innerhalb des scrollbaren Body ist (kann später sticky gemacht werden)
- Virtuoso in InboxDrawerWidget hat aktuell eine feste Höhe (600px) - sollte später dynamisch berechnet werden
- SettingsSidebarWidget nutzt noch nicht SidebarModuleLayout, kann aber später migriert werden

