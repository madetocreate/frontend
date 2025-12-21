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

#### Component Hierarchy
```
ChatWorkspaceShell
├── Sidebar (64px, Icons)
├── Left Drawer (320px, Widgets)
│   ├── Header (Titel, Info-Button, Collapse)
│   └── Widget Content
├── Main Content (Chat)
└── Right Drawer (Details)
    ├── Glass Header
    └── Detail Content
```

## Core Components

### ChatWorkspaceShell
Haupt-Layout-Komponente, verwaltet:
- Module-Navigation (Chat, Posteingang, Dokumente, Kunden, Wachstum)
- Drawer-State (Left/Right)
- Selected Items für Detail-Drawers

### ChatShell
Chat-Interface mit:
- Message-Streaming (SSE)
- Voice Input (Dictation & Real-time)
- TTS (Text-to-Speech)
- Message-Actions (Copy, Edit, Save, Update, Read Aloud)

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

### Detail Drawers (Right Side)

#### InboxDetailsDrawer
- Thread-Details (Status, Wichtig, Zugewiesen, Tags)
- Verknüpfungen (Kunde, Projekt)
- Quelle & Sync-Info
- Erweiterte Einstellungen

#### CustomerDetailsDrawer
- Kunden-Profil-Formular
- Verknüpfte Kanäle
- Datenschutz-Optionen
- Erweiterte Einstellungen

#### DocumentDetailsDrawer
- Dokument-Übersicht (Typ, Status, Quelle, Datum)
- Zuweisung (Kunde, Tags)
- Metadaten
- Erweiterte Info

#### GrowthDetailsDrawer
- Kampagnen-Übersicht (Status, Ziel, Zielgruppe, Kanäle)
- Planung (Datum, Zeit, Freigabe)
- Assets
- Verknüpfungen
- Erweiterte Einstellungen

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
  - `aklow-focus-thread`: Fokussiere Thread im Chat
  - `aklow-open-module`: Öffne Modul von außen
  - `ak-escape-pressed`: Global Escape-Handler

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
│   ├── *DetailsDrawer.tsx     # Right Drawers
│   └── chat/                  # Chat Components
│       ├── markdown/          # Markdown Rendering
│       └── ...
├── hooks/
│   ├── useRealtimeVoice.ts
│   ├── useSpeechSynthesis.ts
│   └── useKeyboardShortcuts.ts
└── lib/
    ├── chatClient.ts          # Chat API Client
    └── realtimeVoiceClient.ts # Realtime WebSocket Client
```

