# Frontend Architecture

## Overview

AKLOW Frontend ist eine Next.js 16 App mit einem "Quiet Power" Design System, das auf Apple-Design-Prinzipien basiert.

## Design System: "Calm Glass"

### Design Tokens (`src/app/ak-tokens.css`)

Das Design-System ist zentral in `ak-tokens.css` definiert:

#### Surface Levels (4 Ebenen)
- **Surface 0**: Hintergrund (`--ak-surface-0`)
- **Surface 1**: Panels (Sidebar, Chat-Canvas, Drawer-Body)
- **Surface 2**: Interactive Containers (Hover-States, Selected)
- **Surface 3**: Glass (nur für transient UI: Drawer-Header, Popovers)

#### Spacing (4pt Grid)
- `--ak-space-1` bis `--ak-space-16` (4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px)

#### Typography
- Font Sizes: `xs` (11px), `sm` (13px), `base` (15px), `lg` (17px), `xl` (20px), `2xl` (24px)
- Line Heights: `tight` (1.3), `normal` (1.45), `relaxed` (1.6)
- Utility Classes: `ak-caption`, `ak-body`, `ak-heading`

#### Colors
- Accent Colors pro Modul: `--ak-accent-inbox`, `--ak-accent-customers`, `--ak-accent-docs`, `--ak-accent-growth`
- Semantic: `--ak-semantic-success`, `--ak-semantic-warn`, `--ak-semantic-danger`

### Layout System

#### Fixed Drawer Width
- **Left Drawer**: 320px (pixel-perfect, nicht responsive)
- **Right Drawer**: Füllt verfügbaren Raum
- **Icon Rail**: 64px (Sidebar mit Modul-Icons)

#### Component Hierarchy (Chat First Design)
```
ChatWorkspaceShell
├── Sidebar (64px, Icons)
├── Left Drawer (280px, optional, Widgets)
│   ├── Header (Titel, Info-Button → Dashboard Overlay)
│   └── Widget Content
├── Main Content (Chat - volle Breite)
│   ├── ChatShell
│   │   ├── ContextCardRenderer (Rich Content Cards)
│   │   └── Chat Messages
│   └── ChatFirstFAB (Floating Action Button)
└── DashboardOverlay (Modal, bei Info-Button)
```

**Wichtig**: Rechte Drawer wurden komplett entfernt. Alle Inhalte werden als Rich Content Cards direkt im Chat gerendert. Siehe [CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md) für Details.

## Core Components

### ChatWorkspaceShell
Haupt-Layout-Komponente, verwaltet:
- Module-Navigation (Chat, Posteingang, Dokumente, Kunden, Wachstum)
- Left Drawer State (optional, 280px)
- Context State für Rich Content Cards
- Dashboard Overlay State
- **Chat First**: Keine rechten Drawer mehr, alles wird im Chat gerendert

### ChatShell
Chat-Interface mit:
- Message-Streaming (SSE)
- Voice Input (Dictation & Real-time)
- TTS (Text-to-Speech)
- Message-Actions (Copy, Edit, Save, Update, Read Aloud)
- **ContextCardRenderer**: Rendert Rich Content Cards (E-Mails, Chats, Tabellen) direkt im Chat
- **Event-Listener**: `aklow-prefill-chat` für Input-Befüllung

### Sidebar Widgets

#### InboxDrawerWidget
- Unified Inbox für Email, Messenger, Support, Reviews
- Channel-Filter (Alle, E-Mail, Messenger, Support)
- Quick Actions (Antworten, Zusammenfassen, Aufräumen)
- Thread-Liste mit unread-Indicators

#### CustomersSidebarWidget
- Kunden-Liste mit Segment-Filter (Alle, Leads, Aktiv, Schläft, VIP)
- Quick Actions (Datei erstellen, Suchen, Notiz)
- Customer-Cards mit Tags

#### DocumentsSidebarWidget
- Dokument-Liste mit Typ-Filter (Alle, Rechnungen, Verträge, Fotos, Sonstiges)
- Quick Actions (Belege auslesen, Sortieren, Fragen)
- Dokument-Preview

#### GrowthSidebarWidget
- Wachstum-Items (Kampagnen, Posts, Newsletter)
- Status-Filter (Entwürfe, Geplant, Ergebnisse)
- Action-Buttons (Kampagne starten, Social Post, Newsletter)

### Rich Content Cards (Chat First)

**Hinweis**: Rechte Drawer wurden entfernt. Alle Inhalte werden als interaktive Cards direkt im Chat gerendert.

#### EmailCard
- E-Mail-Details (Von, An, Betreff, Datum)
- Expandierbar (kollabiert/expandiert)
- Attachments-Anzeige
- Actions (Antworten, etc.)

#### ChatThreadCard
- Chat-Verläufe (WhatsApp, Telegram, SMS, etc.)
- Platform-spezifisches Styling
- Chat-Bubbles (incoming/outgoing)
- Status-Indikatoren

#### DataTableCard
- Tabellen (Kunden, Kampagnen, etc.)
- Sortierbar, filterbar
- Status-Badges
- Row-Click-Handler

#### DashboardOverlay
- Modal für Übersichten (statt Drawer)
- Statistiken-Grid
- Letzte Aktivitäten
- Öffnet über Info-Button in Sidebar

Siehe [CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md) für vollständige Details.

## Voice & Audio Features

