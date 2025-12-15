# Frontend - Vollständige Dokumentation

## Übersicht

Das Frontend ist eine Next.js-basierte React-Anwendung für die AI Shield Plattform mit Chat-Interface, Dokumenten-Management, CRM-Integration, und mehr.

## 🏗️ Architektur

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React Hooks, Context API
- **API Client**: Fetch API, Next.js API Routes
- **Testing**: Playwright (E2E), Vitest (Unit)

### Struktur

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (Proxies)
│   │   └── (routes)/          # Pages
│   ├── components/             # React Components
│   │   ├── chat/               # Chat Components
│   │   ├── ui/                 # UI Components
│   │   └── ...                 # Feature Components
│   ├── lib/                    # Utilities
│   └── hooks/                  # Custom Hooks
├── public/                     # Static Assets
└── tests/                      # Tests
```

## 📋 Features

### ✅ Implementiert

#### Chat System
- ✅ Chat Interface mit Markdown-Rendering
- ✅ Message History
- ✅ Thinking Steps Visualization
- ✅ Fast Actions
- ✅ Feedback Buttons (Thumbs Up/Down)
- ✅ Realtime Updates

#### Document Management
- ✅ Document Upload
- ✅ Document List
- ✅ Document Details Drawer
- ✅ Document Download
- ✅ Document Reanalysis
- ✅ Document Classification Display

#### CRM Integration
- ✅ Customer Sidebar Widget
- ✅ Customer Details Drawer
- ✅ Deal Management
- ✅ Contact Management

#### Feedback System
- ✅ Feedback Buttons Component
- ✅ Feedback API Integration
- ✅ Feedback Metrics Display

#### Other Features
- ✅ Inbox Management
- ✅ Memory Overview
- ✅ Website Builder
- ✅ Command Palette
- ✅ Keyboard Shortcuts

## 🔧 Setup & Installation

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Installation

```bash
# Dependencies installieren
npm install

# Environment Variables setzen
cp .env.example .env
# Bearbeite .env und setze:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Development

```bash
# Development Server starten
npm run dev

# Build für Production
npm run build

# Production Server starten
npm start
```

## 📚 API Integration

### Backend API Proxies

Das Frontend nutzt Next.js API Routes als Proxies zum Backend:

- `/api/feedback` - Feedback API
- `/api/feedback/metrics` - Feedback Metrics
- `/api/documents` - Documents API
- `/api/documents/[documentId]` - Document Details
- `/api/documents/[documentId]/download` - Document Download
- `/api/documents/[documentId]/reanalyze` - Document Reanalysis

### Backend URL

Die Backend URL wird über `NEXT_PUBLIC_BACKEND_URL` konfiguriert (Standard: `http://localhost:8000`).

## 🧪 Testing

### E2E Tests (Playwright)

```bash
# Playwright installieren
npx playwright install

# Tests ausführen
npm run test:e2e

# Tests im UI Mode
npm run test:e2e:ui
```

### Unit Tests (Vitest)

```bash
# Unit Tests ausführen
npm run test

# Watch Mode
npm run test:watch
```

## 🎨 UI Components

### Chat Components

- `ChatShell` - Haupt-Chat-Interface
- `ChatMarkdown` - Markdown-Rendering
- `FeedbackButtons` - Feedback Buttons
- `ThinkingStepsDrawer` - Thinking Steps Visualization
- `FastActionsChips` - Fast Action Buttons

### Document Components

- `DocumentDetailsDrawer` - Document Details
- `DocumentsSidebarWidget` - Document List Widget

### CRM Components

- `CustomerDetailsDrawer` - Customer Details
- `CustomersSidebarWidget` - Customer List Widget

### UI Components

- `AkSearchField` - Search Input
- `WidgetCard` - Card Component
- `CommandPalette` - Command Palette

## 🔐 Security

### API Authentication

Das Frontend nutzt Session-basierte Authentifizierung (wird vom Backend gehandhabt).

### Environment Variables

Sensible Daten sollten über Environment Variables konfiguriert werden:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 🚀 Deployment

### Vercel

```bash
# Vercel CLI installieren
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build
docker build -t frontend .

# Run
docker run -p 3000:3000 frontend
```

## 📖 Weitere Dokumentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📝 License

Proprietary - Alle Rechte vorbehalten

