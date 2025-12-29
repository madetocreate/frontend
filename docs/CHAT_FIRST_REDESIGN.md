# Chat First Redesign - Vollständige Dokumentation

## 📋 Übersicht

Das **Chat First Redesign** ist eine fundamentale UX-Verbesserung, die den Chat in den Mittelpunkt der Anwendung stellt. Alle Inhalte (E-Mails, WhatsApp-Nachrichten, Tabellen, Dokumente) werden direkt im Chat als Rich Content Cards gerendert, anstatt in separaten rechten Drawern.

### Hauptprinzipien

1. **Chat First**: Der Chat ist die zentrale Ansicht, alles andere wird darin gerendert
2. **Keine Drawer**: Rechte Drawer wurden komplett entfernt
3. **Floating Action Button (FAB)**: Kontextbezogene Aktionen über einen FAB
4. **Rich Content Cards**: E-Mails, Chats, Tabellen werden als interaktive Cards im Chat angezeigt
5. **Dashboard Overlay**: Übersichten öffnen sich als Overlay, nicht als Drawer

---

## 🏗️ Architektur

### Komponenten-Hierarchie

```
ChatWorkspaceShell
├── Left Sidebar (64px, Modul-Icons)
├── Left Drawer (280px, optional)
│   └── Modul-spezifische Widgets
├── Main Content (Chat - volle Breite)
│   ├── ChatShell
│   │   ├── ContextCardRenderer (Rich Content)
│   │   └── Chat Messages
│   └── ChatFirstFAB (Floating Action Button)
└── DashboardOverlay (Modal, bei Info-Button)
```

### Entfernte Komponenten

- ❌ Alle rechten Drawer (`RightDrawer`, `GrowthRightDrawer`, `CustomersRightDrawer`, etc.)
- ❌ `AIActionWizard` (4-Schritt-Wizard)
- ❌ Inspector-Logik (Resize, Expand, etc.)

### Neue Komponenten

- ✅ `ChatFirstFAB` - Floating Action Button für kontextbezogene Aktionen
- ✅ `DashboardOverlay` - Modal für Übersichten (statt Drawer)
- ✅ `EmailCard` - Rich E-Mail-Rendering im Chat
- ✅ `ChatThreadCard` - WhatsApp/Chat-Verläufe mit Bubbles
- ✅ `DataTableCard` - Tabellen (CRM, Kunden, etc.)
- ✅ `ContextCardRenderer` - Rendert die richtige Card basierend auf Kontext

---

## 🔄 Event-System

### Events

| Event | Beschreibung | Dispatcher | Listener |
|-------|--------------|------------|----------|
| `aklow-show-context-card` | Zeigt eine Context Card im Chat | `ChatWorkspaceShell` | `ContextCardRenderer` |
| `aklow-prefill-chat` | Befüllt den Chat-Input mit Text | `ChatFirstFAB`, `ContextCardRenderer` | `ChatShell` |
| `aklow-clear-context` | Schließt die aktuelle Context Card | `ContextCardRenderer` | `ChatWorkspaceShell` |

### Event-Flow Beispiel

```typescript
// 1. User klickt auf E-Mail in Sidebar
handleInboxItemClick(item)
  ↓
window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
  detail: { type: 'inbox', item, id: threadId }
}))

// 2. ContextCardRenderer empfängt Event
ContextCardRenderer → setContext(event.detail)
  ↓
loadContextData() → fetchInboxItem(threadId)
  ↓
EmailCard wird gerendert

// 3. User klickt auf FAB-Aktion
ChatFirstFAB → onAction(action)
  ↓
window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
  detail: { prompt: action.prompt, context: 'inbox' }
}))

// 4. ChatShell befüllt Input
ChatShell → handlePrefillChat()
  ↓
setInput(detail.prompt)
inputRef.current?.focus()
```

---

## 📦 Komponenten-Details

### ChatFirstFAB

**Datei**: `src/components/chat/ChatFirstFAB.tsx`

**Props**:
```typescript
interface ChatFirstFABProps {
  context: {
    type: 'inbox' | 'customer' | 'document' | 'growth' | 'none'
    item: InboxItem | null
    id: string | null
  }
  onAction: (action: { id: string; label: string; prompt: string }) => void
}
```