### Real-Time Voice (PTT, WebRTC) (`realtimeVoiceClient.ts`, `usePushToTalkVoice.ts`)
- **WebRTC (empfohlen)**: Audio läuft direkt Browser↔OpenAI (Hot-Pass) für niedrigste Latenz/Jitter.
- **Ephemeral Sessions**: Python backend-agents generiert `client_secret` + `model` (`POST /realtime/session`).
- **PTT Pflicht**: Press/Hold/Release + Barge-in (`response.cancel`).
- **Conversation Parity**: User-Transcript + Assistant-Text werden als Messages in denselben Thread geschrieben (ChatShell).
- **Tool Calls**: Realtime Function-Calls werden über `/api/realtime/tools` → Backend `/realtime/tools/:tool` ausgeführt (zod-validierte Registry).

### Text-to-Speech (`useSpeechSynthesis.ts`)
- **OpenAI TTS API**: Streaming TTS (Model serverseitig via Policy, Default: `gpt-4o-mini-tts`)
- **Voice**: `nova` (hochwertige Stimme)
- **Streaming**: Audio wird gestreamt und sofort abgespielt (64KB Buffer)

### Dictation (`useDictation.ts`)
- **Whisper-1**: Audio-zu-Text Transkription
- **Format-Support**: webm, mp4, wav
- **Real-time**: Während des Sprechens

## Keyboard Shortcuts

### Global (`KeyboardShortcutsProvider`)
- `Cmd/Ctrl + K`: Command Palette
- `Cmd/Ctrl + N`: Neue Nachricht
- `Escape`: Schließe Modals/Menus

### Chat-Specific (`ChatShell`)
- `Cmd/Ctrl + Enter`: Nachricht senden
- `Cmd/Ctrl + Shift + R`: Real-time Voice toggle
- `Cmd/Ctrl + Shift + D`: Dictation toggle
- `Cmd/Ctrl + Shift + S`: Save last assistant message
- `Cmd/Ctrl + Shift + U`: Update last assistant message
- `Cmd/Ctrl + Shift + L`: Read aloud last assistant message
- `Cmd/Ctrl + Shift + C`: Copy last assistant message
- `Cmd/Ctrl + Shift + E`: Edit last user message

## API Integration

### Frontend API Routes (`src/app/api/`)
- `/api/memory/*`: Memory-Operationen (Proxy zu Backend)
- `/api/inbox`: Inbox-Items
- `/api/audio/transcribe`: Audio-Transkription (Proxy zu Backend)
- `/api/audio/tts`: TTS-Streaming (Proxy zu Backend)
- `/api/realtime/*`: Realtime-Tools (Analysis, Research, Tools Bridge)

### Backend Communication
- **Orchestrator**: `ORCHESTRATOR_API_URL` (Port 4000)
- **Python Backend**: `AGENT_BACKEND_URL` (Port 8000)
- **Memory API**: Authentifizierung via `MEMORY_API_SECRET`

## State Management

### React Hooks
- `useState`: Lokaler Component-State
- `useEffect`: Side-Effects (API-Calls, Event-Listeners)
- `useRef`: DOM-Referenzen, Timeouts
- Custom Hooks: `useRealtimeVoice`, `useSpeechSynthesis`, `useKeyboardShortcuts`

### Event System
- Custom Events für Inter-Component-Kommunikation:
  - `aklow-show-context-card`: Zeigt Rich Content Card im Chat (Chat First)
  - `aklow-prefill-chat`: Befüllt Chat-Input mit Text (Chat First)
  - `aklow-clear-context`: Schließt aktuelle Context Card (Chat First)
  - `aklow-focus-thread`: Fokussiere Thread im Chat
  - `aklow-open-module`: Öffne Modul von außen
  - `ak-escape-pressed`: Global Escape-Handler
  - ~~`aklow-ai-action-wizard`~~: **Entfernt** (ersetzt durch FAB + prefill-chat)

### AI Suggestion System
- **AISuggestionGrid**: Kontextsensitive KI-Vorschläge für Detail-Drawer
- **FastActionAgent Integration**: Backend-API für intelligente Aktionen
- **Action-Handling**: Zentrale Dispatcher für alle Aktionen
- Siehe [AI_SUGGESTION_SYSTEM.md](./AI_SUGGESTION_SYSTEM.md) für Details

## File Structure

```
src/
├── app/
│   ├── ak-tokens.css          # Design Tokens
│   ├── globals.css            # Global Styles & Tailwind
│   ├── api/                   # Next.js API Routes
│   └── layout.tsx             # Root Layout
├── components/
│   ├── ChatWorkspaceShell.tsx # Main Layout
│   ├── ChatShell.tsx          # Chat Interface
│   ├── *SidebarWidget.tsx     # Sidebar Widgets
│   ├── dashboard/
│   │   └── DashboardOverlay.tsx # Dashboard Modal (Chat First)
│   └── chat/                  # Chat Components
│       ├── ChatFirstFAB.tsx   # Floating Action Button (Chat First)
│       ├── cards/              # Rich Content Cards (Chat First)
│       │   ├── EmailCard.tsx
│       │   ├── ChatThreadCard.tsx
│       │   ├── DataTableCard.tsx
│       │   └── ContextCardRenderer.tsx
│       └── markdown/          # Markdown Rendering
├── hooks/
│   ├── useRealtimeVoice.ts
│   ├── useSpeechSynthesis.ts
│   └── useKeyboardShortcuts.ts
└── lib/
    ├── chatClient.ts          # Chat API Client
    ├── realtimeVoiceClient.ts # Realtime WebSocket Client
    ├── fastActionsClient.ts   # Fast Actions API Client
    ├── actionHandlers.ts     # Action Dispatcher System
    └── contextDataService.ts  # Context Data API (Chat First)
```

