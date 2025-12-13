# Frontend Features

## Voice & Audio

### Real-Time Voice Conversations
- **OpenAI Realtime API**: Direkte Browser-zu-OpenAI Verbindung
- **Ephemeral Sessions**: Backend generiert temporäre Session-Tokens
- **WebSocket**: Direkte Verbindung ohne Backend-Proxy
- **Audio Format**: PCM16 für Input/Output
- **Voice**: `nova` (hochwertige OpenAI-Stimme)
- **Transcription**: Whisper-1 für Live-Transkription

**Aktivierung**: Mikrofon-Button 3 Sekunden gedrückt halten → Real-time Mode aktiviert

**UI-Indikatoren**:
- Roter Hintergrund im Composer
- "Real time on" Tooltip
- Audio-Wellen-Visualisierung

### Text-to-Speech (TTS)
- **OpenAI TTS API**: Streaming TTS mit `tts-1-hd`
- **Voice**: `nova` (Standard)
- **Streaming**: Audio wird sofort abgespielt (64KB Buffer)
- **Integration**: Button in Assistant-Messages ("Read Aloud")

### Dictation
- **Whisper-1**: Audio-zu-Text Transkription
- **Format-Support**: webm, mp4, wav
- **Real-time**: Während des Sprechens

## Workspace Modules

### Chat
- Streaming Responses (SSE)
- Rich Markdown Rendering
- Message Actions (Copy, Edit, Save, Update, Read Aloud)
- Thinking Steps Visualization
- Quick Actions Suggestions

### Posteingang (Inbox)
- **Channels**: Email, Messenger, Support, Reviews
- **Filter**: Alle, E-Mail, Messenger, Support
- **Quick Actions**: Antworten, Zusammenfassen, Aufräumen
- **Thread-Liste**: Mit unread-Indicators und Badges
- **Detail Drawer**: Thread-Details, Verknüpfungen, Sync-Info

### Dokumente (Documents)
- **Filter**: Alle, Rechnungen, Verträge, Fotos, Sonstiges
- **Quick Actions**: Belege auslesen, Sortieren, Fragen
- **Document-Liste**: Mit Typ-Icons und Metadaten
- **Detail Drawer**: Dokument-Übersicht, Zuweisung, Metadaten

### Kunden (Customers)
- **Segments**: Alle, Leads, Aktiv, Schläft, VIP
- **Quick Actions**: Datei erstellen, Suchen, Notiz
- **Customer-Cards**: Mit Tags und Initials
- **Detail Drawer**: Kunden-Profil, Verknüpfte Kanäle, Datenschutz

### Wachstum (Growth)
- **Status-Filter**: Entwürfe, Geplant, Ergebnisse
- **Action-Buttons**: Kampagne starten, Social Post, Newsletter
- **Item-Liste**: Mit Status-Badges und Kanälen
- **Detail Drawer**: Kampagnen-Übersicht, Planung, Assets

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
- **Fixed Drawer**: 320px (nicht responsive)
- **Pixel-Perfect**: Keine Prozent-Werte für kritische Layouts
- **Apple-Style**: Ruhige, hochwertige Optik

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

