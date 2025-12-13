# Frontend - AKLOW Chat Interface

Modern Next.js-based chat interface with real-time streaming, voice support, and comprehensive workspace management.

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
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API Routes (proxy to backend)
│   │   ├── chat/        # Chat page
│   │   └── memory/      # Memory page
│   ├── components/      # React components
│   │   ├── chat/        # Chat-related components
│   │   ├── calendar/    # Calendar widgets
│   │   └── ui/          # UI primitives
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and clients
├── app/                  # Legacy App Router (migration in progress)
└── public/              # Static assets
```

## 🎨 Features

### Core Features
- ✅ Real-time chat streaming
- ✅ Voice input (dictation & real-time)
- ✅ Text-to-speech (TTS)
- ✅ Memory management
- ✅ Inbox integration
- ✅ Calendar integration
- ✅ News feed
- ✅ Multi-module workspace

### UI Components
- **ChatWorkspaceShell**: Main workspace layout with sidebar
- **ChatShell**: Chat interface with message handling
- **ChatSidebarContent**: Chat thread management
- **MemorySidebarWidget**: Memory category browser
- **InboxDrawerWidget**: Inbox item list
- **CalendarSidebarWidget**: Calendar event browser

### Design System
- Apple-style design tokens
- Dark/Light mode support (via CSS variables)
- Micro-interactions on buttons
- Responsive layout
- Glassmorphism effects

## 🔧 API Integration

See [API_INTEGRATION_SUMMARY.md](./API_INTEGRATION_SUMMARY.md) for detailed API documentation.

### Key Endpoints
- `/api/memory/*` - Memory operations (save, search, archive, delete)
- `/api/inbox` - Inbox items
- `/api/audio/transcribe` - Audio transcription
- `/api/realtime/*` - Real-time analysis and research

## 🎯 Recent Updates

### Design System
- Apple-style design tokens implemented
- Green accent colors for buttons and counters
- Blue accent for "AI Modernisierung" button
- Two-tone green logo
- Micro-interactions on all interactive elements

### Hero Section
- Removed avatars/logos
- Removed decorative lines
- Increased spacing
- Title split into two lines: "Den Kopf frei." / "Der Rest in AKLOW."

### Audio Transcription
- Automatic format detection (webm, mp4, wav)
- Improved error handling
- Minimum file size validation

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

## 🐛 Troubleshooting

See [GETTING_STARTED.md](./GETTING_STARTED.md#troubleshooting) for common issues.

Common issues:
- Environment variables not loading → Restart Next.js dev server
- Memory API 401/403 → Check `MEMORY_API_SECRET` matches backend
- Audio transcription fails → Check audio format support

## 📝 License

See LICENSE file for details.

