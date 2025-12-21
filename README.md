# Frontend - AKLOW Chat Interface

Modern Next.js-based chat interface with real-time streaming, OpenAI Realtime Voice, and a "Quiet Power" design system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

See [GETTING_STARTED.md](./GETTING_STARTED.md) for complete setup instructions.

Required environment variables (`.env.local`):
```env
ORCHESTRATOR_API_URL=http://localhost:4000
ORCHESTRATOR_TENANT_ID=demo
AGENT_BACKEND_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=your-secret-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
OPENAI_API_KEY=sk-... (optional, handled by backend proxy)
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- [Complete Documentation](./COMPLETE_DOCUMENTATION.md) - Full feature overview
- [Architecture](./docs/ARCHITECTURE.md) - System architecture and design patterns
- [AI Suggestion System](./docs/AI_SUGGESTION_SYSTEM.md) - AI-powered action suggestions
- [Getting Started](./GETTING_STARTED.md) - Setup and installation guide

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