**Features**:
- Zeigt sich nur wenn `context.type !== 'none'`
- Pulsiert wenn Kontext aktiv ist
- Radial-Menu mit kontextbezogenen Aktionen
- Badge zeigt Anzahl der verfügbaren Aktionen
- Command Palette Hinweis (⌘K)

**Aktionen pro Kontext**:
- **Inbox**: Antwort schreiben, Zusammenfassen, Übersetzen, Tasks extrahieren
- **Customer**: Profil anreichern, Historie zeigen, Angebot vorschlagen, Churn-Risiko
- **Document**: Zusammenfassen, Kernpunkte, Fragen stellen, Übersetzen
- **Growth**: Kampagne starten, Zielgruppe, Content generieren, Performance

### DashboardOverlay

**Datei**: `src/components/dashboard/DashboardOverlay.tsx`

**Props**:
```typescript
interface DashboardOverlayProps {
  isOpen: boolean
  onClose: () => void
  activeModule: ModuleToken
  views: { ... }
}
```

**Features**:
- Modal-Overlay (nicht Drawer)
- Statistiken-Grid (4 Spalten)
- Letzte Aktivitäten
- ESC zum Schließen
- Backdrop-Blur

### Rich Content Cards

#### EmailCard

**Datei**: `src/components/chat/cards/EmailCard.tsx`

**Features**:
- Expandierbar (kollabiert/expandiert)
- E-Mail-Meta (Von, An, Betreff, Datum)
- Attachments-Anzeige
- Actions (Antworten, etc.)

#### ChatThreadCard

**Datei**: `src/components/chat/cards/ChatThreadCard.tsx`

**Features**:
- Platform-spezifisches Styling (WhatsApp, Telegram, SMS, etc.)
- Chat-Bubbles (incoming/outgoing)
- Status-Indikatoren (sent, delivered, read)
- Expandierbar für vollständigen Verlauf

#### DataTableCard

**Datei**: `src/components/chat/cards/DataTableCard.tsx`

**Features**:
- Sortierbare Tabellen
- Status-Badges mit Farben
- Currency-Formatierung
- Row-Click-Handler
- Load-More-Funktionalität

---

## 🔌 API-Integration

### contextDataService

**Datei**: `src/lib/contextDataService.ts`

**Features**:
- Authorization-Header automatisch hinzugefügt
- Fallback auf Mock-Daten wenn API nicht verfügbar
- Type-safe Interfaces

**Endpoints**:

| Funktion | Endpoint | Beschreibung |
|----------|----------|--------------|
| `fetchInboxItem` | `GET /api/inbox/:threadId` | E-Mail-Details |
| `fetchChatThread` | `GET /api/messages/:threadId?platform=...` | Chat-Verlauf |
| `fetchCustomerList` | `GET /api/customers?limit=10` | Kundenliste |
| `fetchDocument` | `GET /api/documents/:id` | Dokument-Details |
| `fetchGrowthCampaigns` | `GET /api/marketing/campaigns?limit=10` | Kampagnen-Liste |

### Next.js API Routes

#### `/api/inbox/[id]/route.ts`

- Lädt E-Mail-Details vom Orchestrator
- Konvertiert Memory-Items zu EmailData
- Fallback auf Mock-Daten

#### `/api/customers/route.ts`

- Gibt Kundenliste zurück
- Aktuell Mock-Daten (kann später durch Backend ersetzt werden)

#### `/api/messages/[threadId]/route.ts`

- Lädt Chat-Verlauf
- Platform-Parameter für WhatsApp/Telegram/etc.
- Aktuell Mock-Daten (kann später durch Backend ersetzt werden)

---

## 🔐 Authorization

### Token-Handling

Alle API-Calls in `contextDataService.ts` verwenden automatisch Authorization-Header:

```typescript
function getAuthToken(): string | null {
  // 1. Check localStorage
  const stored = localStorage.getItem('auth_token')
  if (stored) return stored
  
  // 2. Check environment variable
  const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN
  if (envToken) return envToken
  
  return null
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // ... fetch logic
}
```

### Environment-Variablen

In `backend.env` müssen folgende Variablen gesetzt sein:

