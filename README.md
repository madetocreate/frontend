# Frontend - AKLOW Chat Interface

Modern Next.js-based chat interface with real-time streaming, OpenAI Realtime Voice, and a "Quiet Power" design system.

## 🚀 Quick Start

**WICHTIG**: Nutze `pnpm` statt `npm`, um Authentifizierungs- und Abhängigkeitsprobleme zu vermeiden.

### Voraussetzungen
- Node.js >= 20.9.0 (Next 16 Empfehlung)
- pnpm >= 9.0.0

### Installation

```bash
# Gehe in das Frontend-Verzeichnis
cd /Users/simple-gpt/frontend

# Installiere Abhängigkeiten
pnpm install
```

### Development

```bash
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## 📁 Projektstruktur & Navigation

Dieses Projekt ist Teil eines Multi-Repo-Setups. Die Verzeichnisse `frontend`, `Backend` und `landingpage` sind **Geschwister** (Siblings).

- `/Users/simple-gpt/frontend`
- `/Users/simple-gpt/Backend`
- `/Users/simple-gpt/landingpage`

Stelle immer sicher, dass du dich im richtigen Verzeichnis befindest, bevor du Befehle ausführst.

## ⚠️ Beta Features

**Marketing** ist aktuell ein Beta-Feature und standardmäßig deaktiviert. Siehe [BETA_FEATURES.md](./docs/BETA_FEATURES.md) für Details zur Aktivierung.

## 📚 Documentation

**WICHTIG**: Root ist nur "Lobby". Alle weitere Dokumentation gehört nach `/docs`.

- **[Dokumentations-Index](./docs/README.md)** - Vollständiger Überblick über alle Dokumentationen
- **[Setup & Installation](./docs/README.md#-setup--installation)** - Setup-Anleitungen
- **[Architecture](./docs/README.md#-architecture)** - System-Architektur
- **[Product Features](./docs/README.md#-product--features)** - Feature-Dokumentation
- **[UI & Design](./docs/README.md#-ui--design)** - UI/Design Dokumentation

### Dokumentations-Regeln

- **Root-Dateien**: Nur `README.md`, `LICENSE`, `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md` sind erlaubt
- **Alle anderen Markdown-Dokumente** gehören in `/docs` in die passenden Unterordner:
  - Setup → `docs/setup/`
  - Architektur → `docs/architecture/`
  - Operations → `docs/ops/`
  - Security → `docs/security/`
  - Product Features → `docs/product/`
  - UI/Design → `docs/ui/`
  - Reports → `docs/reports/`
- **Ausnahme**: Subsystem-READMEs bleiben beim Code (z.B. `apps/*/README.md`, `src/*/README.md`)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes (TTS proxy, Realtime session)
│   │   ├── ak-tokens.css # Design Tokens ("Quiet Power")
│   │   └── globals.css   # Global styles & Tailwind
│   ├── components/       # React components
│   │   ├── chat/         # Chat-related components (Composer, Shell)
│   │   │   ├── markdown/ # Markdown rendering with custom badges
│   │   ├── CustomersSidebarWidget.tsx # Customer module
│   │   ├── DocumentsSidebarWidget.tsx # Documents module
│   │   ├── GrowthSidebarWidget.tsx    # Growth module
│   │   ├── InboxDrawerWidget.tsx      # Inbox module
│   │   ├── *DetailsDrawer.tsx         # Right-side detail drawers
│   │   └── ui/           # UI primitives
│   │       ├── AISuggestionGrid.tsx   # AI Suggestion System
│   │       └── ...
│   ├── hooks/            # Custom React hooks
│   │   ├── useRealtimeVoice.ts  # OpenAI Realtime integration
│   │   ├── useSpeechSynthesis.ts # TTS streaming
│   │   └── useKeyboardShortcuts.ts # Global shortcuts
│   └── lib/              # Utilities and clients
│       ├── fastActionsClient.ts  # Fast Actions API Client
│       └── actionHandlers.ts    # Action Dispatcher System
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # Frontend Architecture
│   └── AI_SUGGESTION_SYSTEM.md  # AI Suggestion System Docs
│       └── realtimeVoiceClient.ts # WebSocket client for OpenAI Realtime
```

## 🎨 Features & Design

### "Quiet Power" Design System
AKLOW follows an Apple-inspired "Quiet Power" design philosophy:
- **Tokens**: Centralized in `ak-tokens.css` (Surfaces, Spacing, Typography).
- **Layout**: Fixed 320px left drawer, pixel-perfect alignment.
- **Glassmorphism**: Used sparingly for transient UI (drawers, headers).
- **Typography**: Clean, hierarchical fonts with `ak-caption`, `ak-body`, `ak-heading` classes.

### Core Modules (Sidebar)
1. **Chat**: Main interface with streaming responses and rich markdown.
2. **Posteingang (Inbox)**: Unified inbox for Email, Messenger, Support.
3. **Dokumente (Documents)**: Document management with preview and categorization.
4. **Kunden (Customers)**: CRM view with segments (Leads, Active, VIP).
5. **Wachstum (Growth)**: Marketing & Campaign management.

### Voice & Audio
- **Real-time Voice**: Direct integration with OpenAI Realtime API (WebSockets).
- **Visualizations**: Dynamic audio waves in composer (real microphone data + fallback animation).
- **TTS**: High-quality streaming text-to-speech (OpenAI `nova` voice).
- **Dictation**: Integrated Whisper-based dictation.

### UX Enhancements
- **Right Drawer System**: Detail views slide in from the right, toggled via info buttons.
- **Keyboard Shortcuts**: Global shortcuts for navigation and actions (`Cmd+K`, `Cmd+Enter`, etc.).
- **Smart Actions**: Context-aware tooltips and quick actions (Copy, Edit, Save, Update).

## 🔧 API Integration

### Key Endpoints
- `/api/memory/*` - Memory operations (save, search, archive, delete)
- `/api/inbox` - Inbox items
- `/api/audio/transcribe` - Audio transcription (Whisper-1)
- `/api/audio/tts` - Text-to-Speech streaming
- `/api/realtime/session` - Ephemeral session generation for OpenAI Realtime


## 🚩 Feature Flags

- See `docs/FEATURE_FLAGS.md` (UI gating for Gastro; default-off).

## 📚 Documentation

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Complete setup guide
- [API_INTEGRATION_SUMMARY.md](./API_INTEGRATION_SUMMARY.md) - API documentation
- [ENV_STATUS.md](./ENV_STATUS.md) - Environment variable status

## 🛠️ Development

### Build

```bash
npm run build
```

**Hinweis zu Next 16**: Da `next.config.ts` Webpack-spezifische Optimierungen (splitChunks) enthält, wird der Build explizit mit `--webpack` ausgeführt, um Stabilität und Performance-Patterns beizubehalten.

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

## 📝 License

See LICENSE file for details.
