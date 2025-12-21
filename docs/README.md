# Frontend Documentation

Willkommen zur Frontend-Dokumentation des AKLOW Frontend.

## 📚 Dokumentationsübersicht

### Architektur & Design

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Vollständige Architektur-Dokumentation
  - Design System ("Calm Glass")
  - Component-Hierarchie
  - State Management
  - API Integration
  - Event System

### Feature-Dokumentation

- **[CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md)** - Chat First Redesign ⭐ NEU
  - Chat-zentrierte UX
  - Rich Content Cards (E-Mails, Chats, Tabellen)
  - Floating Action Button (FAB)
  - Dashboard Overlay
  - Event-System
  - API-Integration

- **[AI_SUGGESTION_SYSTEM.md](./AI_SUGGESTION_SYSTEM.md)** - AI Suggestion System
  - Kontextsensitive KI-Vorschläge
  - FastActionAgent Integration
  - Action-Handling
  - Integration in Detail-Drawer
  - Fallback-Mechanismus

### Hauptdokumentation

- **[../COMPLETE_DOCUMENTATION.md](../COMPLETE_DOCUMENTATION.md)** - Vollständige Feature-Übersicht
- **[../README.md](../README.md)** - Projekt-Übersicht und Quick Start

## 🚀 Quick Links

### Für Entwickler

1. **Neue Komponente erstellen?**
   - Siehe [ARCHITECTURE.md](./ARCHITECTURE.md) → Core Components
   - Design Tokens: `src/app/ak-tokens.css`

2. **AI-Vorschläge integrieren?**
   - Siehe [AI_SUGGESTION_SYSTEM.md](./AI_SUGGESTION_SYSTEM.md) → Integration in Detail-Drawer
   - Beispiel: `AISuggestionGrid` Component

3. **Action-Handling implementieren?**
   - Siehe [AI_SUGGESTION_SYSTEM.md](./AI_SUGGESTION_SYSTEM.md) → Action-Handling
   - Datei: `src/lib/actionHandlers.ts`

### Für Designer

1. **Design Tokens verstehen?**
   - Siehe [ARCHITECTURE.md](./ARCHITECTURE.md) → Design System
   - Datei: `src/app/ak-tokens.css`

2. **Component-Styling?**
   - Siehe [ARCHITECTURE.md](./ARCHITECTURE.md) → Layout System
   - Tailwind CSS + Design Tokens

## 📖 Dokumentations-Struktur

```
frontend/
├── docs/
│   ├── README.md                  # Diese Datei
│   ├── ARCHITECTURE.md            # Architektur & Design System
│   ├── CHAT_FIRST_REDESIGN.md     # Chat First Redesign ⭐ NEU
│   └── AI_SUGGESTION_SYSTEM.md    # AI Suggestion System
├── COMPLETE_DOCUMENTATION.md      # Feature-Übersicht
└── README.md                      # Projekt-Übersicht
```

## 🔍 Suche nach Themen

### Design & Styling
- Design Tokens → [ARCHITECTURE.md](./ARCHITECTURE.md) → Design System
- Layout System → [ARCHITECTURE.md](./ARCHITECTURE.md) → Layout System
- Component Styling → [ARCHITECTURE.md](./ARCHITECTURE.md) → Core Components

### Features
- Chat First Design → [CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md) ⭐ NEU
- Chat System → [ARCHITECTURE.md](./ARCHITECTURE.md) → ChatShell
- Rich Content Cards → [CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md) → Rich Content Cards
- Floating Action Button → [CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md) → ChatFirstFAB
- AI Suggestions → [AI_SUGGESTION_SYSTEM.md](./AI_SUGGESTION_SYSTEM.md)
- Voice Features → [ARCHITECTURE.md](./ARCHITECTURE.md) → Voice & Audio Features
- Keyboard Shortcuts → [ARCHITECTURE.md](./ARCHITECTURE.md) → Keyboard Shortcuts

### API & Integration
- API Routes → [ARCHITECTURE.md](./ARCHITECTURE.md) → API Integration
- Fast Actions API → [AI_SUGGESTION_SYSTEM.md](./AI_SUGGESTION_SYSTEM.md) → Backend-Integration
- Action Handlers → [AI_SUGGESTION_SYSTEM.md](./AI_SUGGESTION_SYSTEM.md) → Action-Handling

## 🤝 Beitragen

Wenn du die Dokumentation verbessern möchtest:

1. **Klarheit**: Schreibe klar und präzise
2. **Beispiele**: Füge Code-Beispiele hinzu
3. **Aktualität**: Halte die Dokumentation aktuell
4. **Struktur**: Folge der bestehenden Struktur

## 📝 Changelog

### 2024-12-20
- ✅ **Chat First Redesign** vollständig dokumentiert
  - Neue Dokumentation: [CHAT_FIRST_REDESIGN.md](./CHAT_FIRST_REDESIGN.md)
  - ARCHITECTURE.md aktualisiert (rechte Drawer entfernt)
  - FEATURES.md aktualisiert (Rich Content Cards)
- ✅ AI Suggestion System Dokumentation hinzugefügt
- ✅ Architektur-Dokumentation erweitert
- ✅ Integration in Detail-Drawer dokumentiert

## 🔗 Externe Ressourcen

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