```bash
# Orchestrator API Configuration
ORCHESTRATOR_API_URL=http://localhost:4000
ORCHESTRATOR_TENANT_ID=aklow-main
ORCHESTRATOR_API_TOKEN=dev-aklow-secret-123

# Agent Backend URL
AGENT_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 🎨 Styling & Design

### FAB-Design

- **Position**: Fixed, bottom-right (24px vom Rand, 96px vom Boden)
- **Größe**: 56px × 56px
- **Farben**: Gradient (indigo → purple → pink)
- **Animation**: Pulse wenn Kontext aktiv, Scale-Animation beim Öffnen
- **Z-Index**: 50 (über allem)

### Card-Design

- **Border-Radius**: 16px (rounded-2xl)
- **Shadow**: `shadow-lg`
- **Max-Width**: 2xl (672px) für Email/Chat, 3xl (768px) für Tabellen
- **Spacing**: Padding 16px (p-4)

### Overlay-Design

- **Backdrop**: `bg-black/40 backdrop-blur-sm`
- **Panel**: `rounded-3xl shadow-2xl`
- **Max-Width**: 800px (Desktop), full-width (Mobile)
- **Animation**: Spring-Animation (damping: 25, stiffness: 300)

---

## 🧪 Testing

### Smoke Tests

Alle Komponenten wurden getestet:

- ✅ Dateien existieren
- ✅ Imports korrekt
- ✅ TypeScript kompiliert
- ✅ Linter-Fehler: Keine
- ✅ Events verdrahtet
- ✅ Authorization implementiert

### Manuelle Tests

1. **E-Mail öffnen**: Klick auf E-Mail in Sidebar → EmailCard erscheint im Chat
2. **FAB öffnen**: FAB zeigt Aktionen → Klick auf Aktion → Chat-Input wird befüllt
3. **Dashboard öffnen**: Info-Button in Sidebar → Dashboard-Overlay öffnet
4. **Context schließen**: ESC-Taste → Context Card schließt

---

## 📝 Migration Guide

### Von alten Drawern zu Chat First

**Vorher**:
```typescript
// Rechter Drawer öffnen
setRightPanelState('detail')
setSelectedInboxItem(item)
```

**Nachher**:
```typescript
// Context Card im Chat zeigen
window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
  detail: { type: 'inbox', item, id: threadId }
}))
```

### Von Wizard zu FAB

**Vorher**:
```typescript
// Wizard öffnen
window.dispatchEvent(new CustomEvent('aklow-ai-action-wizard', {
  detail: { context, action }
}))
```

**Nachher**:
```typescript
// Chat-Input befüllen
window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
  detail: { prompt: action.prompt, context: 'inbox' }
}))
```

---

## 🐛 Bekannte Issues & TODOs

### Mock-Daten

- `/api/customers` verwendet aktuell Mock-Daten
- `/api/messages/[threadId]` verwendet aktuell Mock-Daten
- Diese können später durch echte Backend-Calls ersetzt werden

### Backend-Endpoints

Folgende Backend-Endpoints sollten noch erstellt werden:
- `GET /customers` - Echte Kundenliste
- `GET /messages/:threadId` - Echter Chat-Verlauf

### Performance

- Context Cards werden bei jedem Kontext-Wechsel neu geladen
- Könnte mit React Query oder SWR optimiert werden

---

## 📚 Weitere Ressourcen

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Frontend-Architektur
- [FEATURES.md](./FEATURES.md) - Feature-Übersicht
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design-System

---

## 🎯 Zusammenfassung

Das Chat First Redesign stellt den Chat in den Mittelpunkt und entfernt die komplexen rechten Drawer. Alle Inhalte werden als Rich Content Cards direkt im Chat gerendert, was eine konsistentere und schnellere UX bietet.

**Vorteile**:
- ✅ Schnellerer Workflow (kein Drawer-Öffnen nötig)
- ✅ Konsistente UX (alles im Chat)
- ✅ Weniger UI-Elemente (weniger Buttons, kein Wizard)
- ✅ Mobile-freundlicher (keine Drawer auf kleinen Screens)

**Status**: ✅ Vollständig implementiert und getestet

