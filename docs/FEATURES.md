# Frontend Features

## Voice & Audio

### Real-Time Voice Conversations
- **OpenAI Realtime API**: Direkte Browser-zu-OpenAI Verbindung
- **Ephemeral Sessions**: Backend generiert temporäre Session-Tokens
- **WebRTC (empfohlen)**: Niedrige Latenz/Jitter, Audio läuft direkt Browser↔OpenAI (Hot-Pass)
- **WebSocket (Fallback)**: Als Fallback möglich
- **Audio Format**: PCM16 für Input/Output
- **Voice**: `nova` (hochwertige OpenAI-Stimme)
- **Transcription**: Whisper-1 für Live-Transkription

**UX (PTT Pflicht)**:
- Press/Hold: sprechen
- Release: Turn committen → Assistant antwortet (Audio + Text)
- Barge-in: während Assistant spricht erneut drücken → `response.cancel`

**UI-Indikatoren**:
- Roter Hintergrund im Composer
- "Real time on" Tooltip
- Audio-Wellen-Visualisierung

**Tools im Realtime-Modus**:
- Tool-Calls können während eines Voice-Turns ausgelöst werden; Ausführung serverseitig (Registry) über `/realtime/tools/:tool`.

### Text-to-Speech (TTS)
- **OpenAI TTS API**: Streaming TTS (Model serverseitig über Policy, Default: `gpt-4o-mini-tts`)
- **Voice**: `nova` (Standard)
- **Streaming**: Audio wird sofort abgespielt (64KB Buffer)
- **Integration**: Button in Assistant-Messages ("Read Aloud")

### Dictation
- **Whisper-1**: Audio-zu-Text Transkription
- **Format-Support**: webm, mp4, wav
- **Real-time**: Während des Sprechens

## Workspace Modules

### Chat (Chat First Design)
- Streaming Responses (SSE)
- Rich Markdown Rendering
- Message Actions (Copy, Edit, Save, Update, Read Aloud)
- Thinking Steps Visualization
- Quick Actions Suggestions
- **Rich Content Cards**: E-Mails, Chats, Tabellen werden direkt im Chat gerendert
- **Floating Action Button (FAB)**: Kontextbezogene Aktionen
- **ContextCardRenderer**: Rendert interaktive Cards basierend auf aktivem Kontext

Siehe [CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md) für vollständige Details.

### Posteingang (Inbox)
- **Channels**: Email, Messenger, Support, Reviews
- **Filter**: Alle, E-Mail, Messenger, Support
- **Quick Actions**: Antworten, Zusammenfassen, Aufräumen
- **Thread-Liste**: Mit unread-Indicators und Badges
- **Rich Content**: E-Mails werden als EmailCard im Chat angezeigt (Chat First)

### Dokumente (Documents)
- **Filter**: Alle, Rechnungen, Verträge, Fotos, Sonstiges
- **Quick Actions**: Belege auslesen, Sortieren, Fragen
- **Document-Liste**: Mit Typ-Icons und Metadaten
- **Rich Content**: Dokumente werden als EmailCard im Chat angezeigt (Chat First)

### Kunden (Customers)
- **Segments**: Alle, Leads, Aktiv, Schläft, VIP
- **Quick Actions**: Datei erstellen, Suchen, Notiz
- **Customer-Cards**: Mit Tags und Initials
- **Rich Content**: Kundenlisten werden als DataTableCard im Chat angezeigt (Chat First)

### Wachstum (Growth)
- **Status-Filter**: Entwürfe, Geplant, Ergebnisse
- **Action-Buttons**: Kampagne starten, Social Post, Newsletter
- **Item-Liste**: Mit Status-Badges und Kanälen
- **Rich Content**: Kampagnen werden als DataTableCard im Chat angezeigt (Chat First)

## Message Actions

### User Messages
- **Copy**: Kopiere Nachricht in Zwischenablage
- **Edit**: Inline-Editierung, sendet bearbeitete Nachricht zurück

### Assistant Messages
- **Copy**: Kopiere Nachricht in Zwischenablage
- **Save**: Speichere in Memory (mit "Gespeichert" Tooltip)
- **Update**: Lade Nachricht neu (triggert Regeneration)
- **Read Aloud**: TTS-Streaming
- **Quick Actions**: Schnellaktionen (Stern-Icon)

## Design Features

### "Quiet Power" Design System
- **4 Surface Levels**: Background, Panels, Interactive, Glass
- **4pt Grid**: Konsistente Abstände
- **Glassmorphism**: Nur für transient UI
- **Micro-Interactions**: Subtile Hover-Effekte (1-2px lift, 160-220ms)

### Responsive Layout
- **Left Drawer**: 280px (optional, nicht responsive)
- **Chat**: Volle Breite (Chat First - keine rechten Drawer)
- **Pixel-Perfect**: Keine Prozent-Werte für kritische Layouts
- **Apple-Style**: Ruhige, hochwertige Optik
- **Dashboard Overlay**: Modal für Übersichten (statt Drawer)

## Keyboard Shortcuts

### Global
- `Cmd/Ctrl + K`: Command Palette
- `Cmd/Ctrl + N`: Neue Nachricht
- `Escape`: Schließe Modals/Menus

### Chat
- `Cmd/Ctrl + Enter`: Nachricht senden
- `Cmd/Ctrl + Shift + R`: Real-time Voice toggle
- `Cmd/Ctrl + Shift + D`: Dictation toggle
- `Cmd/Ctrl + Shift + S`: Save last assistant message
- `Cmd/Ctrl + Shift + U`: Update last assistant message
- `Cmd/Ctrl + Shift + L`: Read aloud last assistant message
- `Cmd/Ctrl + Shift + C`: Copy last assistant message
- `Cmd/Ctrl + Shift + E`: Edit last user message

